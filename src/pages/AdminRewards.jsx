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
            <div 
              key={student._id} 
              className={`relative rounded-[2.5rem] shadow-2xl shadow-gray-200/30 border-2 transition-all duration-500 flex flex-col group hover:-translate-y-2 ${
                student.isEligible 
                ? 'bg-white border-emerald-500/20 ring-4 ring-emerald-50' 
                : 'bg-white border-gray-100 hover:border-indigo-100'
              }`}
            >
              {/* King Badge for Eligible Students */}
              {student.isEligible && (
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white rounded-full shadow-2xl border-4 border-emerald-50 flex items-center justify-center z-10 animate-bounce-subtle ring-8 ring-white/50">
                  <span className="text-3xl filter drop-shadow-sm">👑</span>
                </div>
              )}

              <div className={`h-2.5 ${student.isEligible ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-400'}`}></div>
              
              <div className="p-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{student.name}</h3>
                    {student.isEligible && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Master of Tasks</p>}
                  </div>
                  <button 
                    onClick={() => toggleDetails(student._id)}
                    className={`p-3 rounded-2xl transition-all ${expandedStudentId === student._id ? 'bg-[#1e293b] text-cyan-400 shadow-xl shadow-slate-200' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    {expandedStudentId === student._id ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {expandedStudentId === student._id && (
                  <div className="mb-8 bg-[#1e293b] rounded-3xl p-6 shadow-inner border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Email</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-200 text-sm font-medium">{student.email}</span>
                          <button onClick={() => copyToClipboard(student.email, 'Email')} className="text-cyan-400 hover:scale-110 transition-transform">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Phone</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-200 text-sm font-medium">{student.phone}</span>
                          <button onClick={() => copyToClipboard(student.phone, 'Phone')} className="text-cyan-400 hover:scale-110 transition-transform">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-5 mb-10 flex-grow">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold">Performance</span>
                    <span className={`px-4 py-1.5 rounded-xl font-black text-xs ${student.isEligible ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                      {student.submissionCount} / {student.requiredDays} Submissions
                    </span>
                  </div>
                  
                  {/* High-End Progress Bar */}
                  <div className="relative pt-2">
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 relative ${
                          student.isEligible 
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                          : 'bg-gradient-to-r from-rose-300 to-rose-500'
                        }`}
                        style={{ width: `${Math.min((student.submissionCount / student.requiredDays) * 100, 100)}%` }}
                      >
                        {student.isEligible && <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {student.isEligible ? (
                    <div className="relative group/btn">
                      <div className="absolute -inset-1 bg-emerald-400 rounded-2xl blur opacity-25 group-hover/btn:opacity-50 transition duration-1000 group-hover/btn:duration-200"></div>
                      <div className="relative flex items-center justify-center w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-[0.98] transition-all">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Eligible for Reward
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full bg-rose-50 text-rose-700/40 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-rose-100/50">
                      <XCircle className="w-4 h-4 mr-2" />
                      Keep Going
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
