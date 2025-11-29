// controllers/appointments.js
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const AppointmentType = require('../models/AppointmentType');
const Availability = require('../models/Availability'); // optional: used by getAvailableSlots wrapper

/* Helpers */
function addMinutes(date, mins) { return new Date(date.getTime() + mins * 60000); }
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function formatHHMM(d) { return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); }
function parseTimeToDate(targetDate, hhmm) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const d = new Date(targetDate);
  d.setHours(hh, mm, 0, 0);
  return d;
}

/* -------------------------
  Patient: create a request (PENDING)
  POST /api/appointments/
  body: { appointmentTypeId, requestedDate (YYYY-MM-DD), notes? }
--------------------------*/
exports.createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

    const patientId = req.user.id;
    const { appointmentTypeId, requestedDate, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appointmentTypeId)) {
      return res.status(400).json({ success:false, message: 'Invalid appointmentTypeId' });
    }
    const at = await AppointmentType.findById(appointmentTypeId);
    if (!at) return res.status(400).json({ success:false, message: 'Appointment type not found' });

    const date = new Date(requestedDate);
    if (isNaN(date.getTime())) return res.status(400).json({ success:false, message: 'Invalid requestedDate' });

    const appt = await Appointment.create({
      patientId,
      appointmentTypeId,
      requestedDate: date,
      notes
    });

    return res.status(201).json({ success:true, data: appt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};

/* -------------------------
  Manager: list pending requests (FCFS)
  GET /api/appointments/requests
  (manager only)
--------------------------*/
exports.listRequests = async (req, res) => {
  try {
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({ success:false, message: 'Only clinic manager' });
    }

    const { status = 'PENDING' } = req.query;
    const reqs = await Appointment.find({ status })
      .populate('patientId', 'fullName email phone')
      .populate('appointmentTypeId', 'name durationMinutes')
      .sort({ createdAt: 1 });

    return res.status(200).json({ success:true, count: reqs.length, data: reqs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};

/* -------------------------
  Manager: confirm/assign a pending request
  POST /api/appointments/:id/confirm
  body: { dentalStaffId, startTime (ISO string) }
  (Manager supplies startTime; server calculates endTime)
--------------------------*/
exports.confirmAppointment = async (req, res) => {
  try {
    if (req.user.specialization !== 'CLINIC_MANAGER') {
      return res.status(403).json({ success:false, message: 'Only clinic manager' });
    }

    const { id } = req.params;
    const { dentalStaffId, startTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(dentalStaffId)) {
      return res.status(400).json({ success:false, message: 'Invalid id(s)' });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ success:false, message: 'Appointment not found' });
    if (appt.status !== 'PENDING') return res.status(400).json({ success:false, message: 'Only PENDING can be confirmed' });

    const staff = await User.findById(dentalStaffId);
    if (!staff || staff.role !== 'DENTAL_STAFF') return res.status(400).json({ success:false, message: 'Invalid dental staff' });

    const at = await AppointmentType.findById(appt.appointmentTypeId);
    if (!at) return res.status(400).json({ success:false, message: 'Appointment type not found' });

    const s = new Date(startTime);
    if (isNaN(s.getTime())) return res.status(400).json({ success:false, message: 'Invalid startTime' });

    // VALIDATE AGAINST AVAILABILITY WINDOW
    const weekday = s.getDay(); // 0-6 (Sunday-Saturday)
    const block = await Availability.findOne({ dentalStaffId, weekday });

    if (!block) {
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      return res.status(400).json({ 
        success: false, 
        message: `Dentist is not available on ${dayNames[weekday]}s` 
      });
    }

    // Parse availability times to compare
    const [avStartHour, avStartMin] = block.startTimeOfDay.split(':').map(Number);
    const [avEndHour, avEndMin] = block.endTimeOfDay.split(':').map(Number);

    // Create Date objects for comparison on the same day as appointment
    const availStart = new Date(s);
    availStart.setHours(avStartHour, avStartMin, 0, 0);

    const availEnd = new Date(s);
    availEnd.setHours(avEndHour, avEndMin, 0, 0);

    // compute endTime from appointmentType.durationMinutes
    const duration = Number(at.durationMinutes) || 15;
    const e = addMinutes(s, duration);

    // Validate appointment start falls within availability window
    if (s < availStart || s >= availEnd) {
      return res.status(400).json({ 
        success: false, 
        message: `Appointment start time must be between ${block.startTimeOfDay} and ${block.endTimeOfDay}` 
      });
    }

    // Validate appointment end doesn't exceed availability window
    if (e > availEnd) {
      return res.status(400).json({ 
        success: false, 
        message: `Appointment end time (${formatHHMM(e)}) exceeds dentist's working hours (ends at ${block.endTimeOfDay})` 
      });
    }

    // conflict check: only CONFIRMED appointments for this dentist block
    const conflict = await Appointment.findOne({
      dentalStaffId,
      status: 'CONFIRMED',
      startTime: { $lt: e },
      endTime: { $gt: s },
      _id: { $ne: appt._id }
    });

    if (conflict) {
      return res.status(400).json({ success:false, message: 'Chosen slot conflicts with an existing confirmed appointment' });
    }

    // assign & confirm
    appt.dentalStaffId = dentalStaffId;
    appt.startTime = s;
    appt.endTime = e;
    appt.status = 'CONFIRMED';

    // Save which availability block was used (block is guaranteed to exist now)
    appt.availabilityId = block._id;

    await appt.save();
    return res.status(200).json({ success:true, data: appt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};

/* -------------------------
  Get available slots (thin wrapper)
  GET /api/appointments/available?dentalStaffId=&date=&appointmentTypeId=
  Uses same simple rules: start must be inside availability block; only CONFIRMED block
--------------------------*/
exports.getAvailableSlots = async (req, res) => {
  try {
    const { dentalStaffId, date, appointmentTypeId, durationMinutes, slotIntervalMinutes } = req.query;
    if (!dentalStaffId || !date) return res.status(400).json({ success:false, message: 'dentalStaffId and date required' });
    if (!mongoose.Types.ObjectId.isValid(dentalStaffId)) return res.status(400).json({ success:false, message: 'Invalid dentalStaffId' });

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) return res.status(400).json({ success:false, message: 'Invalid date' });

    const staff = await User.findById(dentalStaffId);
    if (!staff || staff.role !== 'DENTAL_STAFF') return res.status(400).json({ success:false, message: 'Invalid dental staff' });

    let duration = durationMinutes ? parseInt(durationMinutes, 10) : null;
    if (!duration && appointmentTypeId && mongoose.Types.ObjectId.isValid(appointmentTypeId)) {
      const at = await AppointmentType.findById(appointmentTypeId);
      if (at) duration = at.durationMinutes;
    }
    if (!duration) duration = 30;
    const slotInterval = slotIntervalMinutes ? parseInt(slotIntervalMinutes, 10) : 30;

    // find availability block for weekday
    const weekday = targetDate.getDay();
    const block = await Availability.findOne({ dentalStaffId, weekday });
    if (!block) return res.status(200).json({ success:true, count:0, data: [] });

    const blockStart = parseTimeToDate(targetDate, block.startTimeOfDay);
    const blockEnd = parseTimeToDate(targetDate, block.endTimeOfDay);

    // fetch confirmed appointments on that date only
    const confirmed = await Appointment.find({
      dentalStaffId,
      status: 'CONFIRMED',
      startTime: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) }
    }).sort({ startTime: 1 });

    const blocked = confirmed.map(a => ({ start: new Date(a.startTime), end: new Date(a.endTime) }));

    // generate slots
    const slots = [];
    let cursor = new Date(blockStart);
    while (cursor < blockEnd) {
      const slotEnd = addMinutes(cursor, duration);

      const conflict = blocked.some(b => (cursor < b.end && slotEnd > b.start));
      if (!conflict) {
        slots.push({
          start: new Date(cursor),
          end: new Date(slotEnd),
          startIso: new Date(cursor).toISOString(),
          endIso: new Date(slotEnd).toISOString(),
          startHHMM: formatHHMM(cursor),
          endHHMM: formatHHMM(slotEnd)
        });
      }
      cursor = addMinutes(cursor, slotInterval);
    }

    return res.status(200).json({ success:true, count: slots.length, data: slots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};

/* -------------------------
  Cancel appointment (patient, dentist-assigned or manager can cancel)
  PATCH /api/appointments/:id/cancel  body: { reason? }
--------------------------*/
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success:false, message: 'Invalid id' });

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ success:false, message: 'Appointment not found' });

    const role = req.user.role;
    const uid = req.user.id;

    if (role === 'PATIENT' && String(appt.patientId) !== String(uid)) return res.status(403).json({ success:false, message: 'Forbidden' });
    if (role === 'DENTAL_STAFF' && appt.dentalStaffId && String(appt.dentalStaffId) !== String(uid)) return res.status(403).json({ success:false, message: 'Forbidden' });

    appt.status = 'CANCELLED';
    appt.cancellationReason = req.body.reason || '';
    await appt.save();

    return res.status(200).json({ success:true, data: appt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};

/* -------------------------
  Get single appointment
  GET /api/appointments/:id
--------------------------*/
exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success:false, message: 'Invalid id' });

    const appt = await Appointment.findById(id)
      .populate('patientId', 'fullName email')
      .populate('dentalStaffId', 'fullName email')
      .populate('appointmentTypeId', 'name durationMinutes');

    if (!appt) return res.status(404).json({ success:false, message: 'Appointment not found' });

    const role = req.user.role;
    const uid = req.user.id;
    if (req.user.specialization === 'CLINIC_MANAGER' ||
        (role === 'PATIENT' && String(appt.patientId._id) === String(uid)) ||
        (role === 'DENTAL_STAFF' && appt.dentalStaffId && String(appt.dentalStaffId._id) === String(uid))) {
      return res.status(200).json({ success:true, data: appt });
    }
    return res.status(403).json({ success:false, message: 'Forbidden' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};

/* -------------------------
  Delete appointment (manager only) - HARD DELETE
  DELETE /api/appointments/:id
--------------------------*/
exports.deleteAppointment = async (req, res) => {
  try {
    if (req.user.specialization !== 'CLINIC_MANAGER') return res.status(403).json({ success:false, message: 'Only clinic manager' });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success:false, message: 'Invalid id' });

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ success:false, message: 'Appointment not found' });

    await appt.deleteOne();
    return res.status(200).json({ success:true, message: 'Appointment deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};

/* -------------------------
  Update appointment metadata (manager only)
  PUT /api/appointments/:id
  (do not allow changing status here)
--------------------------*/
exports.updateAppointment = async (req, res) => {
  try {
    if (req.user.specialization !== 'CLINIC_MANAGER') return res.status(403).json({ success:false, message: 'Only clinic manager' });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success:false, message: 'Invalid id' });

    const update = { ...req.body };
    delete update.status; // enforce status changes via dedicated endpoints //TODO:why this here???
    const appt = await Appointment.findByIdAndUpdate(id, update, { new:true, runValidators:true });
    if (!appt) return res.status(404).json({ success:false, message: 'Appointment not found' });

    return res.status(200).json({ success:true, data: appt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};


// controllers/appointments.js (add this function)
exports.getAppointments = async (req, res) => {
  try {
    const user = req.user;
    const { patientId, dentalStaffId, status } = req.query;

    const query = {};

    // If caller is a patient, restrict to their own records only
    if (user.role === 'PATIENT') {
      query.patientId = user.id;
    } else {
      // For staff/manager, allow queries via query params
      if (patientId) {
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
          return res.status(400).json({ success:false, message: 'Invalid patientId' });
        }
        query.patientId = patientId;
      }
      if (dentalStaffId) {
        if (!mongoose.Types.ObjectId.isValid(dentalStaffId)) {
          return res.status(400).json({ success:false, message: 'Invalid dentalStaffId' });
        }
        query.dentalStaffId = dentalStaffId;
      }
    }

    if (status) {
      // ensure allowed statuses only
      const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success:false, message: 'Invalid status filter' });
      }
      query.status = status;
    }

    const appts = await Appointment.find(query)
      .populate('patientId', 'fullName email')
      .populate('dentalStaffId', 'fullName email specialization')
      .populate('appointmentTypeId', 'name durationMinutes')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success:true, count: appts.length, data: appts });
  } catch (err) {
    console.error('getAppointments error', err);
    return res.status(500).json({ success:false, message: 'Server Error' });
  }
};
