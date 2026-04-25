import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle, XCircle, Users, Search, Trash2, ArrowRight } from 'lucide-react';

const AdminEnrollment = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedEmails, setSubmittedEmails] = useState(new Set());
  const [submittedData, setSubmittedData] = useState([]);
  const [showVerifiedDetails, setShowVerifiedDetails] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      fetchSubmittedEmails();
    }
  }, [selectedForm]);

  const fetchSubmittedEmails = async () => {
    try {
      const res = await api.get(`/submissions/structured/${selectedForm._id}`);
      setSubmittedData(res.data);
      const emails = new Set(res.data.map(s => s.email.toLowerCase()));
      setSubmittedEmails(emails);
    } catch (err) {
      console.error('Failed to fetch submitted emails');
    }
  };

  const fetchForms = async () => {
    try {
      const res = await api.get('/forms');
      setForms(res.data);
    } catch (err) {
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedForm) return;

    setIsUpdating(true);
    const reader = new FileReader();

    const processEmails = async (data) => {
      try {
        const emails = data.map(row => {
          const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
          return row[emailKey];
        }).filter(email => email && email.includes('@')).map(e => e.trim().toLowerCase());

        const uniqueEmails = [...new Set(emails)];

        if (uniqueEmails.length === 0) {
          toast.error('No emails found in file.');
          setIsUpdating(false);
          return;
        }

        const res = await api.put(`/forms/enrollment/${selectedForm._id}`, { emails: uniqueEmails });
        setSelectedForm(res.data);
        fetchForms();
        toast.success(`Successfully enrolled ${uniqueEmails.length} students`);
      } catch (err) {
        toast.error('Failed to update enrollment list');
      } finally {
        setIsUpdating(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processEmails(results.data)
      });
    } else {
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        processEmails(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const clearEnrollment = async () => {
    if (!window.confirm('Are you sure you want to clear the entire master list?')) return;
    try {
      setIsUpdating(true);
      const res = await api.put(`/forms/enrollment/${selectedForm._id}`, { emails: [] });
      setSelectedForm(res.data);
      fetchForms();
      toast.success('Master list cleared');
    } catch (err) {
      toast.error('Failed to clear list');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredEmails = selectedForm?.enrolledEmails?.filter(email => 
    email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Member List Management</h1>
        <p className="text-gray-500">Manage the master enrollment list for your forms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Form Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-indigo-400" />
              Form Campaigns
            </h2>
            <div className="space-y-3">
              {forms.map(form => (
                <button
                  key={form._id}
                  onClick={() => setSelectedForm(form)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group border ${
                    selectedForm?._id === form._id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-x-1 md:-translate-x-2' 
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center text-left">
                    <Box className={`w-4 h-4 mr-3 ${selectedForm?._id === form._id ? 'text-indigo-200' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                    <span className="text-sm font-bold truncate max-w-[140px] md:max-w-none">{form.formName}</span>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${selectedForm?._id === form._id ? 'text-white' : 'text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1'} transition-all`} />
                </button>
              ))}
              {forms.length === 0 && (
                <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No forms found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Management */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedForm ? (
            <div className="bg-white p-12 md:p-20 rounded-[2rem] border border-gray-200 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Select a Campaign</h3>
              <p className="text-gray-500 max-w-xs mt-2 text-sm">Please select a form from the list to manage its master student list and verification status.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              {/* Actions Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedForm.formName}</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload a CSV/XLSX to set the master student list.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Updating...' : 'Upload Member List'}
                      <input type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={isUpdating} />
                    </label>
                    <button 
                      onClick={clearEnrollment}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
                      title="Clear List"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Emails List Card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-900">Enrolled Master List</span>
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">{selectedForm.enrolledEmails?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <CheckCircle className="w-3.5 h-3.5 mr-2" />
                      <span className="text-xs font-bold whitespace-nowrap">
                        Verified: {selectedForm.enrolledEmails?.filter(e => submittedEmails.has(e.toLowerCase())).length || 0} / {selectedForm.enrolledEmails?.length || 0}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowVerifiedDetails(!showVerifiedDetails)}
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                    >
                      {showVerifiedDetails ? 'Hide Contact List' : 'View Contact List'}
                    </button>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search email..." 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {showVerifiedDetails ? (
                  <div className="animate-in slide-in-from-top-4 duration-300">
                    <div className="px-8 py-4 bg-emerald-50/50 border-y border-emerald-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                        <Users className="w-3 h-3 mr-2" />
                        Verified Contact Details
                      </span>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50/80 sticky top-0 z-10">
                          <tr>
                            <th className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                            <th className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {submittedData
                            .filter(student => selectedForm.enrolledEmails?.some(e => e.toLowerCase() === student.email.toLowerCase()))
                            .map((student, i) => (
                              <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                                <td className="px-8 py-4 text-sm font-bold text-gray-900">{student.name}</td>
                                <td className="px-8 py-4 text-sm text-gray-600 font-mono">{student.email}</td>
                                <td className="px-8 py-4 text-sm text-gray-600">{student.phone || 'N/A'}</td>
                              </tr>
                            ))}
                          {submittedData.filter(student => selectedForm.enrolledEmails?.some(e => e.toLowerCase() === student.email.toLowerCase())).length === 0 && (
                            <tr>
                              <td colSpan="3" className="px-8 py-12 text-center text-gray-400 italic">No verified contacts found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Email</th>
                          <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredEmails.map((email, idx) => {
                          const hasSubmitted = submittedEmails.has(email.toLowerCase());
                          return (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-8 py-4 text-sm text-gray-600 font-mono flex items-center justify-between">
                                {email}
                                {hasSubmitted ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white shadow-sm">VERIFIED</span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-gray-100 text-gray-400 border border-gray-200">PENDING</span>
                                )}
                              </td>
                              <td className="px-8 py-4 text-right">
                                <button className="text-gray-300 hover:text-rose-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredEmails.length === 0 && (
                          <tr>
                            <td colSpan="2" className="px-8 py-12 text-center text-gray-400 italic">
                              {searchTerm ? 'No matching emails found' : 'No students enrolled yet'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollment;
