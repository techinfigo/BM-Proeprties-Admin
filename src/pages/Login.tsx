/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building2, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useToast } from '../components/Toast';

interface LoginFormInputs {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>();

  useEffect(() => {
    // If logged in, send straight to dashboard
    const isLoggedIn = localStorage.getItem('bm_is_logged_in');
    if (isLoggedIn === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const onSubmit = (data: LoginFormInputs) => {
    setLoginError(null);
    if (data.email === 'admin@bmproperties.com' && data.password === 'bm@admin2024') {
      localStorage.setItem('bm_is_logged_in', 'true');
      showToast('Welcome back, Admin!', 'success');
      navigate('/');
    } else {
      setLoginError('Invalid administrator email or password.');
      showToast('Authentication failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Decorative Top Accent */}
        <div className="h-2 bg-[#0A1F44]" />

        {/* Brand Banner */}
        <div className="px-8 pt-8 pb-6 bg-[#001435] text-white text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-[#0ea5e9]/10 rounded-xl flex items-center justify-center border border-[#0ea5e9]/20 shadow-md text-[#0ea5e9] mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">BM PROPERTIES</h2>
          <p className="text-xs text-slate-400 mt-1 leading-none tracking-widest uppercase font-medium">
            Agra Console System
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-5">
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#0A1F44] tracking-tight">Admin Login Dashboard</h3>
            <p className="text-xs text-slate-500 mt-1">Please enter your authorized admin credentials</p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200/50 flex items-center gap-2.5 text-xs font-semibold text-red-600 animate-shake">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="email-input">
              Authorized Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email-input"
                type="email"
                placeholder="admin@bmproperties.com"
                className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#0ea5e9]'
                } transition-all`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address syntax'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="password-input">
              Console Secret Code
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#0ea5e9]'
                } transition-all`}
                {...register('password', { required: 'Console Password code is REQUIRED' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.password.message}</span>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-[#0A1F44] hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-[#0A1F44]/10 active:scale-98 flex items-center justify-center cursor-pointer"
          >
            Access Dashboard Account
          </button>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            BM Properties · Agra, UP, IND
          </p>
        </div>
      </div>
    </div>
  );
};
