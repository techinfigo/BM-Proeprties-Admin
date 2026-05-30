/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  X,
  Plus,
  Image as ImageIcon,
  Building,
  Info,
  Calendar,
  Layers,
  Settings,
  Sparkles,
  Smartphone,
  Check
} from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { Property } from '../types';

interface PropertyFormInputs {
  title: string;
  slug: string;
  locality: 'Tajganj' | 'Kamla Nagar' | 'Sikandra' | 'Fatehabad Road' | 'Shahganj' | 'Bodla' | 'Belanganj' | 'Agra Cantt';
  address: string;
  description: string;
  transaction: 'Buy' | 'Rent';
  type: 'Flat' | 'House' | 'Plot' | 'Commercial';
  price: number;
  priceLabel: string;
  area: number;
  bhk: number;
  facing: 'North' | 'South' | 'East' | 'West';
  possession: 'Ready' | 'Under Construction';
  postedBy: 'Owner' | 'Agent';
  whatsappNumber: string;
  isFeatured: boolean;
  createdAt: string;
}

const COMMON_AMENITIES = [
  'Lift',
  'Parking',
  'Security',
  'Gym',
  'Swimming Pool',
  'Power Backup',
  'CCTV',
  'Garden'
];

const LOCALITY_OPTIONS = [
  'Tajganj',
  'Kamla Nagar',
  'Sikandra',
  'Fatehabad Road',
  'Shahganj',
  'Bodla',
  'Belanganj',
  'Agra Cantt'
];

