import React, { useState } from 'react';
import { 
  TrendingUp, 
  GraduationCap, 
  Layers, 
  Receipt, 
  ShieldCheck, 
  Settings,
  LogOut,
  Bell,
  BarChart3,
  Menu,
  ChevronLeft,
  ChevronRight,
  School,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(activeTab.startsWith('students'));
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'analytics', label: 'Dashboard', icon: TrendingUp },
    { 
      id: 'students', 
      label: 'Students', 
      icon: GraduationCap,
      subItems: [
        { id: 'students-all', label: 'All Students' },
        { id: 'students-add', label: 'Add Student' },
        { id: 'students-bulk', label: 'Bulk Upload' }
      ]
    },
    { id: 'fees', label: 'Fee Configuration', icon: Layers },
    { id: 'waivers', label: 'Financial Adjustments', icon: BarChart3 },
    { id: 'transactions', label: 'Transaction Center', icon: Receipt },
    { id: 'accountants', label: 'Staff Accounts', icon: ShieldCheck },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const bottomItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`
        relative flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 
        glass-card rounded-[24px] border border-white/40 shadow-premium 
        transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        backdrop-blur-premium bg-white/70
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-2 py-0 border-b border-slate-200/50 min-h-[100px]">
        <div className={`flex items-center justify-center overflow-visible transition-opacity duration-300 w-full h-full ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
          <img src="/campuspay-logo.png" alt="Campus Pay" className="h-24 w-full object-contain scale-[1.15] transform-gpu" />
        </div>
        {!isExpanded && (
          <img src="/campuspay-logo.png" alt="C" className="h-14 w-14 object-cover object-left" />
        )}
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-[88px] bg-white border border-slate-200 text-slate-400 hover:text-brand-primary rounded-full p-1 shadow-sm transition-transform active:scale-95 z-10"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 flex flex-col gap-2 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = !!item.subItems;
          const isActive = hasSubItems ? activeTab.startsWith(item.id) : activeTab === item.id;
          
          return (
            <div key={item.id} className="flex flex-col">
              <button
                onClick={() => {
                  if (hasSubItems) {
                    setStudentsMenuOpen(!studentsMenuOpen);
                    if (!isExpanded) setIsExpanded(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`
                  group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                  ${isActive && !hasSubItems ? 'bg-brand-primary text-white shadow-md' : 'text-slate-500 hover:bg-white/60 hover:text-brand-primary'}
                  ${isActive && hasSubItems ? 'bg-brand-primary/5 text-brand-primary font-black' : ''}
                `}
                title={!isExpanded ? item.label : ''}
              >
                {isActive && !hasSubItems && (
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-brand-primary opacity-20" />
                )}
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive && !hasSubItems ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className={`font-bold text-xs whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                    {item.label}
                  </span>
                </div>
                {hasSubItems && isExpanded && (
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${studentsMenuOpen ? 'rotate-90' : ''}`} />
                )}
              </button>
              
              {/* Submenu */}
              {hasSubItems && (
                <div 
                  className={`
                    flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out
                    ${studentsMenuOpen && isExpanded ? 'max-h-40 mt-1' : 'max-h-0'}
                  `}
                >
                  {item.subItems.map(subItem => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveTab(subItem.id)}
                      className={`
                        text-left pl-11 pr-3 py-2 rounded-xl text-xs font-bold transition-all duration-200
                        ${activeTab === subItem.id ? 'text-brand-primary bg-white shadow-sm' : 'text-slate-500 hover:text-brand-primary hover:bg-white/40'}
                      `}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="my-4 border-t border-slate-200/50 mx-2" />

        {/* Bottom Nav */}
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-slate-500 hover:bg-white/60 hover:text-slate-700"
              title={!isExpanded ? item.label : ''}
            >
              <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className={`font-bold text-xs whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-brand-danger hover:bg-brand-danger/10 group"
          title={!isExpanded ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span className={`font-bold text-xs whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
