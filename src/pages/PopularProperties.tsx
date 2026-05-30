/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useTransition } from 'react';
import { Heart, Image as ImageIcon, Smartphone, MapPin, Sparkles, Check } from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { PopularProperty } from '../types';

export const PopularProperties: React.FC = () => {
  const { popularProperties, updatePopularProperties } = useData();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Local state to manage multiple card objects
  const [cards, setCards] = useState<PopularProperty[]>([]);

  useEffect(() => {
    if (popularProperties && popularProperties.length > 0) {
      setCards(popularProperties);
    }
  }, [popularProperties]);

  const handleFieldChange = (index: number, field: keyof PopularProperty, value: any) => {
    setCards((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return copy;
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      updatePopularProperties(cards);
      showToast('All 4 Popular Property Cards saved successfully!', 'success');
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Homepage Popular Cards Controller</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Explicitly tune the 4 primary property cards displayed within the popular section of the live landing page.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="flex flex-col gap-8">
        {/* Editors: 2x2 Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <div
              key={card.id || index}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-5"
            >
              {/* Left Column: Form Elements */}
              <div className="flex-1 flex flex-col gap-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <h4 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">
                    Popular Card Slot #{index + 1}
                  </h4>
                </div>

                {/* Card Title */}
                <div className="flex flex-col gap-1">
                  <label htmlFor={`title-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                    Property Title
                  </label>
                  <input
                    id={`title-field-${index}`}
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                  />
                </div>

                {/* Locality & Price Label */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`locality-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                      Locality Label
                    </label>
                    <input
                      id={`locality-field-${index}`}
                      type="text"
                      value={card.locality || ''}
                      onChange={(e) => handleFieldChange(index, 'locality', e.target.value)}
                      required
                      placeholder="e.g. Sikandra, Agra"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor={`priceLabel-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                      Price Label
                    </label>
                    <input
                      id={`priceLabel-field-${index}`}
                      type="text"
                      value={card.priceLabel || ''}
                      onChange={(e) => handleFieldChange(index, 'priceLabel', e.target.value)}
                      required
                      placeholder="e.g. ₹45 Lakh"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                    />
                  </div>
                </div>

                {/* Status Badges & Category Types */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`statusBadge-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                      Status Badge
                    </label>
                    <select
                      id={`statusBadge-field-${index}`}
                      value={card.statusBadge || 'NEW'}
                      onChange={(e) => handleFieldChange(index, 'statusBadge', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200"
                    >
                      <option value="FEATURED">FEATURED</option>
                      <option value="HOT DEAL">HOT DEAL</option>
                      <option value="NEW">NEW LISTING</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor={`type-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-semibold">
                      Property Category
                    </label>
                    <select
                      id={`type-field-${index}`}
                      value={card.type || 'FLAT'}
                      onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200"
                    >
                      <option value="FLAT">FLAT</option>
                      <option value="PLOT">PLOT</option>
                      <option value="VILLA">VILLA</option>
                      <option value="HOUSE">HOUSE</option>
                      <option value="COMMERCIAL">COMMERCIAL</option>
                    </select>
                  </div>
                </div>

                {/* Area & Rooms Label */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label id={`area-label-${index}`} htmlFor={`area-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                      Area Label Scale
                    </label>
                    <input
                      id={`area-field-${index}`}
                      aria-labelledby={`area-label-${index}`}
                      type="text"
                      value={card.area || ''}
                      onChange={(e) => handleFieldChange(index, 'area', e.target.value)}
                      placeholder="e.g. 1250 SQ.FT"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label id={`bhkLabel-label-${index}`} htmlFor={`bhkLabel-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                      BHK / Setup text
                    </label>
                    <input
                      id={`bhkLabel-field-${index}`}
                      aria-labelledby={`bhkLabel-label-${index}`}
                      type="text"
                      value={card.bhkLabel || ''}
                      onChange={(e) => handleFieldChange(index, 'bhkLabel', e.target.value)}
                      placeholder="e.g. 3 BHK Apartment"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                    />
                  </div>
                </div>

                {/* Image & Link Slug */}
                <div className="flex flex-col gap-1">
                  <label htmlFor={`imageUrl-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider animate-pulse inline-block">
                    Image Link URL
                  </label>
                  <input
                    id={`imageUrl-field-${index}`}
                    type="text"
                    value={card.imageUrl || ''}
                    onChange={(e) => handleFieldChange(index, 'imageUrl', e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={`slug-field-${index}`} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                    Redirect Slug Link
                  </label>
                  <input
                    id={`slug-field-${index}`}
                    type="text"
                    value={card.slug || ''}
                    onChange={(e) => handleFieldChange(index, 'slug', e.target.value)}
                    placeholder="e.g. spacious-3-bhk-apartment"
                    className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                  />
                </div>
              </div>

              {/* Right Column: Mini card visual preview */}
              <div className="w-full md:w-44 flex flex-col gap-3.5 bg-slate-50 border border-slate-100 p-3.5 rounded-xl justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-widest leading-none mb-2">
                    Card {index + 1} Preview
                  </span>

                  {/* Tiny mockup card layout */}
                  <div className="bg-white rounded-lg shadow-xs overflow-hidden border border-slate-100 flex flex-col">
                    <div className="h-24 bg-slate-900 relative">
                      {/* Badge overlay */}
                      <span className="absolute top-1.5 left-1.5 bg-[#0ea5e9] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {card.statusBadge || 'NEW'}
                      </span>
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt="Layout representation Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=200&q=40';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full items-center justify-center flex bg-[#0ea5e9]/5 text-[#0ea5e9]">
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    {/* Bottom body */}
                    <div className="p-2.5 flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-sky-600 block uppercase leading-none">
                        {card.type || 'FLAT'}
                      </span>
                      <h5 className="font-extrabold text-[10px] text-[#0A1F44] leading-normal line-clamp-1">
                        {card.title || 'Untitled Card'}
                      </h5>
                      <div className="flex items-center gap-0.5 text-slate-400 text-[8px] mt-0.5">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate max-w-[85px]">{card.locality || 'Agra'}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-1.5 mt-1">
                        <span className="text-[9px] font-bold text-emerald-600">{card.priceLabel || '₹TBD'}</span>
                        <span className="text-[8px] text-slate-400 font-medium">{card.area || '0 SQFt'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-[#475569] font-medium leading-relaxed bg-[#0ea5e9]/10 p-2 rounded-lg border border-[#0ea5e9]/15">
                  Click 'Save All' below to push these edits live.
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons submission toolbar */}
        <div className="flex items-center justify-end gap-3.5 border-t border-slate-25 pt-6">
          <button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto px-10 py-3.5 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            Save All Popular Properties
          </button>
        </div>
      </form>
    </div>
  );
};
