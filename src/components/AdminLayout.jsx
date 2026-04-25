import React from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Box, RefreshCw, Users, Menu, X } from 'lucide-react';

import api from '../api/axios';

const AdminLayout = () => {
  const token = localStorage.getItem('token');
  const [profile, setProfile] = React.useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/admin/me');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile');
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Forms', path: '/admin/forms', icon: FileText },
    { name: 'Member List', path: '/admin/enrollment', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo area */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Incubator
              </h1>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-xs font-semibold text-gray-900 leading-none mb-1">{profile?.name || 'Admin'}</span>
                <span className="text-[10px] text-gray-400 leading-none">{profile?.email || 'Administrator'}</span>
              </div>
              
              <button onClick={() => window.location.reload()} className="hidden sm:p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`md:hidden bg-white border-b border-gray-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
