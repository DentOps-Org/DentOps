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

  // AI Enhancement States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

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

    // Hide suggestion if description changes
    if (e.target.name === 'description') {
      setShowSuggestion(false);
    }
  };

  // AI Enhancement: Call API to expand notes
  const handleEnhanceWithAI = async () => {
    if (!formData.description || formData.description.trim().length === 0) {
      alert('Please enter some brief notes first');
      return;
    }

    setAiLoading(true);
    setShowSuggestion(false);
    
    try {
      const response = await axios.post('/api/ai/expand-notes', {
        notes: formData.description
      });

      if (response.data.success) {
        setAiSuggestion(response.data.data.expandedNotes);
        setShowSuggestion(true);
      } else {
        alert('Failed to generate enhanced notes');
      }
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      alert(error.response?.data?.message || 'Failed to enhance notes with AI. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Accept AI suggestion
  const handleAcceptSuggestion = () => {
    setFormData({
      ...formData,
      description: aiSuggestion
    });
    setShowSuggestion(false);
    setAiSuggestion(null);
  };

  // Discard AI suggestion
  const handleDiscardSuggestion = () => {
    setShowSuggestion(false);
    setAiSuggestion(null);
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

          {/* Description with AI Enhancement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Enter brief treatment notes (e.g., 'cavity tooth 14, composite filling')"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* AI Enhance Button */}
            <div className="mt-2">
              <button
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={aiLoading || !formData.description.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">✨</span>
                {aiLoading ? 'Generating...' : 'Enhance with AI'}
              </button>
              {aiLoading && (
                <span className="ml-3 text-sm text-gray-600 animate-pulse">
                  AI is generating professional notes...
                </span>
              )}
            </div>

            {/* AI Suggestion Preview */}
            {showSuggestion && aiSuggestion && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg shadow-sm animate-fadeIn">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    AI-Generated Professional Notes
                  </h4>
                  <span className="text-xs text-gray-600 italic">✏️ Editable</span>
                </div>
                
                <textarea
                  value={aiSuggestion}
                  onChange={(e) => setAiSuggestion(e.target.value)}
                  rows={8}
                  className="w-full bg-white p-3 rounded border-2 border-blue-300 mb-3 text-gray-800 focus:outline-none focus:border-blue-500 font-sans resize-y"
                  placeholder="AI-generated notes will appear here..."
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptSuggestion}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    ✓ Accept
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardSuggestion}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    ✗ Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleEnhanceWithAI}
                    disabled={aiLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-1"
                  >
                    <span>🔄</span> Regenerate
                  </button>
                </div>
              </div>
            )}
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
