import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Copy, Plus, X, Calendar, Link as LinkIcon, Box, Edit2, Trash2 } from 'lucide-react';

const AdminForms = () => {
  const [forms, setForms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormId, setEditFormId] = useState(null);
  
  const [formData, setFormData] = useState({
    formName: '',
    formSlug: '',
    startDate: '',
    endDate: '',
    customFields: []
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await api.get('/forms');
      setForms(res.data);
    } catch (err) {
      toast.error('Failed to load forms');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation: Custom fields must have labels
    if (formData.customFields.some(f => !f.label.trim())) {
      return toast.error('All custom fields must have a label');
    }

    try {
      await api.post('/forms/create', formData);
      toast.success('Form created successfully');
      setIsModalOpen(false);
      setFormData({ formName: '', formSlug: '', startDate: '', endDate: '', customFields: [] });
      fetchForms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create form');
    }
  };

  const openEditModal = (form) => {
    setEditFormId(form._id);
    setFormData({
      formName: form.formName,
      formSlug: form.formSlug,
      startDate: form.startDate ? form.startDate.split('T')[0] : '',
      endDate: form.endDate ? form.endDate.split('T')[0] : '',
      customFields: form.customFields || []
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    // Validation: Custom fields must have labels
    if (formData.customFields.some(f => !f.label.trim())) {
      return toast.error('All custom fields must have a label');
    }

    try {
      await api.put(`/forms/edit/${editFormId}`, formData);
      toast.success('Form updated successfully');
      setIsEditModalOpen(false);
      setEditFormId(null);
      setFormData({ formName: '', formSlug: '', startDate: '', endDate: '', customFields: [] });
      fetchForms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update form');
    }
  };

  const toggleStatus = async (form) => {
    try {
      await api.put(`/forms/edit/${form._id}`, { isClosed: !form.isClosed });
      toast.success('Status updated');
      fetchForms();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form? This will permanently delete the form and ALL associated student submissions. This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/forms/${id}`);
      toast.success('Form deleted successfully');
      fetchForms();
    } catch (err) {
      toast.error('Failed to delete form');
    }
  };

  const copyToClipboard = (slug) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [...formData.customFields, { label: '', type: 'text', placeholder: '', required: false }]
    });
  };

  const removeCustomField = (index) => {
    const newFields = formData.customFields.filter((_, i) => i !== index);
    setFormData({ ...formData, customFields: newFields });
  };

  const updateCustomField = (index, updates) => {
    const newFields = formData.customFields.map((field, i) => i === index ? { ...field, ...updates } : field);
    setFormData({ ...formData, customFields: newFields });
  };

  const renderFormModal = (isEdit = false) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => isEdit ? setIsEditModalOpen(false) : setIsModalOpen(false)}></div>
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Form' : 'Create New Form'}</h2>
          <button onClick={() => isEdit ? setIsEditModalOpen(false) : setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={isEdit ? handleEdit : handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
            <input
              type="text" required placeholder="e.g. Week 1 React Challenges"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all sm:text-sm"
              value={formData.formName}
              onChange={e => setFormData({...formData, formName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom URL Slug</label>
            <div className="flex rounded-lg shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                /form/
              </span>
              <input
                type="text" required placeholder="react-week1"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all sm:text-sm"
                value={formData.formSlug}
                onChange={e => setFormData({...formData, formSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date" required
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all sm:text-sm"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date" required
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all sm:text-sm"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Custom Fields (Optional)</label>
              <button 
                type="button" onClick={addCustomField}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Field
              </button>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {formData.customFields.map((field, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative group">
                  <button 
                    type="button" onClick={() => removeCustomField(index)}
                    className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text" placeholder="Field Label (e.g. Github Link)"
                      className="text-xs px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      value={field.label} onChange={e => updateCustomField(index, { label: e.target.value })}
                    />
                    <select
                      className="text-xs px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                      value={field.type} onChange={e => updateCustomField(index, { type: e.target.value })}
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="number">Number</option>
                    </select>
                    <input
                      type="text" placeholder="Placeholder (optional)"
                      className="text-xs px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none col-span-2"
                      value={field.placeholder} onChange={e => updateCustomField(index, { placeholder: e.target.value })}
                    />
                    <label className="flex items-center text-[10px] text-gray-500 col-span-2">
                      <input 
                        type="checkbox" className="mr-1.5" 
                        checked={field.required} onChange={e => updateCustomField(index, { required: e.target.checked })}
                      />
                      Mark as required
                    </label>
                  </div>
                </div>
              ))}
              {formData.customFields.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4 border border-dashed border-gray-200 rounded-lg">No custom fields added yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => isEdit ? setIsEditModalOpen(false) : setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-gray-900 hover:bg-gray-800 shadow-sm rounded-lg text-sm font-medium transition-all"
            >
              {isEdit ? 'Save Changes' : 'Launch Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Form Campaigns
          </h1>
          <p className="text-gray-500 mt-1">Create and manage your student tracking forms</p>
        </div>
        <button
          onClick={() => {
            setFormData({ formName: '', formSlug: '', startDate: '', endDate: '', customFields: [] });
            setIsModalOpen(true);
          }}
          className="mt-4 sm:mt-0 flex items-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Form
        </button>
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Public URL</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forms.map((form, index) => (
                <tr key={form._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${form.isClosed ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{form.formName}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">ID: {form._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 w-max">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`/form/${form.formSlug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900 font-medium truncate max-w-[150px] transition-colors">
                        /form/{form.formSlug}
                      </a>
                      <button 
                        onClick={() => copyToClipboard(form.formSlug)}
                        className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-200"
                        title="Copy Share Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(form.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(form.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      form.isClosed 
                      ? 'bg-gray-100 text-gray-600 border-transparent' 
                      : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {form.isClosed ? 'Closed' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(form)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                        title="Edit Form"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Form"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(form)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                          form.isClosed 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {form.isClosed ? 'Reopen' : 'Close'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {forms.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-3 rounded-full mb-3 border border-gray-100">
                        <Box className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-medium mb-1">No forms found</p>
                      <p className="text-gray-500 text-sm">Click the create button above to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && renderFormModal(false)}
      {isEditModalOpen && renderFormModal(true)}
    </div>
  );
};

export default AdminForms;
