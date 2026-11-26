// frontend/src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import {
  Calendar, Scissors, Users, UserCheck, Settings as SettingsIcon, Image,
  LayoutDashboard, LogOut, ExternalLink, Menu, X, QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePublic } from '../../context/PublicContext';
import { buildAdminUrl, canAccessAdminTab } from '../../utils/adminRouter';
import SafeImage from '../common/SafeImage';

export default function AdminLayout({ activeTab, onSelectTab, onTabChange, onExitAdmin, children }) {
  const { user, logout, hasRole } = useAuth();
  const { salon } = usePublic();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleTabClick = onSelectTab || onTabChange || (() => {});

  const isReceptionist = user?.role === 'receptionist';
  const isManager = user?.role === 'branch_manager';

  const allNavItems = [
    {
      id: 'overview',
      label: isReceptionist ? 'Front Desk' : user?.role === 'stylist' ? 'My Schedule' : 'Dashboard',
      icon: LayoutDashboard,
    },
    { id: 'bookings', label: 'Appointments', icon: Calendar },
    {
      id: 'customers',
      label: isReceptionist ? 'Client Directory' : 'Customers',
      icon: UserCheck,
    },
    { id: 'share', label: 'Share & QR Card', icon: QrCode },
    { id: 'services', label: 'Services & Menu', icon: Scissors },
    {
      id: 'stylists',
      label: isReceptionist ? 'Artist Schedules' : 'Artists & Schedules',
      icon: Users,
    },
    { id: 'cms', label: 'Lookbook & CMS', icon: Image },
    {
      id: 'settings',
      label: isManager ? 'Operations Settings' : hasRole('super_admin') ? 'Atelier Settings' : 'Settings',
      icon: SettingsIcon,
    },
  ];

  const navItems = allNavItems.filter((item) => canAccessAdminTab(user?.role, item.id));

  const roleNameMap = {
    super_admin: 'Super Admin',
    branch_manager: 'Branch Manager',
    receptionist: 'Receptionist',
    stylist: 'Stylist'
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-salon-light text-salon-dark flex flex-col lg:flex-row">
      
      {/* Sidebar Desktop (Independent Left Scroll Area) */}
      <aside className="hidden lg:flex lg:h-full lg:overflow-hidden flex-col w-72 bg-gradient-to-b from-[#241D19] via-[#1D1714] to-[#15110E] text-[#F7F1E8] border-r border-[#D6A984]/20 shadow-[6px_0_28px_-10px_rgba(26,22,20,0.35)] flex-shrink-0 print:hidden">
        
        {/* Brand Banner */}
        <div className="p-6 border-b border-[#D6A984]/15 flex items-center justify-between shrink-0">
          <div>
            <span className="font-editorial text-xl font-semibold tracking-wider text-[#FFFDF8] block leading-none">
              {salon.salon_name || 'RiTiVerse Salon'}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#D6A984] font-bold block mt-1">
              Admin Atelier
            </span>
          </div>
        </div>

        {/* Independently Scrollable Sidebar Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {/* User Card */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-[#FFFDF8]/[0.05] border border-[#D6A984]/20 flex items-center gap-3">
            <SafeImage
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name}
              fallbackLabel={user?.name}
              className="w-10 h-10 rounded-full object-cover border border-[#D6A984]/55 flex-shrink-0"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-[#FFFDF8] truncate">{user?.name}</h4>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#D6A984]">
                {roleNameMap[user?.role] || user?.role}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-4 py-2 space-y-1.5 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <a
                  key={item.id}
                  href={buildAdminUrl(item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#B4563E] to-[#933E29] text-[#FFFDF8] border border-[#D6A984]/35 shadow-soft-pink'
                      : 'text-[#EAE0D2]/75 hover:text-[#FFFDF8] hover:bg-[#FFFDF8]/[0.06] border border-transparent hover:border-[#D6A984]/15'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFFDF8]' : 'text-[#D6A984]/75'}`} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#D6A984]/15 space-y-2 shrink-0">
          <button
            type="button"
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-[#EAE0D2]/75 hover:text-[#FFFDF8] hover:bg-[#FFFDF8]/[0.06] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#F4B4A4] hover:text-[#FFFDF8] hover:bg-[#B4563E]/25 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-gradient-to-r from-[#241D19] to-[#15110E] text-[#F7F1E8] px-4 py-3.5 border-b border-[#D6A984]/20 flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-editorial text-lg sm:text-xl font-semibold text-[#FFFDF8] truncate">
            {salon.salon_name || 'RiTiVerse Salon'}
          </span>
          <span className="text-[10px] text-[#D6A984] uppercase font-bold tracking-wider shrink-0">
            Admin
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg text-[#FFFDF8] hover:bg-[#FFFDF8]/10 shrink-0"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-[#1D1714] text-[#F7F1E8] p-4 space-y-2 border-b border-[#D6A984]/20 max-h-[75dvh] overflow-y-auto overscroll-contain print:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={buildAdminUrl(item.id)}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(item.id);
                setMobileNavOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-[#B4563E] to-[#933E29] text-[#FFFDF8] border border-[#D6A984]/35'
                  : 'text-[#EAE0D2]/80 hover:bg-[#FFFDF8]/[0.06]'
              }`}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#D6A984]/15 flex items-center justify-between">
            <button type="button" onClick={onExitAdmin} className="text-xs text-[#EAE0D2]/75 hover:text-[#FFFDF8]">
              Public Site
            </button>
            <button type="button" onClick={logout} className="text-xs text-[#F4B4A4] font-semibold">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (Independent Right Scroll Area) */}
      <main className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain bg-atelier-grid">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
