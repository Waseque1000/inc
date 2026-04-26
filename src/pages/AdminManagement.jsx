import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Shield, Mail, Calendar, Trash2, X, Plus, User } from 'lucide-react';
import Loader from '../components/Loader';

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
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Admin</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text" required placeholder="John Doe"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all sm:text-sm"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email" required placeholder="admin@example.com"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all sm:text-sm"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all sm:text-sm"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-gray-900 hover:bg-gray-800 shadow-sm rounded-lg text-sm font-medium transition-all"
            >
              Create Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admins
          </h1>
          <p className="text-gray-500 mt-1">Manage platform access</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Admin
        </button>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <Loader fullPage={false} />
        ) : (
          admins.map(admin => (
            <div key={admin._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-lg bg-gray-50 text-gray-900 border border-gray-100">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {admin.name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {admin.email}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(admin.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && admins.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No administrators found.
          </div>
        )}
      </div>

      {isModalOpen && renderModal()}
    </div>
  );
};

export default AdminManagement;
