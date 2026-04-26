import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle2, Mail, Send, Globe, MessageCircle, Share2 } from 'lucide-react';
import illustration from '../assets/illustration.png';

const StudentForm = () => {
  const { slug } = useParams();
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batch: '',
    currentModule: '',
    tomorrowTask: '',
    needGuideline: false,
    customData: {}
  });

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    try {
      const res = await api.get(`/forms/${slug}`);
      setFormConfig(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Form not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        formId: formConfig._id
      };
      
      await api.post('/submissions/submit', payload);
      toast.success('Task submitted successfully!');
      setSubmitted(true);
      setFormData(prev => ({
        ...prev,
        currentModule: '',
        tomorrowTask: '',
        needGuideline: false,
        customData: {}
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit task');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] text-white p-8 relative overflow-hidden font-sans">
      {/* Cinematic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] animate-bounce-subtle"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center">
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="w-32 h-32 bg-white/5 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/10 shadow-2xl relative z-10 group hover:scale-110 transition-transform duration-500">
            <Globe className="w-12 h-12 text-indigo-400 group-hover:rotate-12 transition-transform duration-700" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          CLOSED<span className="text-indigo-500">.</span>
        </h1>
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <p className="text-xl md:text-2xl font-bold text-gray-400">
            {error === 'Form not found' ? 'Page Not Found' : 'Submission Cycle Ended'}
          </p>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md mx-auto font-medium">
            {error === 'Form not found' 
              ? "The link you followed might be broken or the form has been removed from our servers." 
              : "This journey has reached its destination. This form is no longer accepting new submissions."}
          </p>
        </div>

        <div className="mt-16 flex flex-col items-center animate-in fade-in duration-1000 delay-500">
          <div className="w-px h-20 bg-gradient-to-b from-indigo-500 to-transparent"></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/50">Incubator System</p>
        </div>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="bg-white p-12 rounded-[40px] shadow-2xl max-w-lg w-full text-center relative z-10 border border-indigo-50">
        <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Great Job!</h2>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">Your progress has been tracked. Keep up the amazing work on your journey!</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
        >
          Submit Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white md:bg-indigo-50 flex flex-col md:items-center md:justify-center p-0 md:p-6 relative overflow-hidden font-sans w-full max-w-[100vw]">
      {/* Abstract Background Elements (Desktop Only) */}
      <div className="hidden md:block absolute top-[-5%] left-[-5%] w-[30%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] bg-purple-200/40 rounded-full blur-3xl"></div>

      {/* Mobile Brand Header */}
      <div className="md:hidden w-full p-6 bg-indigo-900 text-white flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Globe className="w-5 h-5 text-indigo-100" />
          </div>
          <span className="font-black tracking-tighter text-lg uppercase">Incubator</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
      </div>

      <div className="bg-white rounded-none md:rounded-[40px] shadow-none md:shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden relative z-10 border border-transparent md:border-white/50">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-[55%] p-6 md:p-10">
          <div className="mb-10">
            <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              {formConfig.formName}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-indigo-900 mb-2 tracking-tight leading-none">
              Let's track <span className="text-indigo-400">.</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed font-medium">
              Update your daily progress update and let us know your goals for <span className="text-indigo-600 font-bold">{formConfig.formName}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-900/40 ml-3 uppercase tracking-widest">Name</label>
                <input
                  type="text" required
                  placeholder="John Doe"
                  className="w-full px-5 py-3 bg-indigo-50/50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-indigo-200 text-gray-700 text-sm font-medium"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-900/40 ml-3 uppercase tracking-widest">Email</label>
                <input
                  type="email" required
                  placeholder="john@example.com"
                  className="w-full px-5 py-3 bg-indigo-50/50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-indigo-200 text-gray-700 text-sm font-medium"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-900/40 ml-3 uppercase tracking-widest">Phone</label>
                <input
                  type="tel" required
                  placeholder="+1 (234) 567"
                  className="w-full px-5 py-3 bg-indigo-50/50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-indigo-200 text-gray-700 text-sm font-medium"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-900/40 ml-3 uppercase tracking-widest">Current Module</label>
                <input
                  type="text" required
                  placeholder="Which module?"
                  className="w-full px-5 py-3 bg-indigo-50/50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-indigo-200 text-gray-700 text-sm font-medium"
                  value={formData.currentModule} onChange={e => setFormData({...formData, currentModule: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-900/40 ml-3 uppercase tracking-widest">Tomorrow's Plan</label>
              <textarea
                required rows="2"
                placeholder="Next steps..."
                className="w-full px-5 py-3 bg-indigo-50/50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none placeholder:text-indigo-200 text-gray-700 text-sm font-medium"
                value={formData.tomorrowTask} onChange={e => setFormData({...formData, tomorrowTask: e.target.value})}
              ></textarea>
            </div>

            {formConfig.customFields && formConfig.customFields.map((field, index) => (
              <div key={index} className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-900/40 ml-3 uppercase tracking-widest">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    rows="1"
                    placeholder={field.placeholder || "Type here..."}
                    className="w-full px-5 py-3 bg-indigo-50/50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none placeholder:text-indigo-200 text-gray-700 text-sm font-medium"
                    value={formData.customData[field.label] || ''}
                    onChange={e => setFormData({
                      ...formData,
                      customData: { ...formData.customData, [field.label]: e.target.value }
                    })}
                  />
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder || "Enter details..."}
                    className="w-full px-5 py-3 bg-indigo-50/50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-indigo-200 text-gray-700 text-sm font-medium"
                    value={formData.customData[field.label] || ''}
                    onChange={e => setFormData({
                      ...formData,
                      customData: { ...formData.customData, [field.label]: e.target.value }
                    })}
                  />
                )}
              </div>
            ))}
            
            <div className="flex items-center space-x-3 bg-indigo-50/30 p-4 rounded-[20px] border border-indigo-50">
              <input
                type="checkbox"
                id="guideline"
                className="w-5 h-5 rounded-md border-2 border-indigo-200 text-indigo-600 focus:ring-indigo-100 transition-all cursor-pointer"
                checked={formData.needGuideline} onChange={e => setFormData({...formData, needGuideline: e.target.checked})}
              />
              <label htmlFor="guideline" className="text-xs font-bold text-indigo-900/60 cursor-pointer select-none">
                I need a guideline for my next steps
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-black text-base hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center space-x-2 group"
            >
              <span>Submit Progress</span>
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Right Side: Illustration & Info */}
        <div className="hidden md:flex md:w-[45%] bg-indigo-50/50 p-10 flex-col justify-between border-l border-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-full max-w-[280px] mb-8 animate-in fade-in slide-in-from-right-10 duration-700">
              <img src={illustration} alt="Illustration" className="w-full h-auto drop-shadow-xl" />
            </div>
            
            <div className="space-y-6 w-full text-center md:text-left">
              <div className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-white shadow-inner">
                <p className="text-lg md:text-xl font-black text-indigo-900 leading-tight italic">
                  "Move ahead, don’t look behind, <br/>
                  Learn, grow, and clear your mind. 🚀"
                </p>
                <p className="mt-3 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Daily Motivation</p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-center space-x-4">
            <a href="#" className="p-3 bg-white rounded-full text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-all hover:-translate-y-1">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-3 bg-white rounded-full text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-all hover:-translate-y-1">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="p-3 bg-white rounded-full text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-all hover:-translate-y-1">
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
