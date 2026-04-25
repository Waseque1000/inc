import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Box, Users, Gift, ChevronRight, BarChart3, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await api.get('/forms');
      setForms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1">Select a campaign to manage</p>
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => (
          <div key={form._id} className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 relative overflow-hidden">
            {form.isUpdatedToday && (
              <div className="absolute top-0 right-0">
                <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  NEW UPDATE
                </div>
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-lg bg-gray-50 text-gray-900 border border-gray-100">
                <Box className="w-5 h-5" />
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                form.isClosed 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-green-50 text-green-700 border border-green-100'
              }`}>
                {form.isClosed ? 'Closed' : 'Active'}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{form.formName}</h3>
            <p className="text-sm text-gray-500 mb-5 font-mono">
              {new Date(form.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(form.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-center">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Students</p>
                <p className="text-lg font-bold text-gray-900">{form.totalParticipants || 0}</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-center">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Updates</p>
                <p className="text-lg font-bold text-gray-900">{form.todayUpdates || 0}</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-center">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Fields</p>
                <p className="text-lg font-bold text-gray-900">{form.customFields?.length || 0}</p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Link to={`/admin/submissions/${form._id}`} className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-gray-50 transition-colors group/btn">
                <div className="flex items-center text-gray-600 group-hover/btn:text-gray-900">
                  <Users className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Submissions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover/btn:text-gray-900" />
              </Link>
              
              <Link to={`/admin/submissions/${form._id}?view=analytics`} className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-indigo-50 transition-colors group/btn text-indigo-600">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Analytics & Charts</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Link>
              
              <Link to={`/admin/rewards/${form._id}`} className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-gray-50 transition-colors group/btn">
                <div className="flex items-center text-gray-600 group-hover/btn:text-gray-900">
                  <Gift className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Rewards</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover/btn:text-gray-900" />
              </Link>
            </div>
          </div>
        ))}
        
        {forms.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-50 rounded-full">
                <Box className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-900 font-medium mb-1">No campaigns found</p>
            <p className="text-gray-500 text-sm mb-6">Create your first form campaign to start tracking.</p>
            <Link to="/admin/forms" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Create Campaign
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
