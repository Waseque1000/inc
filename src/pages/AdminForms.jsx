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

      {/* Forms List Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Form Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Share Link</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forms.map(form => (
                <tr key={form._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-sm ${form.isClosed ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{form.formName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: {form._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 w-max group/link">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`/form/${form.formSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-indigo-600 font-bold truncate max-w-[150px] transition-colors">
                        /{form.formSlug}
                      </a>
                      <button 
                        onClick={() => copyToClipboard(form.formSlug)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-white"
                        title="Copy Share Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center text-xs font-bold text-gray-600 bg-gray-50 w-max px-3 py-1.5 rounded-full border border-gray-100">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                      {new Date(form.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(form.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => toggleStatus(form)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        form.isClosed 
                        ? 'bg-gray-100 text-gray-500 border-gray-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-50'
                      }`}
                    >
                      {form.isClosed ? 'Closed' : 'Active'}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(form)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Form"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form._id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Form"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {forms.map(form => (
            <div key={form._id} className="p-6 space-y-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-sm ${form.isClosed ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{form.formName}</p>
                    <button 
                      onClick={() => toggleStatus(form)}
                      className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        form.isClosed ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {form.isClosed ? 'Closed' : 'Active'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => openEditModal(form)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteForm(form._id)} className="p-2 text-gray-400 hover:text-rose-600 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center text-xs font-bold text-gray-600">
                    <LinkIcon className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                    /{form.formSlug}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(form.formSlug)}
                    className="p-2 bg-white rounded-xl border border-gray-200 text-indigo-600 shadow-sm shadow-indigo-50 transition-all active:scale-90"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center text-xs font-bold text-gray-600 bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                  {new Date(form.startDate).toLocaleDateString()} - {new Date(form.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {forms.length === 0 && (
          <div className="px-8 py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-900 font-black text-xl">No campaigns found</p>
            <p className="text-gray-400 text-sm mt-1 max-w-[200px] mx-auto">Create your first form to start tracking progress.</p>
          </div>
        )}
      </div>

      {isModalOpen && renderFormModal(false)}
      {isEditModalOpen && renderFormModal(true)}
    </div>
  );
};

export default AdminForms;
