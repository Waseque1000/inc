import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle, XCircle, Users, Search, Trash2, ArrowRight, Box } from 'lucide-react';
import Loader from '../components/Loader';

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

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {isUpdating && <Loader />}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Member List Management</h1>
        <p className="text-gray-500">Manage the master enrollment list for your forms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Form Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Forms
            </h2>
            <div className="space-y-2">
              {forms.map(form => (
                <button
                  key={form._id}
                  onClick={() => setSelectedForm(form)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border ${
                    selectedForm?._id === form._id 
                      ? 'bg-gray-900 border-gray-900 text-white' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center text-left">
                    <Box className={`w-4 h-4 mr-2.5 ${selectedForm?._id === form._id ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium truncate">{form.formName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
              {forms.length === 0 && (
                <p className="text-xs text-gray-400 py-4 text-center">No forms found</p>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Management */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedForm ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center text-gray-500">
              <FileText className="w-10 h-10 mb-4 opacity-20" />
              <p className="text-sm">Select a form to manage enrollment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Actions Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedForm.formName}</h2>
                    <p className="text-sm text-gray-500">Manage master student list (CSV/XLSX)</p>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Updating...' : 'Upload List'}
                      <input type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={isUpdating} />
                    </label>
                    <button 
                      onClick={clearEnrollment}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                      title="Clear List"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Emails List Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">Enrolled List</span>
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {selectedForm.enrolledEmails?.length || 0}
                    </span>
                    <div className="flex items-center text-green-700 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Verified: {selectedForm.enrolledEmails?.filter(e => submittedEmails.has(e.toLowerCase())).length || 0}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowVerifiedDetails(!showVerifiedDetails)}
                      className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {showVerifiedDetails ? 'Show All' : 'Show Verified'}
                    </button>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition-colors w-40 md:w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {showVerifiedDetails ? (
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {submittedData
                          .filter(student => selectedForm.enrolledEmails?.some(e => e.toLowerCase() === student.email.toLowerCase()))
                          .map((student, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                              <td className="px-6 py-3 text-sm text-gray-600">{student.email}</td>
                              <td className="px-6 py-3 text-sm text-gray-600">{student.phone || '—'}</td>
                            </tr>
                          ))}
                        {submittedData.filter(student => selectedForm.enrolledEmails?.some(e => e.toLowerCase() === student.email.toLowerCase())).length === 0 && (
                          <tr>
                            <td colSpan="3" className="px-6 py-10 text-center text-gray-400 text-sm">No verified contacts yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Email</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredEmails.map((email, idx) => {
                          const hasSubmitted = submittedEmails.has(email.toLowerCase());
                          return (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 text-sm text-gray-600 font-medium">
                                {email}
                              </td>
                              <td className="px-6 py-3 text-right">
                                {hasSubmitted ? (
                                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">VERIFIED</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">PENDING</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredEmails.length === 0 && (
                          <tr>
                            <td colSpan="2" className="px-6 py-10 text-center text-gray-400 text-sm">
                              {searchTerm ? 'No results found' : 'No students enrolled'}
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
