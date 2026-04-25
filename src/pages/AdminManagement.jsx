import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Shield, Mail, Calendar, Trash2, X, Plus, User } from 'lucide-react';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/all');
      setAdmins(res.data);
    } catch (err) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/add', formData);
      toast.success('Admin added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add admin');
    }
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 flex justify-between items-center border-b border-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Add New Admin</h2>
            <p className="text-xs text-gray-400 font-medium">Grant administrative access</p>
          </div>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-xl p-2 hover:bg-gray-50 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddAdmin} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" required placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all text-sm font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email" required placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all text-sm font-bold"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password" required placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all text-sm font-bold"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <button
              type="submit"
              className="w-full py-4 text-white bg-gray-900 hover:bg-gray-800 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
            >
              Create Admin Account
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-4 text-gray-500 bg-transparent hover:bg-gray-50 rounded-2xl text-sm font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Security Protocol Active</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Admin Management
          </h1>
          <p className="text-gray-400 font-medium mt-1">Manage platform access and administrative privileges</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center bg-gray-900 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <UserPlus className="w-4 h-4 mr-3" />
          Add Admin
        </button>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse border border-gray-50"></div>
          ))
        ) : (
          admins.map(admin => (
            <div key={admin._id} className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
              {/* Decorative Gradient Overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 group-hover:rotate-6 transition-transform duration-500">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Admin</span>
                  </div>
                </div>

                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {admin.name}
                  </h3>
                  <div className="flex items-center text-gray-400 text-xs font-bold">
                    <Mail className="w-3 h-3 mr-2" />
                    {admin.email}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3 mr-2" />
                    Joined {new Date(admin.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </div>
                  {/* Option to delete admin could be here, but usually risky */}
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && admins.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
              <Shield className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">No Administrators Found</h3>
            <p className="text-gray-400 max-w-xs mt-2 font-medium">The system is currently running on default credentials. Add your first administrator to secure the platform.</p>
          </div>
        )}
      </div>

      {isModalOpen && renderModal()}
    </div>
  );
};

export default AdminManagement;
