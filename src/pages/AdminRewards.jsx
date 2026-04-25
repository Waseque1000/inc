import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Trophy, CheckCircle, XCircle, Eye, EyeOff, Copy } from 'lucide-react';

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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center tracking-tight">
            <Trophy className="w-10 h-10 text-amber-500 mr-4 drop-shadow-sm" />
            Rewards Eligibility
          </h1>
          <p className="text-gray-500 mt-1 ml-14">Students who completed at least 60% of daily tasks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEligibleOnly(!showEligibleOnly)}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              showEligibleOnly 
              ? 'bg-[#1e293b] text-white shadow-slate-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-gray-100'
            }`}
          >
            {showEligibleOnly ? 'Show All Students' : 'Show Eligible Only List'}
          </button>
        </div>
      </div>

      {showEligibleOnly ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50 animate-in fade-in zoom-in-95 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tasks</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eligibleStudents.map(student => (
                  <tr key={student._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-900">{student.name}</td>
                    <td className="px-8 py-5 text-gray-600 font-medium">{student.email}</td>
                    <td className="px-8 py-5 text-gray-600 font-medium">{student.phone}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700 border border-amber-200">
                        {student.submissionCount} Days
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(student.email, 'Email')}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Copy Email"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {eligibleStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Trophy className="w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium">No students are eligible for rewards yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {rewards.map(student => (
            <div key={student._id} className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300">
              <div className={`h-2 ${student.isEligible ? 'bg-amber-400' : 'bg-rose-400'}`}></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{student.name}</h3>
                  <button 
                    onClick={() => toggleDetails(student._id)}
                    className={`p-2.5 rounded-2xl transition-all ${expandedStudentId === student._id ? 'bg-[#1e293b] text-cyan-400 shadow-lg shadow-slate-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    title="View Contact Details"
                  >
                    {expandedStudentId === student._id ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {expandedStudentId === student._id && (
                  <div className="mb-6 bg-[#1e293b] rounded-2xl p-5 shadow-2xl border border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Email</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-100 text-sm font-medium truncate max-w-[150px]">{student.email}</span>
                        <button onClick={() => copyToClipboard(student.email, 'Email')} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Phone</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-100 text-sm font-medium">{student.phone}</span>
                        <button onClick={() => copyToClipboard(student.phone, 'Phone')} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-400">Total Submissions</span>
                    <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{student.submissionCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-400">Target Goal</span>
                    <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{student.requiredDays} Days</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${student.isEligible ? 'bg-amber-400' : 'bg-rose-400'}`}
                      style={{ width: `${Math.min((student.submissionCount / student.requiredDays) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {student.isEligible ? (
                    <div className="flex items-center justify-center w-full bg-amber-50 text-amber-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border border-amber-100 shadow-sm">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Eligible for Reward
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full bg-rose-50 text-rose-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border border-rose-100 opacity-60">
                      <XCircle className="w-5 h-5 mr-2" />
                      Incomplete Journey
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {rewards.length === 0 && (
            <div className="col-span-full p-16 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
              <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No students found for this form.</p>
              <p className="text-gray-400 text-sm mt-1">Wait for students to start submitting their tasks.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRewards;
