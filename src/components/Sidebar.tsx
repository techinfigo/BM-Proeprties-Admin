/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  Star,
  Heart,
  MessageSquare,
  Phone,
  BarChart3,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';
import { useToast } from './Toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Properties', path: '/properties', icon: Building2 },
  { name: 'Featured Spotlight', path: '/featured-spotlight', icon: Star },
  { name: 'Popular Properties', path: '/popular-properties', icon: Heart },
  { name: 'Testimonials', path: '/testimonials', icon: MessageSquare },
  { name: 'Contact & Info', path: '/contact-info', icon: Phone },
  { name: 'Site Stats', path: '/site-stats', icon: BarChart3 }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('bm_is_logged_in');
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-[#0A1F44] text-white border-r border-[#0A1F44]/20 z-50 transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header/Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none text-white">
                BM Properties
              </h1>
              <span className="text-[10px] font-medium tracking-widest text-[#0ea5e9] uppercase">
                Agra Admin
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Admin Role Profile */}
        <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-700/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0ea5e9] flex items-center justify-center font-bold text-sm text-white">
            BM
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">BM Properties Admin</h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="text-[10px] text-[#10b981] font-medium">Online Console</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/15 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`
                }
                end={item.path === '/'}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer/Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3 text-sm font-semibold text-slate-300 hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-all group"
          >
            <LogOut className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5 text-slate-400 group-hover:text-[#ef4444]" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>
    </>
  );
};
