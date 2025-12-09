const Availability = require('../models/Availability');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const AppointmentType = require('../models/AppointmentType');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/** Helpers **/
function parseTimeToDate(targetDate, hhmm) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const d = new Date(targetDate);
  d.setHours(hh, mm, 0, 0);
  return d;
}
function addMinutes(d, mins) {
  return new Date(d.getTime() + mins * 60000);
}
function formatHHMM(d) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * GET availability (all blocks for a dentist)
 * GET /api/availability/:dentalStaffId
 */
exports.getAvailability = async (req, res) => {
  try {
    const { dentalStaffId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(dentalStaffId)) {
      return res.status(400).json({ success: false, message: 'Invalid dentalStaffId' });
    }

    const dentalStaff = await User.findById(dentalStaffId);
    if (!dentalStaff || dentalStaff.role !== 'DENTAL_STAFF') {
      return res.status(400).json({ success: false, message: 'Invalid dental staff member' });
    }

    const availability = await Availability.find({ dentalStaffId }).sort({ weekday: 1, startTimeOfDay: 1 });
    return res.status(200).json({ success: true, count: availability.length, data: availability });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * CREATE availability
 * POST /api/availability
 * (Route should be protected & authorized)
 */
exports.createAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { dentalStaffId, weekday, startTimeOfDay, endTimeOfDay } = req.body;

    if (!mongoose.Types.ObjectId.isValid(dentalStaffId)) {
      return res.status(400).json({ success: false, message: 'Invalid dentalStaffId' });
    }

    const dentalStaff = await User.findById(dentalStaffId);
    if (!dentalStaff || dentalStaff.role !== 'DENTAL_STAFF') {
      return res.status(400).json({ success: false, message: 'Invalid dental staff member' });
    }

    // Ensure start < end
    const sample = new Date();
    const s = parseTimeToDate(sample, startTimeOfDay);
    const e = parseTimeToDate(sample, endTimeOfDay);
    if (s >= e) return res.status(400).json({ success: false, message: 'startTimeOfDay must be before endTimeOfDay' });

    // Enforce uniqueness: one block per weekday per staff
    // For eg. Monday:
    // 09:00–12:00
    // 14:00–17:00   ❌ not allowed
    // Monday:
    // 09:00–17:00   ✅ 1 block only
    const exists = await Availability.findOne({ dentalStaffId, weekday });
    if (exists) return res.status(400).json({ success: false, message: 'Availability for this weekday already exists for the staff' });

    const availability = await Availability.create({ dentalStaffId, weekday, startTimeOfDay, endTimeOfDay });
    return res.status(201).json({ success: true, data: availability });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Availability for this weekday already exists for the staff' });
    }
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * UPDATE availability (FULL REPLACE)
 * PUT /api/availability/:id
 * (Route should be protected & authorized)
 */
exports.updateAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid availability id' });

    const { dentalStaffId, weekday, startTimeOfDay, endTimeOfDay } = req.body;

    if (!mongoose.Types.ObjectId.isValid(dentalStaffId)) {
      return res.status(400).json({ success: false, message: 'Invalid dentalStaffId' });
    }

    const dentalStaff = await User.findById(dentalStaffId);
    if (!dentalStaff || dentalStaff.role !== 'DENTAL_STAFF') {
      return res.status(400).json({ success: false, message: 'Invalid dental staff member' });
    }

    // Ensure start < end
    const sample = new Date();
    const s = parseTimeToDate(sample, startTimeOfDay);
    const e = parseTimeToDate(sample, endTimeOfDay);
    if (s >= e) return res.status(400).json({ success: false, message: 'startTimeOfDay must be before endTimeOfDay' });

    const availability = await Availability.findById(id);
    if (!availability) return res.status(404).json({ success: false, message: 'Availability block not found' });

    // If changing staff or weekday ensure no conflict
    if (String(availability.dentalStaffId) !== String(dentalStaffId) || availability.weekday !== weekday) {
      const conflict = await Availability.findOne({ dentalStaffId, weekday, _id: { $ne: availability._id } });
      if (conflict) return res.status(400).json({ success: false, message: 'Another availability block for this staff & weekday already exists' });
    }

    // Full replace
    availability.dentalStaffId = dentalStaffId;
    availability.weekday = weekday;
    availability.startTimeOfDay = startTimeOfDay;
    availability.endTimeOfDay = endTimeOfDay;
    await availability.save();

    return res.status(200).json({ success: true, data: availability });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Availability conflict' });
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * DELETE availability (hard delete)
 * DELETE /api/availability/:id
 * (Route should be protected & authorized)
 */
exports.deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid availability id' });

    const availability = await Availability.findById(id);
    if (!availability) return res.status(404).json({ success: false, message: 'Availability block not found' });

    await availability.deleteOne();
    return res.status(200).json({ success: true, message: 'Availability deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET free windows — simplified rules ,TODO:check this ....
exports.getFreeWindows = async (req, res) => {
  try {
    const { dentalStaffId } = req.params;
    const { date, appointmentTypeId, durationMinutes, slotIntervalMinutes } = req.query;

    if (!date) return res.status(400).json({ success: false, message: 'date query param is required (YYYY-MM-DD)' });
    if (!mongoose.Types.ObjectId.isValid(dentalStaffId)) return res.status(400).json({ success: false, message: 'Invalid dentalStaffId' });

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) return res.status(400).json({ success: false, message: 'Invalid date' });

    const dentalStaff = await User.findById(dentalStaffId);
    if (!dentalStaff || dentalStaff.role !== 'DENTIST') { //TODO:check here
      return res.status(400).json({ success: false, message: 'Invalid dental staff member' });
    }

    // determine duration (appointmentType priority)
    let duration = durationMinutes ? parseInt(durationMinutes, 10) : null;
    if (!duration && appointmentTypeId && mongoose.Types.ObjectId.isValid(appointmentTypeId)) {
      const at = await AppointmentType.findById(appointmentTypeId);
      if (at) duration = at.durationMinutes;
    }
    if (!duration) duration = 30; // this is by default 30 here

    const slotInterval = slotIntervalMinutes ? parseInt(slotIntervalMinutes, 10) : 15; //TODO:why is this needed
    
    // Fetch single block for weekday (one-per-weekday rule)
    const weekday = targetDate.getDay();
    const block = await Availability.findOne({ dentalStaffId, weekday });
    if (!block) return res.status(200).json({ success: true, count: 0, data: [] });

    const blockStart = parseTimeToDate(targetDate, block.startTimeOfDay);
    const blockEnd = parseTimeToDate(targetDate, block.endTimeOfDay);

    // Fetch existing CONFIRMED appointments for that day (these block slots)
    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

    // only CONFIRMED block slots (PENDING without startTime won't block)
    const existingConfirmed = await Appointment.find({
      dentalStaffId,
      status: 'CONFIRMED',
      startTime: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ startTime: 1 });

    // Generate candidate slots: start must be inside [blockStart, blockEnd)
    const freeWindows = [];
    let cursor = new Date(blockStart);

    while (cursor < blockEnd) {
      const slotEnd = addMinutes(cursor, duration);

      // Conflict if overlaps any confirmed appointment
      const conflict = existingConfirmed.some(appt => {
        const s = new Date(appt.startTime);
        const e = new Date(appt.endTime);
        return (cursor < e && slotEnd > s); // overlap check
      });

      if (!conflict) {
        freeWindows.push({
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

    return res.status(200).json({ success: true, count: freeWindows.length, data: freeWindows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};