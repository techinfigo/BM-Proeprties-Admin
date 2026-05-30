/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  MessageSquare,
  Plus,
  Star,
  Quote,
  Pencil,
  Trash2,
  X,
  MapPin,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { Testimonial } from '../types';

interface TestimonialFormInputs {
  customerName: string;
  location: string;
  reviewText: string;
  initials: string;
  avatarColor: 'navy' | 'sky' | 'amber' | 'green';
  rating: number;
}

const colorClasses: Record<string, string> = {
  navy: 'bg-[#0A1F44] text-white',
  sky: 'bg-[#0ea5e9] text-white',
  amber: 'bg-[#f59e0b] text-slate-950',
  green: 'bg-[#10b981] text-white'
};

export const Testimonials: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useData();
  const { showToast } = useToast();

  // Modal and Edit handling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TestimonialFormInputs>({
    defaultValues: {
      customerName: '',
      location: '',
      reviewText: '',
      initials: '',
      avatarColor: 'navy',
      rating: 5
    }
  });

  const watchedName = watch('customerName');

  // Trigger auto initials deduction when name updates
  useEffect(() => {
    if (watchedName) {
      const parts = watchedName.trim().split(/\s+/);
      const initialsStr = parts
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
      setValue('initials', initialsStr);
    }
  }, [watchedName, setValue]);

  // Handle open modal for addition
  const handleOpenAdd = () => {
    setEditId(null);
    reset({
      customerName: '',
      location: '',
      reviewText: '',
      initials: '',
      avatarColor: 'navy',
      rating: 5
    });
    setIsModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEdit = (testimonial: Testimonial) => {
    setEditId(testimonial.id);
    reset({
      customerName: testimonial.customerName,
      location: testimonial.location,
      reviewText: testimonial.reviewText,
      initials: testimonial.initials,
      avatarColor: testimonial.avatarColor,
      rating: testimonial.rating
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the testimonial from "${name}"?`)) {
      deleteTestimonial(id);
      showToast('Testimonial record deleted successfully', 'success');
    }
  };

  const onSubmit = (data: TestimonialFormInputs) => {
    if (editId) {
      updateTestimonial(editId, data);
      showToast('Testimonial updated successfully!', 'success');
    } else {
      addTestimonial(data);
      showToast('New testimonial review created successfully!', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Customer Testimonials</h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {testimonials.length} reviews shown within the customer feedback carousel
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl py-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto">
          <MessageSquare className="w-14 h-14 text-slate-350 mb-3" />
          <h4 className="font-bold text-[#0A1F44] text-base mb-1">No reviews yet</h4>
          <p className="text-xs text-slate-500 max-w-sm px-4">
            Testimonials from buyers can build deep real-estate trust. Click the top button to formulate your first feedback list item!
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1F44] text-xs font-bold rounded-lg cursor-pointer"
          >
            Create first review
          </button>
        </div>
      ) : (
        /* Testimonial Cards list grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between relative hover:shadow-md transition-all group"
            >
              {/* Overlaid Large Quote Icon */}
              <div className="absolute top-5 right-5 text-slate-100 group-hover:text-sky-100/30 transition-colors pointer-events-none">
                <Quote className="w-10 h-10 transform scale-x-[-1]" />
              </div>

              <div>
                {/* Visual Rating Star bar */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < test.rating
                          ? 'text-[#f59e0b] fill-[#f59e0b]'
                          : 'text-slate-200 fill-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Body review content */}
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic pr-4">
                  "{test.reviewText}"
                </p>
              </div>

              {/* Lower Avatar info and actions toolbar */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                {/* Profile Avatar */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs border border-white flex-shrink-0 ${
                      colorClasses[test.avatarColor] || colorClasses.navy
                    }`}
                  >
                    {test.initials || 'A'}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A1F44] text-xs leading-none">
                      {test.customerName}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1 font-semibold">
                      <MapPin className="w-2.5 h-2.5" />
                      {test.location}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(test)}
                    className="p-1.5 hover:bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-md transition-colors"
                    title="Edit review"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(test.id, test.customerName)}
                    className="p-1.5 hover:bg-[#ef4444]/10 text-[#ef4444] rounded-md transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM OVERLAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0A1F44]/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0A1F44] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0ea5e9]" />
                <span className="font-bold text-sm tracking-wide">
                  {editId ? 'Modify Testimonial details' : 'Draft New Client Testimonial'}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Forms Area */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-4">
              {/* Customer Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="customerName-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                  Customer Name *
                </label>
                <input
                  id="customerName-field"
                  type="text"
                  placeholder="e.g. Ramesh Chandra Shastry"
                  className={`w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border hover:border-slate-350 focus:outline-[#0ea5e9] ${
                    errors.customerName ? 'border-red-500' : 'border-slate-200'
                  }`}
                  {...register('customerName', { required: 'Please specify customer name' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Location */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="location-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                    Sustained Location *
                  </label>
                  <input
                    id="location-field"
                    type="text"
                    placeholder="e.g. Sikandra, Agra"
                    className={`w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border hover:border-slate-350 focus:outline-[#0ea5e9] ${
                      errors.location ? 'border-red-500' : 'border-slate-200'
                    }`}
                    {...register('location', { required: 'Location details required' })}
                  />
                </div>

                {/* Rating selection bar */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="rating-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                    Star rating (1-5) *
                  </label>
                  <select
                    id="rating-field"
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                    {...register('rating', { valueAsNumber: true })}
                  >
                    <option value={5}>5 Stars Exceptional</option>
                    <option value={4}>4 Stars Good</option>
                    <option value={3}>3 Stars Average</option>
                    <option value={2}>2 Stars Below average</option>
                    <option value={1}>1 Star Poor</option>
                  </select>
                </div>
              </div>

              {/* Initials & Color Picker */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex flex-col gap-1">
                  <label id="initials-label" htmlFor="initials-field" className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                    Auto Initials Preview
                  </label>
                  <input
                    id="initials-field"
                    aria-labelledby="initials-label"
                    type="text"
                    maxLength={2}
                    className="w-full px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-[#0A1F44] border border-slate-200 focus:outline-hidden"
                    {...register('initials', { required: 'Initials are required' })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="avatarColor-field" className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                    Avatar Visual color
                  </label>
                  <select
                    id="avatarColor-field"
                    className="w-full px-3 py-1.5 bg-white rounded-lg text-xs text-[#0A1F44] border border-slate-200"
                    {...register('avatarColor')}
                  >
                    <option value="navy">Classic Navy dark</option>
                    <option value="sky">Bright Sky blue</option>
                    <option value="amber">Warm Amber gold</option>
                    <option value="green">Fresh mint Green</option>
                  </select>
                </div>
              </div>

              {/* Review Text */}
              <div className="flex flex-col gap-1">
                <label htmlFor="reviewText-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                  Review Text comments *
                </label>
                <textarea
                  id="reviewText-field"
                  rows={4}
                  placeholder="Provide realistic feedback details of what the client loved about BM Properties..."
                  className={`w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border hover:border-slate-350 focus:outline-[#0ea5e9] ${
                    errors.reviewText ? 'border-red-500' : 'border-slate-200'
                  }`}
                  {...register('reviewText', { required: 'Review details cannot be blank' })}
                />
              </div>

              {/* Modal controls footer */}
              <div className="flex gap-2 items-center justify-end border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A1F44] hover:bg-emerald-600 hover:text-white transition-all text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {editId ? 'Update Feedback' : 'Publish Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
