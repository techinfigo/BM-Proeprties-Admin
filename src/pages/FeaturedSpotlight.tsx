/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Star, Smartphone, Image as ImageIcon, MapPin, IndianRupee, Sparkles, Check } from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';

interface SpotlightFormInputs {
  title: string;
  locationLabel: string;
  description: string;
  bhk: number;
  bathrooms: number;
  area: number;
  priceLabel: string;
  imageUrl: string;
  whatsappNumber: string;
}

export const FeaturedSpotlight: React.FC = () => {
  const { featuredSpotlight, updateFeaturedSpotlight } = useData();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SpotlightFormInputs>();

  // Pre-fill initial values
  useEffect(() => {
    if (featuredSpotlight) {
      setValue('title', featuredSpotlight.title);
      setValue('locationLabel', featuredSpotlight.locationLabel);
      setValue('description', featuredSpotlight.description);
      setValue('bhk', featuredSpotlight.bhk);
      setValue('bathrooms', featuredSpotlight.bathrooms);
      setValue('area', featuredSpotlight.area);
      setValue('priceLabel', featuredSpotlight.priceLabel);
      setValue('imageUrl', featuredSpotlight.imageUrl);
      setValue('whatsappNumber', featuredSpotlight.whatsappNumber);
    }
  }, [featuredSpotlight, setValue]);

  const watchedImageUrl = watch('imageUrl');
  const watchedNumber = watch('whatsappNumber');

  // Compute live dynamic WhatsApp contact link
  const computedWhatsAppLink = watchedNumber
    ? `https://wa.me/${watchedNumber.replace(/\D/g, '')}?text=Hi,%20I'm%20interested%20in%20the%2520Featured%20Spotlight%20Property`
    : '';

  const onSubmit = (data: SpotlightFormInputs) => {
    startTransition(() => {
      updateFeaturedSpotlight(data);
      showToast('Featured Spotlight landing page card updated successfully!', 'success');
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Main Homepage Spotlight</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Modify the primary hero spotlight property showcased on the homepage of BM Properties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Form Editor */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9] mb-5">
            <Star className="text-[#f59e0b] w-5 h-5 fill-[#f59e0b]" />
            <span className="font-bold text-[#0A1F44] text-sm uppercase tracking-wider">Spotlight Settings</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title-field" className="text-xs font-bold text-slate-650 uppercase tracking-wider">
                Estate Spotlight Title *
              </label>
              <input
                id="title-field"
                type="text"
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-350 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] ${
                  errors.title ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('title', { required: 'Please supply a title' })}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label id="locationLabel-label" htmlFor="locationLabel-field" className="text-xs font-bold text-slate-650 uppercase tracking-wider">
                  Location label *
                </label>
                <input
                  id="locationLabel-field"
                  aria-labelledby="locationLabel-label"
                  type="text"
                  placeholder="e.g. Shahpur Crossing, Agra"
                  className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:outline-[#0ea5e9] ${
                    errors.locationLabel ? 'border-red-500' : 'border-slate-200'
                  }`}
                  {...register('locationLabel', { required: 'Location label is required' })}
                />
              </div>

              {/* Price Label */}
              <div className="flex flex-col gap-1.5">
                <label id="priceLabel-label" htmlFor="priceLabel-field" className="text-xs font-bold text-slate-650 uppercase tracking-wider">
                  Asking Price Label *
                </label>
                <input
                  id="priceLabel-field"
                  aria-labelledby="priceLabel-label"
                  type="text"
                  placeholder="e.g. ₹1.8 Crore"
                  className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:outline-[#0ea5e9] ${
                    errors.priceLabel ? 'border-red-500' : 'border-slate-200'
                  }`}
                  {...register('priceLabel', { required: 'Price designation is required' })}
                />
              </div>
            </div>

            {/* Description Area */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description-field" className="text-xs font-bold text-slate-650 uppercase tracking-wider">
                Platform description context *
              </label>
              <textarea
                id="description-field"
                rows={4}
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:outline-[#0ea5e9] ${
                  errors.description ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('description', { required: 'Details required' })}
              />
            </div>

            {/* Criteria grids: BHK, Bathrooms, Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label id="bhk-label" htmlFor="bhk-field" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  BHK Rooms
                </label>
                <input
                  id="bhk-field"
                  aria-labelledby="bhk-label"
                  type="number"
                  className="w-full px-4 py-2 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                  {...register('bhk', { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label id="bathrooms-label" htmlFor="bathrooms-field" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Bathrooms
                </label>
                <input
                  id="bathrooms-field"
                  aria-labelledby="bathrooms-label"
                  type="number"
                  className="w-full px-4 py-2 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                  {...register('bathrooms', { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label id="area-label" htmlFor="area-field" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Area (SqFt)
                </label>
                <input
                  id="area-field"
                  aria-labelledby="area-label"
                  type="number"
                  className="w-full px-4 py-2 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                  {...register('area', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Image Link */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="imageUrl-field" className="text-xs font-bold text-slate-650 uppercase tracking-wider">
                Hero Image URL *
              </label>
              <input
                id="imageUrl-field"
                type="text"
                placeholder="https://images.unsplash.com/..."
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:outline-[#0ea5e9] ${
                  errors.imageUrl ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('imageUrl', { required: 'Please enter focal image link' })}
              />
            </div>

            {/* WhatsApp Contact */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="whatsappNumber-field" className="text-xs font-bold text-slate-650 uppercase tracking-wider">
                Inquiry WhatsApp Number (e.g. 919837029310)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  id="whatsappNumber-field"
                  type="text"
                  placeholder="919837029310"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                  {...register('whatsappNumber')}
                />
              </div>
            </div>

            {/* Action Save button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 px-4 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              Update Spotlight Settings
            </button>
          </form>
        </div>

        {/* Right Side: Real-time visual Mock Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 block">Live Website Widget Preview</span>
          
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 text-white p-5 flex flex-col relative">
            <div className="absolute top-4 right-4 bg-[#f59e0b] text-slate-950 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full z-10 flex items-center gap-1">
              <Star className="w-3 h-3 fill-slate-950" />
              <span>Today's Spotlight</span>
            </div>

            {/* Spotlight Banner Photo */}
            <div className="h-56 bg-slate-900 rounded-lg overflow-hidden relative">
              {watchedImageUrl ? (
                <img
                  src={watchedImageUrl}
                  alt="Live showcase preview"
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0ea5e9]/10 text-[#0ea5e9]">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              {/* Overlaid Title and price label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-4 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-1 text-slate-300 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{watch('locationLabel') || 'Agra, UP'}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-yellow-500 mt-0.5 truncate max-w-sm">
                    {watch('title') || 'Untitled Premium Listing'}
                  </h4>
                </div>
                <div className="bg-slate-900/90 text-[#10b981] font-extrabold text-sm px-2.5 py-1 rounded border border-emerald-500/20">
                  {watch('priceLabel') || '₹ TBD'}
                </div>
              </div>
            </div>

            {/* Small particulars info bar */}
            <div className="grid grid-cols-3 bg-white/5 border border-white/5 rounded-lg py-3 px-2 text-center text-xs mt-4">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-medium">BHK Rooms</span>
                <p className="font-bold text-yellow-500 mt-0.5">{watch('bhk') || '0'} BHK</p>
              </div>
              <div className="border-x border-white/5">
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Bathrooms</span>
                <p className="font-bold text-slate-200 mt-0.5">{watch('bathrooms') || '0'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Gross Area</span>
                <p className="font-bold text-slate-200 mt-0.5">{watch('area') || '0'} Sq.Ft</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-xs mt-3 leading-relaxed line-clamp-3">
              {watch('description') || 'Provide a compelling premium description context to display onto the spotlight dashboard view.'}
            </p>

            {/* CTA action buttons */}
            <div className="flex items-center gap-3.5 mt-5">
              <a
                href={computedWhatsAppLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Enquire via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
