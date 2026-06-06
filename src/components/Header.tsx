/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ShieldCheck, Check } from 'lucide-react';
import { useData } from './DataProvider';

interface HeaderProps {
  onMenuToggle: () => void;
}

const routeTitles: Record<string, string> = {
  '/': 'Console Dashboard',
  '/properties': 'Properties Manager',
  '/properties/new': 'Add New Property',
  '/testimonials': 'Customer Testimonials Manager',
  '/contact-info': 'Contact Details & Info Updater',
  '/site-stats': 'Website Statistics Stats',
  '/inquiries': 'Inquiries Manager',
  '/site-settings': 'Site Settings',
  '/reviews': 'Reviews Manager'
};

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const { properties } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/properties/edit/')) {
      return 'Update Property Details';
    }
    return routeTitles[path] || 'Admin Panel';
  };

  const notificationCount = 3;

  return (
    <header
      id="app-header"
      className="sticky top-0 bg-white h-20 px-6 border-b border-slate-205/60 flex items-center justify-between z-30 shadow-xs"
    >
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="hidden md:block text-xs text-slate-500 mt-0.5">
            Manage your Agra properties network portfolio in real-time
          </p>
        </div>
      </div>

      {/* Right side: Actions, notifications and badge */}
      <div className="flex items-center gap-4">
        {/* Live Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/20">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-xs font-semibold text-[#10b981]">PROD READY</span>
        </div>

        {/* Notifications Icon with simple alert popup state */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ef4444] rounded-full border border-white" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0A1F44]">Dealer Notifications</span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium">
                    3 New Inquiries
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-semibold text-slate-800">
                      Amit Saxena requested pricing
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Property: Luxury 3 BHK Taj Flat
                    </p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-semibold text-slate-800">
                      New rating left by Diego Gupta
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      "Extremely recommended Agra agency!" (5 Stars)
                    </p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-semibold text-slate-800">
                      System Audit Complete
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      All {properties.length} listings synchronized to local DB state
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3.5 pl-2 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#0A1F44]">BM Admin</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#0ea5e9]" />
            </div>
            <p className="text-[10px] text-slate-400 leading-none">Super Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-[#0ea5e9]/20 bg-[#0A1F44] text-[#0ea5e9] flex items-center justify-center font-bold text-[#0ea5e9] text-base">
            A
          </div>
        </div>
      </div>
    </header>
  );
};
