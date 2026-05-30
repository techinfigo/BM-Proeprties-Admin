/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import {
  Phone,
  Smartphone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Sparkles,
  CheckCircle,
  Building,
  Info
} from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { ContactInfo as ContactInfoType } from '../types';

export const ContactInfo: React.FC = () => {
  const { contactInfo, updateContactInfo } = useData();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ContactInfoType>();

  useEffect(() => {
    if (contactInfo) {
      setValue('whatsappNumber', contactInfo.whatsappNumber);
      setValue('phoneNumber', contactInfo.phoneNumber);
      setValue('emailAddress', contactInfo.emailAddress);
      setValue('addressLine', contactInfo.addressLine);
      setValue('city', contactInfo.city || 'Agra');
      setValue('state', contactInfo.state || 'Uttar Pradesh');
      setValue('pinCode', contactInfo.pinCode);
      setValue('weekdayHours', contactInfo.weekdayHours);
      setValue('sundayType', contactInfo.sundayType || 'Closed');
      setValue('sundayHours', contactInfo.sundayHours || '');
      setValue('facebookUrl', contactInfo.facebookUrl || '');
      setValue('instagramUrl', contactInfo.instagramUrl || '');
      setValue('youtubeUrl', contactInfo.youtubeUrl || '');
    }
  }, [contactInfo, setValue]);

  const watchedSundayType = watch('sundayType');

  const onSubmit = (data: ContactInfoType) => {
    startTransition(() => {
      updateContactInfo(data);
      showToast('Contact and location specifications updated successfully!', 'success');
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Contact & Location Panel</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Revise authorized office numbers, active WhatsApp redirects, timing matrix and local state addresses.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        
        {/* SECTION 1 - Primary Contact */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Smartphone className="text-[#0ea5e9] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">SECTION 1 — Hotline Channels</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* WhatsApp with +91 Country Label */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label htmlFor="whatsappNumber-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                WhatsApp Phone Code
              </label>
              <div className="relative flex rounded-lg overflow-hidden border border-slate-200">
                <span className="bg-slate-100 border-r border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 flex items-center justify-center">
                  +91
                </span>
                <input
                  id="whatsappNumber-field"
                  type="text"
                  placeholder="919837029310"
                  className="w-full px-3 py-2 bg-slate-50 text-xs text-[#0A1F44] focus:bg-white focus:outline-hidden"
                  {...register('whatsappNumber', { required: 'WhatsApp code is required' })}
                />
              </div>
            </div>

            {/* General phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phoneNumber-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Voice Telephone *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="phoneNumber-field"
                  type="text"
                  placeholder="+91 98370 29310"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('phoneNumber', { required: 'Voice Phone line is required' })}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="emailAddress-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Authorized Email *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="emailAddress-field"
                  type="email"
                  placeholder="info@bmpropertiesagra.com"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('emailAddress', { required: 'Corporate Email is required' })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 - Office Address */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <MapPin className="text-[#f59e0b] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">SECTION 2 — Headquarters Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Address Line */}
            <div className="flex flex-col gap-1.5 md:col-span-4">
              <label htmlFor="addressLine-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Full Address Details *
              </label>
              <textarea
                id="addressLine-field"
                rows={2}
                placeholder="Block No-25, Sanjay Palace, Civil Lines"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                {...register('addressLine', { required: 'Postal building address is required' })}
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                City Label
              </label>
              <input
                id="city-field"
                type="text"
                className="w-full px-4 py-2 bg-slate-100 rounded-lg text-xs text-slate-500 font-bold border border-slate-200 focus:outline-hidden"
                {...register('city')}
              />
            </div>

            {/* State */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="state-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                State Label
              </label>
              <input
                id="state-field"
                type="text"
                className="w-full px-4 py-2 bg-slate-100 rounded-lg text-xs text-slate-500 font-bold border border-slate-200 focus:outline-hidden"
                {...register('state')}
              />
            </div>

            {/* PIN code */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="pinCode-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                PIN Code *
              </label>
              <input
                id="pinCode-field"
                type="text"
                placeholder="282002"
                className="w-full px-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                {...register('pinCode', { required: 'POST PIN is required' })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3 - Working Hours */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Clock className="text-[#10b981] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">SECTION 3 — Office Hours Schedule</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Weekday Hours */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label htmlFor="weekdayHours-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Weekday Timing (Mon-Sat) *
              </label>
              <input
                id="weekdayHours-field"
                type="text"
                placeholder="Mon - Sat: 9:30 AM to 7:00 PM"
                className="w-full px-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                {...register('weekdayHours', { required: 'Timing detail cannot be empty' })}
              />
            </div>

            {/* Sunday Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sundayType-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Sunday Status
              </label>
              <select
                id="sundayType-field"
                className="w-full px-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                {...register('sundayType')}
              >
                <option value="Closed">Closed for Weekend</option>
                <option value="Open">Open with custom time</option>
              </select>
            </div>

            {/* Dynamic Sunday Hours Input (if Open selected) */}
            {watchedSundayType === 'Open' ? (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-left-3 duration-200">
                <label id="sundayHours-label" htmlFor="sundayHours-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                  Sunday Timing hours *
                </label>
                <input
                  id="sundayHours-field"
                  aria-labelledby="sundayHours-label"
                  type="text"
                  placeholder="e.g. 10:00 AM to 2:00 PM"
                  className="w-full px-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('sundayHours', { required: 'Please supply Sunday timings' })}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* SECTION 4 - Social Media Links */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Facebook className="text-blue-600 w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">SECTION 4 — Media Channel Links</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Facebook URL */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="facebookUrl-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider flex items-center gap-1">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook Link</span>
              </label>
              <input
                id="facebookUrl-field"
                type="text"
                placeholder="https://facebook.com/bmproperties..."
                className="w-full px-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200"
                {...register('facebookUrl')}
              />
            </div>

            {/* Instagram URL */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="instagramUrl-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile</span>
              </label>
              <input
                id="instagramUrl-field"
                type="text"
                placeholder="https://instagram.com/bmproperties..."
                className="w-full px-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200"
                {...register('instagramUrl')}
              />
            </div>

            {/* YouTube URL */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="youtubeUrl-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider flex items-center gap-1">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>YouTube Channel</span>
              </label>
              <input
                id="youtubeUrl-field"
                type="text"
                placeholder="https://youtube.com/c/bmproperties..."
                className="w-full px-4 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200"
                {...register('youtubeUrl')}
              />
            </div>
          </div>
        </div>

        {/* Full-width save hotline configurations */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4.5 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {isPending ? 'Updating...' : 'Save Contact Info'}
        </button>
      </form>
    </div>
  );
};