export const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { properties, addProperty, updateProperty } = useData();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!id;
  const existingProperty = isEditMode ? properties.find((p) => p.id === id) : undefined;

  // Custom States for Form (not easily managed solely by react-hook-form default schema)
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PropertyFormInputs>({
    defaultValues: {
      title: '',
      slug: '',
      locality: 'Tajganj',
      address: '',
      description: '',
      transaction: 'Buy',
      type: 'Flat',
      price: 0,
      priceLabel: '',
      area: 0,
      bhk: 1,
      facing: 'East',
      possession: 'Ready',
      postedBy: 'Agent',
      whatsappNumber: '919837029310',
      isFeatured: false,
      createdAt: new Date().toISOString().split('T')[0]
    }
  });

  const watchedTitle = watch('title');

  // Pre-fill existing data if editing
  useEffect(() => {
    if (isEditMode && existingProperty) {
      // Set basic fields
      setValue('title', existingProperty.title);
      setValue('slug', existingProperty.slug);
      setValue('locality', existingProperty.locality);
      setValue('address', existingProperty.address);
      setValue('description', existingProperty.description);
      setValue('transaction', existingProperty.transaction);
      setValue('type', existingProperty.type);
      setValue('price', existingProperty.price);
      setValue('priceLabel', existingProperty.priceLabel);
      setValue('area', existingProperty.area);
      setValue('bhk', existingProperty.bhk);
      setValue('facing', existingProperty.facing);
      setValue('possession', existingProperty.possession);
      setValue('postedBy', existingProperty.postedBy);
      setValue('whatsappNumber', existingProperty.whatsappNumber);
      setValue('isFeatured', existingProperty.isFeatured);
      setValue('createdAt', existingProperty.createdAt);

      setAmenities(existingProperty.amenities || []);
      setImageUrls(existingProperty.images && existingProperty.images.length > 0 ? existingProperty.images : ['']);
    }
  }, [isEditMode, existingProperty, setValue]);

  // Auto generate slug from title
  useEffect(() => {
    if (!isEditMode && watchedTitle) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // trim double hyphens
      setValue('slug', slug);
    }
  }, [watchedTitle, isEditMode, setValue]);

  // Handle auto BHK behavior for Plot/Commercial
  const watchedType = watch('type');
  useEffect(() => {
    if (watchedType === 'Plot' || watchedType === 'Commercial') {
      setValue('bhk', 0);
    } else if (watch('bhk') === 0) {
      setValue('bhk', 1);
    }
  }, [watchedType, setValue, watch]);

  // Amenities interaction
  const handleAddAmenity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = amenityInput.trim();
    if (clean && !amenities.includes(clean)) {
      setAmenities((prev) => [...prev, clean]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (name: string) => {
    setAmenities((prev) => prev.filter((item) => item !== name));
  };

  const handleQuickAddAmenity = (name: string) => {
    if (!amenities.includes(name)) {
      setAmenities((prev) => [...prev, name]);
    } else {
      setAmenities((prev) => prev.filter((item) => item !== name));
    }
  };

  // Image inputs interaction
  const handleAddImageUrlInput = () => {
    if (imageUrls.length < 6) {
      setImageUrls((prev) => [...prev, '']);
    } else {
      showToast('Maximum 6 property images allowed.', 'warning');
    }
  };

  const handleRemoveImageUrlInput = (index: number) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']); // Keep at least one empty
    } else {
      setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleImageUrlChange = (index: number, val: string) => {
    setImageUrls((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  // Submit Handler
  const onSubmit = (data: PropertyFormInputs) => {
    // Filter out blank images
    const activeImages = imageUrls.filter((url) => url.trim() !== '');
    if (activeImages.length === 0) {
      showToast('Please provide at least 1 visual image URL.', 'warning');
      return;
    }

    const compiledPropertyPayload = {
      ...data,
      amenities,
      images: activeImages
    };

    startTransition(() => {
      if (isEditMode && id) {
        updateProperty(id, compiledPropertyPayload);
        showToast('Property credentials updated successfully!', 'success');
      } else {
        addProperty(compiledPropertyPayload);
        showToast('New platform listing launched successfully!', 'success');
      }
      navigate('/properties');
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/properties')}
          className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-[#0A1F44] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">
            {isEditMode ? `Update details of: ${existingProperty?.title}` : 'Build New Property Listing'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill the following segmented specifications to represent your Agra listing
          </p>
        </div>
      </div>

      {/* Main Multi-section Form with React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        
        {/* SECTION 1 — Basic Info */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-120/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="text-[#0ea5e9] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 1 — Primary Identity & Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="title-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Listing Title *
              </label>
              <input
                id="title-field"
                type="text"
                placeholder="e.g. Spacious 3 BHK apartment in Fatehabad near Taj"
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] ${
                  errors.title ? 'border-red-500' : 'border-slate-200'
                } transition-all`}
                {...register('title', { required: 'Listing Title is required' })}
              />
              {errors.title && <span className="text-[10px] text-red-500 font-semibold">{errors.title.message}</span>}
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slug-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Permanent Slug URL Link *
              </label>
              <input
                id="slug-field"
                type="text"
                placeholder="e.g. spacious-3-bhk-apartment"
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-500 border hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] ${
                  errors.slug ? 'border-red-500' : 'border-slate-200'
                } transition-all`}
                {...register('slug', { required: 'Slug URL descriptor is required' })}
              />
              {errors.slug && <span className="text-[10px] text-red-500 font-semibold">{errors.slug.message}</span>}
            </div>

            {/* Locality dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="locality-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Agra Locality *
              </label>
              <select
                id="locality-field"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                {...register('locality', { required: 'Locality assignment is required' })}
              >
                {LOCALITY_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}, Agra
                  </option>
                ))}
              </select>
            </div>

            {/* Full address */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="address-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Detailed Post address & Area Pin *
              </label>
              <input
                id="address-field"
                type="text"
                placeholder="Apartment Number, Colony details, Fatehabad Road, Agra, UP - 282001"
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] ${
                  errors.address ? 'border-red-500' : 'border-slate-200'
                } transition-all`}
                {...register('address', { required: 'Detailed Address is required' })}
              />
              {errors.address && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.address.message}</span>
              )}
            </div>

            {/* Description textarea */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="description-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Intense Marketing Description & Context *
              </label>
              <textarea
                id="description-field"
                rows={5}
                placeholder="Expose maximum details such as room lighting views, nearby malls, security arrangements, distance from Agra Cantt station or expressway, quality of wood cabinets, flooring properties, etc."
                className={`w-full px-4 py-3 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] ${
                  errors.description ? 'border-red-500' : 'border-slate-200'
                } transition-all`}
                {...register('description', { required: 'Item description context is required' })}
              />
              {errors.description && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.description.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2 — Property Details */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-1240/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="text-[#f59e0b] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 2 — Financial & Physical Criteria</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Transaction Type - Radio Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block">
                Deal Agreement Mode *
              </label>
              <div className="flex items-center gap-4 mt-1.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    value="Buy"
                    className="w-4 h-4 text-[#0A1F44] focus:ring-[#0A1F44] border-slate-300"
                    {...register('transaction')}
                  />
                  <span>For Sale (Buy)</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    value="Rent"
                    className="w-4 h-4 text-[#0A1F44] focus:ring-[#0A1F44] border-slate-300"
                    {...register('transaction')}
                  />
                  <span>On Rent Type</span>
                </label>
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="type-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Structure Classification *
              </label>
              <select
                id="type-field"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20"
                {...register('type', { required: true })}
              >
                <option value="Flat">Flat / Apartment</option>
                <option value="House">House / Duplex Villa</option>
                <option value="Plot">Plot Grid / Land</option>
                <option value="Commercial">Commercial Shop / Office</option>
              </select>
            </div>

            {/* Price (Actual numeric index) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="price-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Actual Numeric Price (in ₹) *
              </label>
              <input
                id="price-field"
                type="number"
                placeholder="e.g. 7500000"
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:outline-[#0ea5e9] ${
                  errors.price ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('price', {
                  required: 'Price sum is required',
                  min: { value: 1, message: 'Price must be greater than zero' }
                })}
              />
              {errors.price && <span className="text-[10px] text-red-500 font-semibold">{errors.price.message}</span>}
            </div>

            {/* Price Label (Vocal description) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="priceLabel-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Formatted Price Label *
              </label>
              <input
                id="priceLabel-field"
                type="text"
                placeholder="e.g. ₹75 Lakh or ₹15,000 / month"
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border hover:border-slate-300 focus:outline-[#0ea5e9] ${
                  errors.priceLabel ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('priceLabel', { required: 'Please specify printable price label' })}
              />
              {errors.priceLabel && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.priceLabel.message}</span>
              )}
            </div>

            {/* Space Area in SqFt */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="area-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Gross Area Scope (in SqFt) *
              </label>
              <input
                id="area-field"
                type="number"
                placeholder="e.g. 1450"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                {...register('area', { required: 'Total property area in feet is required' })}
              />
              {errors.area && <span className="text-[10px] text-red-500 font-semibold">{errors.area.message}</span>}
            </div>

            {/* BHK Number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bhk-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                BHK Rooms Index (0 for plots)
              </label>
              <input
                id="bhk-field"
                type="number"
                disabled={watchedType === 'Plot' || watchedType === 'Commercial'}
                placeholder="e.g. 3"
                className="w-full px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                {...register('bhk', { valueAsNumber: true })}
              />
            </div>

            {/* Facing direction dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="facing-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Vastu Facing Orientation
              </label>
              <select
                id="facing-field"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                {...register('facing')}
              >
                <option value="East">East (Recommended Vastu)</option>
                <option value="North">North Facing</option>
                <option value="West">West Facing</option>
                <option value="South">South Facing</option>
              </select>
            </div>

            {/* Possession Status */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="possession-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Possession Status
              </label>
              <select
                id="possession-field"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                {...register('possession')}
              >
                <option value="Ready">Ready to Move-in</option>
                <option value="Under Construction">Under Construction development</option>
              </select>
            </div>

            {/* Posted By Broker / Landlord */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="postedBy-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Listing representative
              </label>
              <select
                id="postedBy-field"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                {...register('postedBy')}
              >
                <option value="Agent">BM Agent Team (Recommended)</option>
                <option value="Owner">Direct Proprietor / Landlord</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3 — Extra Details */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-132/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="text-[#10b981] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 3 — Custom Amenities & Interactivity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* WhatsApp direct chat link */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="whatsappNumber-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                WhatsApp Phone Code (strictly with Country code prefix, e.g. 919837029310)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  id="whatsappNumber-field"
                  type="text"
                  placeholder="919837029310"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                  {...register('whatsappNumber', { required: 'Inquiry mobile string is required' })}
                />
              </div>
            </div>

            {/* Created date / datepicker */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="createdAt-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Listing Initial Publication Date
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  id="createdAt-field"
                  type="date"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200"
                  {...register('createdAt')}
                />
              </div>
            </div>

            {/* Is Featured toggle switch */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block">
                Featured Spotlight Flag
              </span>
              <p className="text-xs text-slate-400 leading-none mb-1">
                Pin this structure onto the homepage sliders and feature highlights
              </p>
              <label className="flex items-center gap-3 mt-1.5 cursor-pointer max-w-max">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register('isFeatured')}
                />
                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f59e0b]" />
                <span className="text-sm font-semibold text-slate-700">Yes, highlight as Featured Spotlight card</span>
              </label>
            </div>

            {/* Tag/Amenity Input */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block">
                Amenities & Services Setup
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-100/50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider w-full mb-1">
                  Click to quick toggle:
                </span>
                {COMMON_AMENITIES.map((name) => {
                  const exists = amenities.includes(name);
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => handleQuickAddAmenity(name)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                        exists
                          ? 'bg-[#10b981] text-white border-[#10b981]'
                          : 'bg-white text-[#475569] border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {exists ? `✓ ${name}` : `+ ${name}`}
                    </button>
                  );
                })}
              </div>

              {/* Advanced tag text input box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Need custom amenity? Type name here and press Enter"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                />
                <button
                  type="button"
                  onClick={() => handleAddAmenity()}
                  className="px-4 py-2 bg-[#0A1F44] hover:bg-slate-900 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Add Tag
                </button>
              </div>

              {/* Tag representations area */}
              <div className="flex flex-wrap gap-2 mt-2">
                {amenities.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-sky-50 text-[#0ea5e9] border border-sky-100 rounded-full text-xs font-bold"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(item)}
                      className="p-0.5 hover:bg-[#0ea5e9]/10 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — Images */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-140/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ImageIcon className="text-[#0ea5e9] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 4 — Media Gallery Placement</h3>
          </div>

          <p className="text-xs text-slate-500 leading-snug">
            Provide direct image URLs from services like Unsplash, Imgur or self-host folders. The admin dashboard renders real-time visual grid indicators for your ease. Up to 6 images may be attached.
          </p>

          <div className="flex flex-col gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-4 items-start">
                {/* Visual preview box */}
                <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {url.trim() ? (
                    <img
                      src={url}
                      alt={`Attached preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // fallback broken img placeholder icon
                        e.currentTarget.style.display = 'none';
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-350" />
                  )}
                </div>

                {/* Input url details */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`https://images.unsplash.com/photo-X... Image Link #${index + 1}`}
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrlInput(index)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-lg text-[#ef4444] transition-colors"
                      title="Delete Image Slot"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Action launcher item */}
            {imageUrls.length < 6 && (
              <button
                type="button"
                onClick={handleAddImageUrlInput}
                className="flex items-center justify-center gap-1.5 w-full py-3 bg-slate-100/50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-650 tracking-wide border border-dashed border-slate-300 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image Slot (Limit 6)</span>
              </button>
            )}
          </div>
        </div>

        {/* Buttons submission toolbar */}
        <div className="flex items-center justify-end gap-3.5 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel Alteration
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Saving...' : isEditMode ? 'Update Property Listing' : 'Publish Property Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
