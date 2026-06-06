/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  Star,
  MessageSquare,
  Phone,
  BarChart3,
  LogOut,
  X,
  Inbox,
  Settings
} from 'lucide-react';
import { useToast } from './Toast';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Inquiries', path: '/inquiries', icon: Inbox },
  { name: 'Properties', path: '/properties', icon: Building2 },
  { name: 'Reviews', path: '/reviews', icon: Star },
  { name: 'Testimonials', path: '/testimonials', icon: MessageSquare },
  { name: 'Contact & Info', path: '/contact-info', icon: Phone },
  { name: 'Site Stats', path: '/site-stats', icon: BarChart3 },
  { name: 'Site Settings', path: '/site-settings', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inquiries'), (snap) => {
      const count = snap.docs.filter((d) => {
        const s = d.data().status;
        return !['contacted', 'approved', 'rejected'].includes(s);
      }).length;
      setPendingCount(count);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), (snap) => {
      const count = snap.docs.filter((d) => {
        const s = d.data().status;
        return s !== 'approved' && s !== 'rejected';
      }).length;
      setPendingReviewsCount(count);
    });
    return () => unsub();
  }, []);

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
                <span className="flex-1">{item.name}</span>
                {item.path === '/inquiries' && pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                    {pendingCount}
                  </span>
                )}
                {item.path === '/reviews' && pendingReviewsCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
                    {pendingReviewsCount}
                  </span>
                )}
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
