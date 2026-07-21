/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Smartphone,
  Video,
  FileText,
  Play,
  CloudUpload
} from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { Testimonial } from '../types';

interface TestimonialFormInputs {
  testimonialType: 'text' | 'whatsapp' | 'video';
  customerName: string;
  location: string;
  // text
  reviewText: string;
  initials: string;
  avatarColor: 'navy' | 'sky' | 'amber' | 'green';
  rating: number;
  // whatsapp
  screenshotUrl: string;
  caption: string;
  // video
  videoUrl: string;
  thumbnailUrl: string;
  videoTitle: string;
  duration: string;
}

const colorClasses: Record<string, string> = {
  navy: 'bg-[#0A1F44] text-white',
  sky: 'bg-[#0ea5e9] text-white',
  amber: 'bg-[#f59e0b] text-slate-950',
  green: 'bg-[#10b981] text-white'
};

const TYPE_BADGES = {
  text: { label: '📝 Text', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  whatsapp: { label: '📱 WhatsApp', cls: 'bg-green-50 text-green-700 border-green-100' },
  video: { label: '🎥 Video', cls: 'bg-purple-50 text-purple-700 border-purple-100' }
};

export const Testimonials: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotUploadProgress, setScreenshotUploadProgress] = useState(0);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TestimonialFormInputs>({
    defaultValues: {
      testimonialType: 'text',
      customerName: '',
      location: '',
      reviewText: '',
      initials: '',
      avatarColor: 'navy',
      rating: 5,
      screenshotUrl: '',
      caption: '',
      videoUrl: '',
      thumbnailUrl: '',
      videoTitle: '',
      duration: ''
    }
  });

  const watchedType = watch('testimonialType');
  const watchedName = watch('customerName');
  const watchedScreenshot = watch('screenshotUrl');
  const watchedThumbnail = watch('thumbnailUrl');

  useEffect(() => {
    if (watchedName && watchedType === 'text') {
      const parts = watchedName.trim().split(/\s+/);
      const initialsStr = parts.map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
      setValue('initials', initialsStr);
    }
  }, [watchedName, watchedType, setValue]);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be under 10 MB.', 'warning');
      return;
    }

    const path = `testimonial-screenshots/${Date.now()}-${file.name}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);

    setIsUploadingScreenshot(true);
    setScreenshotUploadProgress(0);

    task.on(
      'state_changed',
      (snap) => setScreenshotUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error(err);
        showToast('Upload failed. Check Firebase Storage rules.', 'error');
        setIsUploadingScreenshot(false);
        setScreenshotUploadProgress(0);
        if (screenshotInputRef.current) screenshotInputRef.current.value = '';
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setValue('screenshotUrl', url);
        showToast('Screenshot uploaded successfully!', 'success');
        setIsUploadingScreenshot(false);
        setScreenshotUploadProgress(0);
        if (screenshotInputRef.current) screenshotInputRef.current.value = '';
      }
    );
  };

  const blankForm = (): Partial<TestimonialFormInputs> => ({
    testimonialType: 'text',
    customerName: '',
    location: '',
    reviewText: '',
    initials: '',
    avatarColor: 'navy',
    rating: 5,
    screenshotUrl: '',
    caption: '',
    videoUrl: '',
    thumbnailUrl: '',
    videoTitle: '',
    duration: ''
  });

  const handleOpenAdd = () => {
    setEditId(null);
    reset(blankForm());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditId(t.id);
    reset({
      testimonialType: t.testimonialType || 'text',
      customerName: t.customerName,
      location: t.location,
      reviewText: t.reviewText || '',
      initials: t.initials || '',
      avatarColor: t.avatarColor || 'navy',
      rating: t.rating ?? 5,
      screenshotUrl: t.screenshotUrl || '',
      caption: t.caption || '',
      videoUrl: t.videoUrl || '',
      thumbnailUrl: t.thumbnailUrl || '',
      videoTitle: t.videoTitle || '',
      duration: t.duration || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete testimonial from "${name}"?`)) {
      deleteTestimonial(id);
      showToast('Testimonial deleted successfully', 'success');
    }
  };

  const onSubmit = (data: TestimonialFormInputs) => {
    const payload: Omit<Testimonial, 'id'> = {
      testimonialType: data.testimonialType,
      customerName: data.customerName,
      location: data.location,
      ...(data.testimonialType === 'text' && {
        reviewText: data.reviewText,
        initials: data.initials,
        avatarColor: data.avatarColor,
        rating: Number(data.rating)
      }),
      ...(data.testimonialType === 'whatsapp' && {
        screenshotUrl: data.screenshotUrl,
        caption: data.caption
      }),
      ...(data.testimonialType === 'video' && {
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        videoTitle: data.videoTitle,
        duration: data.duration
      })
    };

    if (editId) {
      updateTestimonial(editId, payload);
      showToast('Testimonial updated successfully!', 'success');
    } else {
      addTestimonial(payload);
      showToast('New testimonial created successfully!', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Customer Testimonials</h2>
          <p className="text-xs text-slate-500 mt-1">
            {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} — text, WhatsApp screenshots & videos
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
          <MessageSquare className="w-14 h-14 text-slate-300 mb-3" />
          <h4 className="font-bold text-[#0A1F44] text-base mb-1">No testimonials yet</h4>
          <p className="text-xs text-slate-500 max-w-sm px-4">
            Add text reviews, WhatsApp screenshots, or video testimonials from happy clients.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1F44] text-xs font-bold rounded-lg cursor-pointer"
          >
            Create first testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const badge = TYPE_BADGES[t.testimonialType] || TYPE_BADGES.text;
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between relative hover:shadow-md transition-all group overflow-hidden"
              >
                {/* Type badge */}
                <div className="px-4 pt-4 pb-0 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 hover:bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-md transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.customerName)}
                      className="p-1.5 hover:bg-red-50 text-red-400 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col gap-3">

                  {/* TEXT type */}
                  {t.testimonialType === 'text' && (
                    <>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${idx < (t.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                          />
                        ))}
                      </div>
                      <div className="relative">
                        <Quote className="absolute -top-1 -left-1 w-6 h-6 text-slate-100 pointer-events-none" />
                        <p className="text-xs text-slate-600 leading-relaxed italic pl-4 pr-2">
                          "{t.reviewText}"
                        </p>
                      </div>
                    </>
                  )}

                  {/* WHATSAPP type */}
                  {t.testimonialType === 'whatsapp' && (
                    <>
                      {t.screenshotUrl && (
                        <img
                          src={t.screenshotUrl}
                          alt="WhatsApp screenshot"
                          className="w-full rounded-lg object-cover max-h-48 border border-slate-100"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      {t.caption && (
                        <p className="text-xs text-slate-500 italic">{t.caption}</p>
                      )}
                    </>
                  )}

                  {/* VIDEO type */}
                  {t.testimonialType === 'video' && (
                    <>
                      {t.thumbnailUrl ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={t.thumbnailUrl}
                            alt="Video thumbnail"
                            className="w-full object-cover max-h-40"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="bg-white/90 rounded-full p-2 shadow">
                              <Play className="w-5 h-5 text-[#0A1F44] fill-[#0A1F44]" />
                            </div>
                          </div>
                          {t.duration && (
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                              {t.duration}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <Video className="w-8 h-8 text-slate-300 flex-shrink-0" />
                          <span className="text-xs text-slate-400">No thumbnail</span>
                        </div>
                      )}
                      {t.videoTitle && (
                        <p className="text-xs font-semibold text-[#0A1F44] leading-snug">{t.videoTitle}</p>
                      )}
                      {t.videoUrl && (
                        <a
                          href={t.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#0ea5e9] underline truncate"
                        >
                          {t.videoUrl}
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-50 flex items-center gap-3">
                  {t.testimonialType === 'text' ? (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs border border-white flex-shrink-0 ${colorClasses[t.avatarColor || 'navy']}`}
                    >
                      {t.initials || 'A'}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {t.testimonialType === 'whatsapp' ? (
                        <Smartphone className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Video className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[#0A1F44] text-xs leading-none">{t.customerName}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-semibold">
                      <MapPin className="w-2.5 h-2.5" />
                      {t.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0A1F44]/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />

          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-250 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0A1F44] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0ea5e9]" />
                <span className="font-bold text-sm tracking-wide">
                  {editId ? 'Edit Testimonial' : 'Add New Testimonial'}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6 overflow-y-auto">

              {/* SECTION 1 — Type selector */}
              <div>
                <p className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider mb-2">Testimonial Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'text', icon: <FileText className="w-4 h-4" />, label: 'Text Review' },
                    { value: 'whatsapp', icon: <Smartphone className="w-4 h-4" />, label: 'WhatsApp Screenshot' },
                    { value: 'video', icon: <Video className="w-4 h-4" />, label: 'Video Testimonial' }
                  ] as const).map(({ value, icon, label }) => (
                    <label
                      key={value}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-all text-center ${
                        watchedType === value
                          ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 text-[#0ea5e9]'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        className="sr-only"
                        {...register('testimonialType')}
                      />
                      {icon}
                      <span className="text-[10px] font-bold leading-tight">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 2 — Common fields */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Info</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Chandra Shastry"
                      className={`w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border focus:outline-[#0ea5e9] ${errors.customerName ? 'border-red-400' : 'border-slate-200'}`}
                      {...register('customerName', { required: 'Customer name is required' })}
                    />
                    {errors.customerName && <p className="text-[10px] text-red-500 mt-0.5">{errors.customerName.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sikandra, Agra"
                      className={`w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border focus:outline-[#0ea5e9] ${errors.location ? 'border-red-400' : 'border-slate-200'}`}
                      {...register('location', { required: 'Location is required' })}
                    />
                    {errors.location && <p className="text-[10px] text-red-500 mt-0.5">{errors.location.message}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 3 — Text Review fields */}
              {watchedType === 'text' && (
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Text Review Details</p>

                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Review Text *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Provide realistic feedback from the client about BM Properties..."
                      className={`w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border focus:outline-[#0ea5e9] ${errors.reviewText ? 'border-red-400' : 'border-slate-200'}`}
                      {...register('reviewText', { required: watchedType === 'text' ? 'Review text is required' : false })}
                    />
                    {errors.reviewText && <p className="text-[10px] text-red-500 mt-0.5">{errors.reviewText.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Star Rating
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                      {...register('rating', { valueAsNumber: true })}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 Stars — Exceptional</option>
                      <option value={4}>⭐⭐⭐⭐ 4 Stars — Good</option>
                      <option value={3}>⭐⭐⭐ 3 Stars — Average</option>
                      <option value={2}>⭐⭐ 2 Stars — Below Average</option>
                      <option value={1}>⭐ 1 Star — Poor</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Auto Initials
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        className="w-full px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-[#0A1F44] border border-slate-200 focus:outline-hidden"
                        {...register('initials')}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Avatar Color
                      </label>
                      <select
                        className="w-full px-3 py-1.5 bg-white rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                        {...register('avatarColor')}
                      >
                        <option value="navy">Classic Navy</option>
                        <option value="sky">Sky Blue</option>
                        <option value="amber">Warm Amber</option>
                        <option value="green">Fresh Green</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4 — WhatsApp Screenshot fields */}
              {watchedType === 'whatsapp' && (
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Screenshot Details</p>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-2">
                      Screenshot Image *
                    </label>
                    <input type="hidden" {...register('screenshotUrl', { required: watchedType === 'whatsapp' ? 'Please upload a screenshot' : false })} />

                    {watchedScreenshot ? (
                      <div className="flex flex-col gap-2">
                        <div className="rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={watchedScreenshot}
                            alt="Screenshot preview"
                            className="w-full max-h-56 object-contain bg-slate-50"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setValue('screenshotUrl', '');
                            if (screenshotInputRef.current) screenshotInputRef.current.value = '';
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 hover:text-red-600 self-start"
                        >
                          <X className="w-3 h-3" />
                          Remove & re-upload
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all ${
                          isUploadingScreenshot ? 'border-[#10b981] bg-[#10b981]/5' : 'border-slate-300 bg-slate-50 hover:border-[#10b981]/50 hover:bg-[#10b981]/5'
                        }`}
                      >
                        <input
                          ref={screenshotInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          disabled={isUploadingScreenshot}
                          onChange={handleScreenshotUpload}
                        />
                        <CloudUpload className={`w-8 h-8 ${isUploadingScreenshot ? 'text-[#10b981]' : 'text-slate-300'}`} />
                        <div className="text-center pointer-events-none">
                          <p className="text-xs font-semibold text-[#0A1F44]">
                            {isUploadingScreenshot ? 'Uploading...' : 'Click to upload screenshot'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP — max 10 MB</p>
                        </div>
                        {isUploadingScreenshot && (
                          <div className="w-full max-w-xs pointer-events-none">
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <span>Uploading to Firebase Storage…</span>
                              <span>{screenshotUploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div
                                className="bg-[#10b981] h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${screenshotUploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {errors.screenshotUrl && <p className="text-[10px] text-red-500 mt-1">Please upload a screenshot image.</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Caption <span className="text-slate-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Client confirmed property purchase"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                      {...register('caption')}
                    />
                  </div>
                </div>
              )}

              {/* SECTION 5 — Video Testimonial fields */}
              {watchedType === 'video' && (
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video Testimonial Details</p>

                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      YouTube Video URL *
                    </label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=xxx"
                      className={`w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border focus:outline-[#0ea5e9] ${errors.videoUrl ? 'border-red-400' : 'border-slate-200'}`}
                      {...register('videoUrl', { required: watchedType === 'video' ? 'YouTube URL is required' : false })}
                    />
                    {errors.videoUrl && <p className="text-[10px] text-red-500 mt-0.5">{errors.videoUrl.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Video Thumbnail URL <span className="text-slate-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://i.ytimg.com/vi/xxx/hqdefault.jpg"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                      {...register('thumbnailUrl')}
                    />
                  </div>

                  {watchedThumbnail && (
                    <div className="rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={watchedThumbnail}
                        alt="Thumbnail preview"
                        className="w-full max-h-40 object-contain bg-slate-50"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Video Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Happy client shares experience"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                      {...register('videoTitle')}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2:30"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                      {...register('duration')}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-2 items-center justify-end border-t border-slate-100 pt-4 mt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A1F44] hover:bg-emerald-600 transition-all text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {editId ? 'Update Testimonial' : 'Publish Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
