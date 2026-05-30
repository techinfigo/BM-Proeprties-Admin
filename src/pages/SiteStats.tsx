/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, HelpCircle, Award, Users, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { SiteStats as SiteStatsType } from '../types';

export const SiteStats: React.FC = () => {
  const { siteStats, updateSiteStats } = useData();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SiteStatsType>();

  useEffect(() => {
    if (siteStats) {
      setValue('verifiedPlotsCount', siteStats.verifiedPlotsCount);
      setValue('plotsLabel', siteStats.plotsLabel);
      setValue('luxuryVillasCount', siteStats.luxuryVillasCount);
      setValue('villasLabel', siteStats.villasLabel);
      setValue('premiumFlatsCount', siteStats.premiumFlatsCount);
      setValue('flatsLabel', siteStats.flatsLabel);
      setValue('yearsOfExperience', siteStats.yearsOfExperience);
      setValue('happyClientsCount', siteStats.happyClientsCount);
    }
  }, [siteStats, setValue]);

  const onSubmit = (data: SiteStatsType) => {
    startTransition(() => {
      updateSiteStats(data);
      showToast('Website platform statistics saved successfully!', 'success');
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Platform Metrics Controller</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Revise metric highlights shown in "Destinations We Love The Most" and platform summary sections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Form metrics editing */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-6">
            <BarChart3 className="text-[#0ea5e9] w-5 h-5" />
            <span className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">Metrics Configurations</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            
            {/* Row 1: Verified Plots */}
            <div className="p-4 bg-slate-50 border border-slate-50/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="verifiedPlotsCount-field" className="text-xs font-bold text-slate-700">
                  Verified Plots Actual Count
                </label>
                <input
                  id="verifiedPlotsCount-field"
                  type="number"
                  className="w-full px-3 py-1.5 bg-white rounded-md text-xs border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('verifiedPlotsCount', { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="plotsLabel-field" className="text-xs font-bold text-slate-700">
                  Plots Frontend Display Label
                </label>
                <input
                  id="plotsLabel-field"
                  type="text"
                  placeholder="e.g. 150+"
                  className="w-full px-3 py-1.5 bg-white rounded-md text-xs border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('plotsLabel')}
                />
              </div>
            </div>

            {/* Row 2: Luxury Villas */}
            <div className="p-4 bg-slate-50 border border-slate-50/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label id="luxuryVillasCount-label" htmlFor="luxuryVillasCount-field" className="text-xs font-bold text-slate-700">
                  Luxury Villas Actual Count
                </label>
                <input
                  id="luxuryVillasCount-field"
                  aria-labelledby="luxuryVillasCount-label"
                  type="number"
                  className="w-full px-3 py-1.5 bg-white rounded-md text-xs border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('luxuryVillasCount', { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label id="villasLabel-label" htmlFor="villasLabel-field" className="text-xs font-bold text-slate-700">
                  Villas Frontend Display Label
                </label>
                <input
                  id="villasLabel-field"
                  aria-labelledby="villasLabel-label"
                  type="text"
                  placeholder="e.g. 45+"
                  className="w-full px-3 py-1.5 bg-white rounded-md text-xs border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('villasLabel')}
                />
              </div>
            </div>

            {/* Row 3: Premium Flats */}
            <div className="p-4 bg-slate-50 border border-slate-50/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label id="premiumFlatsCount-label" htmlFor="premiumFlatsCount-field" className="text-xs font-bold text-slate-700">
                  Premium Flats Actual Count
                </label>
                <input
                  id="premiumFlatsCount-field"
                  aria-labelledby="premiumFlatsCount-label"
                  type="number"
                  className="w-full px-3 py-1.5 bg-white rounded-md text-xs border border-slate-200' focus:outline-[#0ea5e9]"
                  {...register('premiumFlatsCount', { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label id="flatsLabel-label" htmlFor="flatsLabel-field" className="text-xs font-bold text-slate-700">
                  Flats Frontend Display Label
                </label>
                <input
                  id="flatsLabel-field"
                  aria-labelledby="flatsLabel-label"
                  type="text"
                  placeholder="e.g. 220+"
                  className="w-full px-3 py-1.5 bg-white rounded-md text-xs border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('flatsLabel')}
                />
              </div>
            </div>

            {/* Row 4: Professional Experience & Happy Clients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="yearsOfExperience-field" className="text-xs font-bold text-slate-700">
                  Years of Experience Count
                </label>
                <input
                  id="yearsOfExperience-field"
                  type="number"
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-md text-xs border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('yearsOfExperience', { valueAsNumber: true })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label id="happyClientsCount-label" htmlFor="happyClientsCount-field" className="text-xs font-bold text-slate-700">
                  Happy Clients / Buyers Served
                </label>
                <input
                  id="happyClientsCount-field"
                  aria-labelledby="happyClientsCount-label"
                  type="number"
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-md text-xs border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('happyClientsCount', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Save Stats control */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-3 py-3 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white text-xs font-bold uppercase rounded-lg shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              Update Website Stats
            </button>
          </form>
        </div>

        {/* Right column: Stat graphics mock overview */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 block">Live Stats Widget Mockup</span>

          <div className="bg-[#0A1F44] text-white p-6 rounded-2xl border border-slate-700/20 shadow-md">
            <h4 className="text-sm font-bold text-[#0ea5e9] tracking-wider uppercase">Destinations of Agra</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Highlighted statistics counters</p>

            {/* Simulated Live visual metrics slots */}
            <div className="flex flex-col gap-4 mt-5">
              
              <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <div className="w-10 h-10 rounded bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Plots listings</span>
                  <h5 className="text-lg font-bold text-white mt-0.5">{watch('plotsLabel') || '0+'}</h5>
                  <p className="text-[9px] text-slate-500 font-medium">Total: {watch('verifiedPlotsCount') || '0'} verified land structures</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <div className="w-10 h-10 rounded bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Villas & Duplexes</span>
                  <h5 className="text-lg font-bold text-white mt-0.5">{watch('villasLabel') || '0+'}</h5>
                  <p className="text-[9px] text-slate-500 font-medium">Total: {watch('luxuryVillasCount') || '0'} luxury setups</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <div className="w-10 h-10 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Flats & Condos</span>
                  <h5 className="text-lg font-bold text-white mt-0.5">{watch('flatsLabel') || '0+'}</h5>
                  <p className="text-[9px] text-slate-500 font-medium">Total: {watch('premiumFlatsCount') || '0'} premium listings</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-850 pt-4 text-center">
              <div>
                <span className="text-[9px] text-[#0ea5e9] font-bold block uppercase">Agra Experience</span>
                <p className="text-sm font-bold text-white mt-0.5">{watch('yearsOfExperience') || '0'} Years</p>
              </div>
              <div className="border-l border-slate-850">
                <span className="text-[9px] text-[#10b981] font-bold block uppercase">Clientele Base</span>
                <p className="text-sm font-bold text-white mt-0.5">{watch('happyClientsCount') || '0'}+ Happy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
