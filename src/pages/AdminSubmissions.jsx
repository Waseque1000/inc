import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeft, Download, Edit2, Check, X, Eye, EyeOff, Copy, BarChart3, Users, Clock, AlertCircle, Link as LinkIcon, FileCheck, Upload, Trash2, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Loader from '../components/Loader';


// Submission Management Component
const AdminSubmissions = () => {
  const { formId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table', 'analytics', 'enrollment'
  
  const [enrollmentResults, setEnrollmentResults] = useState(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);
  // Inline edit state
  const [editContext, setEditContext] = useState({ id: null, field: null, customKey: null });
  const [editValue, setEditValue] = useState('');
  const [pdfDays, setPdfDays] = useState('all');

  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [formSlug, setFormSlug] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPendingGuidelines: 0,
    highestModule: 0,
    moduleDistribution: []
  });
  const [formConfig, setFormConfig] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCheckingEnrollment(true);
    const reader = new FileReader();

    const processEmails = async (data) => {
      try {
        const emails = data.map(row => {
          const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
          return row[emailKey];
        }).filter(email => email && email.includes('@'));

        if (emails.length === 0) {
          toast.error('No emails found in file. Ensure there is an "email" column.');
          setIsCheckingEnrollment(false);
          return;
        }

        const res = await api.post(`/submissions/check-emails/${formId}`, { emails });
        setEnrollmentResults(res.data);
        setView('enrollment');
        toast.success(`Checked ${res.data.length} students from file`);
      } catch (err) {
        toast.error('Failed to verify enrollment');
      } finally {
        setIsCheckingEnrollment(false);
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
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processEmails(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const toggleDetails = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied!`);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [formId]);

  const fetchSubmissions = async () => {
    try {
      const [subRes, statsRes, formRes] = await Promise.all([
        api.get(`/submissions/structured/${formId}`),
        api.get(`/submissions/stats/${formId}`),
        api.get(`/forms/id/${formId}`)
      ]);
      setData(subRes.data);
      setStats(statsRes.data);
      setFormConfig(formRes.data);
      setFormSlug(formRes.data.formSlug);

      // If form has saved enrollment emails, auto-calculate results
      if (formRes.data.enrolledEmails && formRes.data.enrolledEmails.length > 0) {
        const submittedEmails = new Set();
        subRes.data.forEach(student => {
          if (student.submissions && student.submissions.length > 0) {
            submittedEmails.add(student.email.toLowerCase());
          }
        });

        const results = formRes.data.enrolledEmails.map(email => ({
          email,
          hasSubmitted: submittedEmails.has(email.toLowerCase())
        }));
        setEnrollmentResults(results);
      }
    } catch (err) {
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // If we have many dates, use landscape orientation
    let pdfDates = sortedDates;
    if (pdfDays !== 'all') {
      const days = parseInt(pdfDays);
      pdfDates = sortedDates.slice(-days);
    }

    const doc = new jsPDF({
      orientation: pdfDates.length > 5 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(16);
    doc.text('Student Daily Task Report', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Range: ${pdfDays === 'all' ? 'All Data' : `Last ${pdfDays} Days`}`, 14, 22);
    
    const head = [['Name', ...pdfDates, 'Assigned Next']];
    const body = data.map(student => {
      const row = [student.name];
      pdfDates.forEach(date => {
        const sub = student.submissions.find(s => s.date === date);
        let cellText = sub ? sub.currentModule : '-';
        if (sub?.customData && Object.keys(sub.customData).length > 0) {
          const custom = Object.entries(sub.customData)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          cellText += `\n(${custom})`;
        }
        row.push(cellText);
      });
      const latestSub = student.submissions[student.submissions.length - 1];
      row.push(student.assignedModule || (latestSub ? latestSub.assignedModule : '-'));
      return row;
    });

    autoTable(doc, {
      head: head,
      body: body,
      startY: 28,
      styles: { fontSize: pdfDates.length > 10 ? 6 : 8, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 'auto' } },
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`report-${formId}-${pdfDays}-days.pdf`);
  };

  const resolveGuideline = async (submissionId) => {
    try {
      await api.put(`/submissions/${submissionId}/resolve-guideline`);
      toast.success('Guideline marked as resolved');
      fetchSubmissions();
    } catch (err) {
      toast.error('Failed to resolve guideline');
    }
  };

  const startEdit = (submission, field, customKey = null) => {
    setEditContext({ id: submission._id, field, customKey });
    if (field === 'custom' && customKey) {
      setEditValue(submission.customData[customKey] || '');
    } else {
      setEditValue(submission[field] || '');
    }
  };

  const saveEdit = async (item) => {
    try {
      const updateData = {};
      if (editContext.field === 'custom' && editContext.customKey) {
        updateData.customData = { ...item.customData, [editContext.customKey]: editValue };
      } else {
        updateData[editContext.field] = editValue;
      }

      if (editContext.field === 'studentAssignedModule') {
        await api.put(`/submissions/students/${item._id}`, { assignedModule: editValue });
      } else {
        await api.put(`/submissions/${item._id}`, updateData);
      }
      
      toast.success('Updated successfully');
      setEditContext({ id: null, field: null, customKey: null });
      fetchSubmissions();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <Loader />;

  // Extract unique dates for table columns
  // Dynamic date range calculation
  const getSortedDates = () => {
    if (!formConfig) return [];
    
    const dates = [];
    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let current = new Date(formConfig.startDate);
    current.setHours(0, 0, 0, 0);
    
    // Get "Today" in Bangladesh Time
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(formConfig.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    // Use the earlier of today or the form's end date
    const stopDate = today < endDate ? today : endDate;
    
    if (current > stopDate) {
      return [formatDate(current)];
    }

    while (current <= stopDate) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const sortedDates = getSortedDates();
  
  // Format chart data: Use stats from DB or calculate if needed for consistency
  // Note: the user specifically asked for "According to students", so we use the local data for the chart 
  // but keep the summary stats from the DB.
  const chartData = data.map(student => {
    const latestSub = student.submissions[student.submissions.length - 1];
    return { 
      name: student.name.split(' ')[0], 
      fullName: student.name,
      submissions: student.submissions.length 
    };
  }).sort((a, b) => b.submissions - a.submissions);

  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  return (
    <div className="space-y-6">
      {isCheckingEnrollment && <Loader />}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Form Insights</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button 
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Table
            </button>
            <button 
              onClick={() => setView('analytics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${view === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setView('enrollment')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${view === 'enrollment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Master List Check
            </button>
          </div>

          <button
            onClick={() => {
              const url = `${window.location.origin}/form/${formSlug}`;
              navigator.clipboard.writeText(url);
              toast.success('Share link copied!');
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Share Form
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <select 
              value={pdfDays} 
              onChange={(e) => setPdfDays(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem' }}
            >
              <option value="all">All Days</option>
              <option value="3">Last 3 Days</option>
              <option value="7">Last 7 Days</option>
              <option value="15">Last 15 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
            <div className="w-px h-6 bg-gray-200"></div>
            <button
              onClick={handleExportPDF}
              className="flex items-center text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2 text-indigo-600" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Sections */}
      {view === 'analytics' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Students</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">Pending Help</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPendingGuidelines}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">Highest Module</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">Module {stats.highestModule}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">Avg. Forms</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalStudents > 0 ? (data.reduce((acc, s) => acc + s.submissions.length, 0) / stats.totalStudents).toFixed(1) : 0}
              </p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submission Consistency</h3>
                <p className="text-sm text-gray-500">Total number of daily forms filled by each student</p>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                Engagement Tracking
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#64748b', fontWeight: 500}} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    label={{ value: 'Times Filled', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                    formatter={(value) => [`${value} Forms`, 'Total Submissions']}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="submissions" radius={[6, 6, 0, 0]} barSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[0]} fillOpacity={0.4 + (index * 0.05)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Check View */}
      {view === 'enrollment' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {!enrollmentResults ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Enrollment Data</h3>
              <p className="text-gray-500 max-w-sm mt-2">Upload a student CSV file using the button above to check who hasn't filled the form yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart Summary */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Participation Summary</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: enrollmentResults.filter(r => r.hasSubmitted).length },
                          { name: 'Missing', value: enrollmentResults.filter(r => !r.hasSubmitted).length }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f43f5e" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-gray-600"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Completed</span>
                    <span className="font-bold">{enrollmentResults.filter(r => r.hasSubmitted).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-gray-600"><div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div> Missing</span>
                    <span className="font-bold text-rose-600">{enrollmentResults.filter(r => !r.hasSubmitted).length}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const missing = enrollmentResults.filter(r => !r.hasSubmitted).map(r => r.email).join(', ');
                    copyToClipboard(missing, 'Missing emails');
                  }}
                  className="w-full mt-6 flex items-center justify-center px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  <Copy className="w-3 h-3 mr-2" /> Copy All Missing Emails
                </button>
              </div>

              {/* Missing List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">Missing Students ({enrollmentResults.filter(r => !r.hasSubmitted).length})</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {enrollmentResults.filter(r => !r.hasSubmitted).map((res, i) => (
                        <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                          <td className="px-6 py-3 text-sm text-gray-600 font-mono">{res.email}</td>
                          <td className="px-6 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-600">PENDING</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Table Card (Only show if view is 'table') */}
      {view === 'table' && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50/50 backdrop-blur-md z-10 border-r border-gray-100/50">Student Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Group/Batch</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                {sortedDates.map(date => (
                  <th key={date} className="px-8 py-5 text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center">{date}</th>
                ))}
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Assign </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(student => {
                const latestSub = student.submissions[student.submissions.length - 1];
                const pendingGuideline = student.submissions.find(s => s.needGuideline && !s.guidelineResolved);

                return (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 text-sm sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100 transition-colors align-top">
                      <div className="flex items-center space-x-2">
                        <span>{student.name}</span>
                        <button 
                          onClick={() => toggleDetails(student._id)}
                          className={`p-1.5 rounded-full transition-colors ${expandedStudentId === student._id ? 'bg-[#1e293b] text-cyan-400' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                          title="View Contact Details"
                        >
                          {expandedStudentId === student._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {expandedStudentId === student._id && (
                        <div className="mt-3 bg-[#1e293b] rounded-xl p-4 shadow-sm border border-gray-700 w-72">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-400 text-sm">Email:</span>
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-100 text-sm font-normal truncate max-w-[150px]">{student.email}</span>
                              <button onClick={() => copyToClipboard(student.email, 'Email')} className="text-cyan-400 hover:text-cyan-300 transition-colors" title="Copy Email">
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Phone:</span>
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-100 text-sm font-normal">{student.phone}</span>
                              <button onClick={() => copyToClipboard(student.phone, 'Phone')} className="text-cyan-400 hover:text-cyan-300 transition-colors" title="Copy Phone">
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {latestSub?.customData && Object.entries(latestSub.customData).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                              <span className="text-gray-400 text-sm">{key}:</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-gray-100 text-sm font-normal truncate max-w-[150px]">{value}</span>
                                <button onClick={() => copyToClipboard(value, key)} className="text-cyan-400 hover:text-cyan-300 transition-colors" title={`Copy ${key}`}>
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {student.batch || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {pendingGuideline ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="flex h-3 w-3 bg-rose-500 rounded-full animate-ping"></span>
                          <button 
                            onClick={() => resolveGuideline(pendingGuideline._id)}
                            className="text-[9px] font-black uppercase tracking-widest text-white bg-rose-500 px-3 py-1.5 rounded-full hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95"
                          >
                            Resolve
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="flex h-3 w-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></span>
                        </div>
                      )}
                    </td>
                    {sortedDates.map(date => {
                      const sub = student.submissions.find(s => s.date === date);
                      return (
                        <td key={date} className="px-6 py-4 text-sm text-gray-600 align-top">
                          {sub ? (
                            <div className="space-y-2">
                              {/* Current Module Edit */}
                              <div className="group/mod">
                                {editContext.id === sub._id && editContext.field === 'currentModule' ? (
                                  <div className="flex items-center space-x-1">
                                    <input 
                                      className="text-sm font-semibold text-gray-900 w-full bg-gray-50 border border-gray-300 rounded px-1 outline-none"
                                      value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                                      onKeyDown={e => e.key === 'Enter' && saveEdit(sub)}
                                    />
                                    <Check className="w-3.5 h-3.5 text-green-600 cursor-pointer" onClick={() => saveEdit(sub)} />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between group/edit">
                                    <div className="flex flex-col">
                                      <div className="font-semibold text-gray-900">{sub.currentModule}</div>
                                      {sub.submissionTime && (
                                        <div className="text-[8px] text-gray-400 font-mono flex items-center whitespace-nowrap">
                                          <Clock className="w-2 h-2 mr-0.5" />
                                          {sub.submissionTime}
                                        </div>
                                      )}
                                    </div>
                                    <button 
                                      onClick={() => startEdit(sub, 'currentModule')}
                                      className="p-0.5 text-rose-400 hover:text-rose-600 transition-opacity"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Custom Data Edits */}
                              {sub.customData && Object.entries(sub.customData).map(([key, value]) => (
                                <div key={key} className="text-[10px] leading-tight text-gray-400 flex flex-col group/custom">
                                  <span className="font-bold text-[9px] uppercase tracking-tighter text-gray-300">{key}</span>
                                  {editContext.id === sub._id && editContext.field === 'custom' && editContext.customKey === key ? (
                                    <div className="flex items-center space-x-1">
                                      <input 
                                        className="text-[10px] text-gray-600 w-full bg-gray-50 border border-gray-300 rounded px-1 outline-none"
                                        value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                                        onKeyDown={e => e.key === 'Enter' && saveEdit(sub)}
                                      />
                                      <Check className="w-3 h-3 text-green-600 cursor-pointer" onClick={() => saveEdit(sub)} />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between group/edit">
                                      <span className="truncate max-w-[100px]" title={value}>{value}</span>
                                      <button 
                                        onClick={() => startEdit(sub, 'custom', key)}
                                        className="p-0.5 text-rose-400 hover:text-rose-600 transition-opacity"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {sub.needGuideline && !sub.guidelineResolved && (
                                <div className="pt-1">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                    HELP NEEDED
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4">
                      {editContext.id === student._id && editContext.field === 'studentAssignedModule' ? (
                        <div className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-40 px-2.5 py-1.5 border border-indigo-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-indigo-50/30"
                            autoFocus
                            placeholder="Type module..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(student);
                              if (e.key === 'Escape') setEditContext({ id: null, field: null, customKey: null });
                            }}
                          />
                          <button 
                            onClick={() => saveEdit(student)} 
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditContext({ id: null, field: null, customKey: null })} 
                            className="p-1.5 bg-white text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-48 group/edit min-h-[40px]">
                          <div className="flex flex-col">
                            {student.assignedModule ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter bg-indigo-500 text-white mb-1 shadow-sm shadow-indigo-100">
                                Next: {student.assignedModule}
                              </span>
                            ) : null}
                            <span className={`text-sm font-bold ${student.assignedModule ? 'text-indigo-600' : 'text-gray-900'}`}>
                              {student.assignedModule ? (
                                <span className="opacity-0">HIDDEN</span> 
                              ) : (
                                latestSub?.assignedModule || <button 
                                  onClick={() => {
                                    setEditContext({ id: student._id, field: 'studentAssignedModule', customKey: null });
                                    setEditValue('');
                                  }}
                                  className="text-rose-600 hover:text-rose-700 font-bold underline decoration-rose-200 underline-offset-4 decoration-2 transition-all"
                                >
                                  Assign Module
                                </button>
                              )}
                            </span>
                          </div>
                          {(student.assignedModule || latestSub?.assignedModule) && (
                            <button 
                              onClick={() => {
                                setEditContext({ id: student._id, field: 'studentAssignedModule', customKey: null });
                                setEditValue(student.assignedModule || (latestSub?.assignedModule || ''));
                              }}
                              className="text-rose-500 hover:text-rose-700 transition-all p-2 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 bg-white shadow-sm"
                              title="Assign New Module"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={sortedDates.length + 3} className="px-6 py-12 text-center text-gray-500">
                    No submissions found for this form.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
    </div>
  );
};

export default AdminSubmissions;
