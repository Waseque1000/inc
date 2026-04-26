import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Trophy, CheckCircle, XCircle, Eye, EyeOff, Copy } from 'lucide-react';
import Loader from '../components/Loader';

const AdminRewards = () => {
  const { formId } = useParams();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  
  // Student details toggle state
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const toggleDetails = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied!`);
  };

  useEffect(() => {
    fetchRewards();
  }, [formId]);

  const fetchRewards = async () => {
    try {
      const res = await api.get(`/submissions/rewards/${formId}`);
      setRewards(res.data);
    } catch (err) {
      toast.error('Failed to fetch rewards data');
    } finally {
      setLoading(false);
    }
  };

  const eligibleStudents = rewards.filter(s => s.isEligible);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 text-amber-500 mr-3" />
            Rewards Eligibility
          </h1>
          <p className="text-sm text-gray-500 mt-1">Students with 60%+ completion rate</p>
        </div>
        <button
          onClick={() => setShowEligibleOnly(!showEligibleOnly)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
            showEligibleOnly 
            ? 'bg-gray-900 text-white border-gray-900' 
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {showEligibleOnly ? 'Show All Students' : 'Show Eligible Only'}
        </button>
      </div>

      {showEligibleOnly ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tasks</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {eligibleStudents.map(student => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{student.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{student.email}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{student.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        {student.submissionCount} Days
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => copyToClipboard(student.email, 'Email')}
                        className="text-gray-400 hover:text-gray-900"
                        title="Copy Email"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(student => (
            <div 
              key={student._id} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{student.email}</p>
                </div>
                <div className={`p-2 rounded-lg ${student.isEligible ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  {student.isEligible ? <CheckCircle className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Progress</span>
                  <span>{student.submissionCount} / {student.requiredDays}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${student.isEligible ? 'bg-green-500' : 'bg-gray-400'}`}
                    style={{ width: `${Math.min((student.submissionCount / student.requiredDays) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => copyToClipboard(student.email, 'Email')}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
                >
                  Copy Contact
                </button>
                <div className={`text-[10px] font-bold px-2 py-1 rounded ${student.isEligible ? 'text-green-600 bg-green-50 border border-green-100' : 'text-gray-400 bg-gray-50 border border-gray-100'}`}>
                  {student.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRewards;
