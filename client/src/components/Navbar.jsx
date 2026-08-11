import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileSearch, History as HistoryIcon, Settings, Menu, LogOut, X } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze', path: '/analyze', icon: FileSearch },
    { name: 'History', path: '/history', icon: HistoryIcon },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getLinkClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return "flex items-center gap-md bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 transition-transform";
    }
    return "flex items-center gap-md text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-colors rounded-lg";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Drawer */}
      <aside className={`bg-surface border-r border-outline-variant shadow-md h-screen fixed md:sticky top-0 left-0 z-50 w-72 flex flex-col py-lg shrink-0 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-lg mb-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ResumeFit Logo" className="w-8 h-8 rounded-full" />
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">ResumeFit</h1>
          </div>
          <button 
            className="md:hidden text-on-surface-variant p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-sm">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={getLinkClasses(link.path)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span className="font-label-md text-label-md">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-auto space-y-sm">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-md text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-colors rounded-lg"
          >
            <LogOut size={20} />
            <span className="font-label-md text-label-md">Logout</span>
          </button>
          
          <div className="flex items-center gap-md p-4 bg-surface-container-low rounded-lg border border-outline-variant">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{user?.name || 'User'}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-surface border-b border-outline-variant flex justify-between items-center px-4 h-16 w-full sticky top-0 z-30">
        <button 
          className="text-on-surface-variant p-2"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img src={logo} alt="ResumeFit" className="w-6 h-6 rounded-full" />
          <span className="font-headline-md text-headline-md font-bold text-primary">ResumeFit</span>
        </div>
        <div className="relative">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
