// src/pages/Records/CreatePatientRecord.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function CreatePatientRecord() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  
  const [formData, setFormData] = useState({
    patientEmail: searchParams.get('patientEmail') || '',
    appointmentId: searchParams.get('appointmentId') || '',
    type: 'NOTE',
    title: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [patientVerified, setPatientVerified] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);

  const verifyPatient = async () => {
    if (!formData.patientEmail) {
      alert('Please enter patient email');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/users?email=${formData.patientEmail}&role=PATIENT`);
      const patients = res.data?.data || [];
      
      if (patients.length === 0) {
        alert('No patient found with this email');
        setPatientVerified(false);
        setPatientInfo(null);
      } else {
        setPatientVerified(true);
        setPatientInfo(patients[0]);
        alert(`Patient verified: ${patients[0].fullName}`);
      }
    } catch (err) {
      alert('Failed to verify patient email');
      setPatientVerified(false);
      setPatientInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientVerified) {
      alert('Please verify patient email first');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/records', {
        patientId: patientInfo._id,
        appointmentId: formData.appointmentId || undefined,
        type: formData.type,
        title: formData.title,
        description: formData.description
      });
      alert('Patient record created successfully!');
      navigate('/records');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Reset verification if email changes
    if (e.target.name === 'patientEmail') {
      setPatientVerified(false);
      setPatientInfo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Patient Record</h2>
          <Link to="/records" className="text-blue-600 hover:text-blue-800">← Back to Records</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Email with Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Email *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleChange}
                required
                placeholder="patient@example.com"
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={verifyPatient}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {patientVerified && patientInfo && (
              <div className="mt-1 text-sm text-green-600">
                ✓ Verified: {patientInfo.fullName}
              </div>
            )}
          </div>

          {/* Record Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="NOTE">Clinical Note</option>
              <option value="PRESCRIPTION">Prescription</option>
              <option value="XRAY">X-Ray</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Dental Cleaning, Root Canal Treatment"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Enter detailed notes, observations, treatment details, etc."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !patientVerified}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Record'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/records')}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          {!patientVerified && (
            <div className="text-sm text-gray-500">
              * Please verify patient email before creating the record
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}
