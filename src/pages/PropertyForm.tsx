/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  X,
  Plus,
  Image as ImageIcon,
  Building,
  Calendar,
  Layers,
  Settings,
  Sparkles,
  Smartphone,
  Zap,
  MapPin,
  ChevronDown,
  Video,
  CloudUpload,
  Link as LinkIcon,
  FolderOpen
} from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { Property, PropertyType, PROPERTY_TYPE_GROUPS, LAND_PROPERTY_TYPES, RESIDENTIAL_UNIT_TYPES } from '../types';

interface PropertyFormInputs {
  title: string;
  projectName?: string;
  slug: string;
  locality: string;
  address: string;
  transaction: 'Buy' | 'Rent';
  type: PropertyType;
  price: number;
  priceLabel: string;
  pricePerSqYard?: number;
  area: number;
  areaUnit: 'Sq. Ft' | 'Sq. Yd' | 'Sq. Mt';
  bhk: number;
  facing: 'North' | 'South' | 'East' | 'West';
  possession: 'Ready' | 'Under Construction';
  postedBy: 'Owner' | 'Agent';
  whatsappNumber: string;
  createdAt: string;
  // Property Features
  floorNumber?: number;
  totalFloors?: number;
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  ceilingHeight?: number;
  constructionYear?: number;
  renovationStatus?: 'Original' | 'Recent Polish-ups' | 'Fully Renovated';
  additionalSpace?: string;
  // Utilities
  heating?: 'Not Applicable' | 'Central Heating' | 'Gas Heating';
  airConditioning?: 'Not Available' | 'Split AC Wiring Ready' | 'Fully Installed';
  fireplace?: boolean;
  elevatorAccess?: 'No Elevator' | 'Private Staircase Only' | 'Shared Elevator' | 'Private Elevator';
  ventilation?: 'Standard' | 'Fully Cross Ventilated';
  intercom?: 'Not Available' | 'Gate Ring Doorbell' | 'Full Intercom System';
  windowModel?: string;
  cableTV?: string;
  internetWifi?: string;
  // Outdoor Features
  privateGarage?: string;
  gardenBackyard?: string;
  swimmingPool?: string;
  visitorParking?: string;
  disabledAccess?: string;
  fencingBoundary?: string;
  cctvCameras?: string;
  petFriendly?: boolean;
  // Media
  videoWalkthroughUrl?: string;
  virtualTourUrl?: string;
  floorPlanImageUrl?: string;
  brochureUrl?: string;
}

interface NearbyPlace {
  category: string;
  name: string;
  distance: string;
  travelNote: string;
}

const COMMON_AMENITIES = [
  'Lift',
  'Parking',
  'Security',
  'Gym',
  'Swimming Pool',
  'Power Backup',
  'CCTV',
  'Garden',
  'Club House',
  'Temple',
  'Park',
  'RCC Road',
  'Water Supply',
  'Gated Community',
  'Boundary Wall',
  'Street Lighting',
  '24/7 Security',
  'Fire Safety',
  'Intercom',
  'Visitor Parking'
];

const NEARBY_CATEGORIES = [
  'School',
  'Hospital',
  'Market',
  'Metro',
  'Bus Stop',
  'Airport',
  'Highway',
  'Temple',
  'Park',
  'University',
  'Mall',
  'Bank',
  'ATM',
  'Other'
];

const LOCALITY_OPTIONS = [
  'Tajganj, Agra',
  'Kamla Nagar, Agra',
  'Sikandra, Agra',
  'Fatehabad Road, Agra',
  'Shahganj, Agra',
  'Bodla, Agra',
  'Belanganj, Agra',
  'Agra Cantt, Agra',
  'Delhi',
  'Noida',
  'Gurgaon',
  'Greater Noida',
  'Mathura',
  'Vrindavan',
  'Firozabad',
  'Aligarh'
];

export const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { properties, addProperty, updateProperty } = useData();
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!id;
  const existingProperty = isEditMode ? properties.find((p) => p.id === id) : undefined;

  // Custom States for Form (not easily managed solely by react-hook-form default schema)
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [badges, setBadges] = useState<string[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);
  const [brochureUploadProgress, setBrochureUploadProgress] = useState(0);
  const [brochureFileName, setBrochureFileName] = useState('');
  const brochurePdfInputRef = useRef<HTMLInputElement>(null);
  const [floorPlanTab, setFloorPlanTab] = useState<'url' | 'upload'>('url');
  const [isUploadingFloorPlan, setIsUploadingFloorPlan] = useState(false);
  const [floorPlanUploadProgress, setFloorPlanUploadProgress] = useState(0);
  const floorPlanFileInputRef = useRef<HTMLInputElement>(null);

  // Tracks which property id was last loaded into the form — not just a one-shot
  // boolean — because /properties/edit/:id reuses the same PropertyForm instance
  // across different ids (React Router doesn't remount on param-only changes), so a
  // boolean flag would leave the PREVIOUS property's data in the form when switching
  // straight from editing one property to editing another.
  const prefilledIdRef = useRef<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PropertyFormInputs>({
    defaultValues: {
      title: '',
      slug: '',
      locality: 'Tajganj, Agra',
      address: '',
      transaction: 'Buy',
      type: 'Flat / Apartment',
      price: 0,
      priceLabel: '',
      pricePerSqYard: 0,
      area: 0,
      areaUnit: 'Sq. Ft',
      bhk: 1,
      facing: 'East',
      possession: 'Ready',
      postedBy: 'Agent',
      whatsappNumber: '919837029310',
      createdAt: new Date().toISOString().split('T')[0]
    }
  });

  const watchedTitle = watch('title');
  const watchedBrochureUrl = watch('brochureUrl');
  const watchedFloorPlanImageUrl = watch('floorPlanImageUrl');
  const watchedBhk = watch('bhk');

  // Pre-fill existing data if editing — runs once when existingProperty first loads
  useEffect(() => {
    if (isEditMode && existingProperty && prefilledIdRef.current !== existingProperty.id) {
      prefilledIdRef.current = existingProperty.id;

      // reset() atomically sets ALL fields including native <select> elements,
      // which individual setValue() calls cannot reliably do in react-hook-form v7.
      reset({
        title: existingProperty.title,
        projectName: existingProperty.projectName,
        slug: existingProperty.slug,
        locality: existingProperty.locality,
        address: existingProperty.address,
        transaction: existingProperty.transaction,
        type: existingProperty.type || 'Flat / Apartment',
        price: existingProperty.price,
        priceLabel: existingProperty.priceLabel,
        pricePerSqYard: existingProperty.pricePerSqYard ?? 0,
        area: existingProperty.area,
        areaUnit: existingProperty.areaUnit || 'Sq. Ft',
        bhk: existingProperty.bhk,
        facing: existingProperty.facing || 'East',
        possession: existingProperty.possession || 'Ready',
        postedBy: existingProperty.postedBy || 'Agent',
        whatsappNumber: existingProperty.whatsappNumber,
        createdAt: existingProperty.createdAt,
        // Property Features
        floorNumber: existingProperty.floorNumber,
        totalFloors: existingProperty.totalFloors,
        furnishing: existingProperty.furnishing,
        ceilingHeight: existingProperty.ceilingHeight,
        constructionYear: existingProperty.constructionYear,
        renovationStatus: existingProperty.renovationStatus,
        additionalSpace: existingProperty.additionalSpace,
        // Utilities
        heating: existingProperty.heating,
        airConditioning: existingProperty.airConditioning,
        fireplace: existingProperty.fireplace,
        elevatorAccess: existingProperty.elevatorAccess,
        ventilation: existingProperty.ventilation,
        intercom: existingProperty.intercom,
        windowModel: existingProperty.windowModel,
        cableTV: existingProperty.cableTV,
        internetWifi: existingProperty.internetWifi,
        // Outdoor Features
        privateGarage: existingProperty.privateGarage,
        gardenBackyard: existingProperty.gardenBackyard,
        swimmingPool: existingProperty.swimmingPool,
        visitorParking: existingProperty.visitorParking,
        disabledAccess: existingProperty.disabledAccess,
        fencingBoundary: existingProperty.fencingBoundary,
        cctvCameras: existingProperty.cctvCameras,
        petFriendly: existingProperty.petFriendly,
        // Media
        videoWalkthroughUrl: existingProperty.videoWalkthroughUrl,
        virtualTourUrl: existingProperty.virtualTourUrl,
        floorPlanImageUrl: existingProperty.floorPlanImageUrl,
        brochureUrl: existingProperty.brochureUrl,
      });

      setAmenities(Array.isArray(existingProperty.amenities) ? existingProperty.amenities : []);
      setBadges((existingProperty.badges || []).filter(b => b !== 'new-listing'));
      if (existingProperty.nearbyPlaces && Array.isArray(existingProperty.nearbyPlaces)) {
        setNearbyPlaces(existingProperty.nearbyPlaces);
      } else {
        setNearbyPlaces([]);
      }
      setImageUrls(existingProperty.images?.length > 0 ? existingProperty.images : ['']);
      if (existingProperty.brochureUrl) {
        setBrochureFileName('Existing brochure');
      }
    }
  }, [isEditMode, existingProperty, reset]);

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

  // Handle auto BHK behavior for non-residential-unit types (plots, offices, institutional, etc.)
  const watchedType = watch('type');
  useEffect(() => {
    if (!RESIDENTIAL_UNIT_TYPES.includes(watchedType)) {
      setValue('bhk', 0);
    } else if (watchedBhk === 0) {
      setValue('bhk', 1);
    }
  }, [watchedType, watchedBhk, setValue]);

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

  const handleToggleBadge = (badge: string) => {
    setBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  // Nearby places interaction
  const handleAddNearbyPlace = () => {
    setNearbyPlaces((prev) => [...prev, { category: 'School', name: '', distance: '', travelNote: '' }]);
  };

  const handleRemoveNearbyPlace = (index: number) => {
    setNearbyPlaces((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleNearbyPlaceChange = (index: number, field: keyof NearbyPlace, value: string) => {
    setNearbyPlaces((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Image inputs interaction
  const handleAddImageUrlInput = () => {
    if (imageUrls.length < 10) {
      setImageUrls((prev) => [...prev, '']);
    } else {
      showToast('Maximum 10 property images allowed.', 'warning');
    }
  };

  const handleRemoveImageUrlInput = (index: number) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    let currentCount = imageUrls.filter((u) => u.trim()).length;

    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name}: File must be under 5 MB.`, 'warning');
        continue;
      }
      if (currentCount >= 10) {
        showToast('Maximum 10 images allowed.', 'warning');
        break;
      }

      await new Promise<void>((resolve) => {
        const path = `property-images/${Date.now()}-${file.name}`;
        const sRef = storageRef(storage, path);
        const task = uploadBytesResumable(sRef, file);

        setIsUploading(true);
        setUploadProgress(0);

        task.on(
          'state_changed',
          (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          (err) => {
            console.error(err);
            showToast('Upload failed. Check Firebase Storage rules.', 'error');
            setIsUploading(false);
            setUploadProgress(0);
            resolve();
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setImageUrls((prev) => {
              const filled = prev.filter((u) => u.trim());
              return [...filled, url];
            });
            currentCount++;
            showToast('Image uploaded successfully!', 'success');
            setIsUploading(false);
            setUploadProgress(0);
            resolve();
          }
        );
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 20 * 1024 * 1024) {
      showToast('PDF must be under 20 MB.', 'warning');
      return;
    }

    const path = `brochure-pdfs/${Date.now()}-${file.name}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);

    setIsUploadingBrochure(true);
    setBrochureUploadProgress(0);
    setBrochureFileName(file.name);

    task.on(
      'state_changed',
      (snap) => setBrochureUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error(err);
        showToast('Brochure upload failed. Check Firebase Storage rules.', 'error');
        setIsUploadingBrochure(false);
        setBrochureUploadProgress(0);
        setBrochureFileName('');
        if (brochurePdfInputRef.current) brochurePdfInputRef.current.value = '';
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setValue('brochureUrl', url);
        showToast('Brochure uploaded successfully!', 'success');
        setIsUploadingBrochure(false);
        setBrochureUploadProgress(0);
        if (brochurePdfInputRef.current) brochurePdfInputRef.current.value = '';
      }
    );
  };

  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be under 5 MB.', 'warning');
      return;
    }

    const path = `floor-plan-images/${Date.now()}-${file.name}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);

    setIsUploadingFloorPlan(true);
    setFloorPlanUploadProgress(0);

    task.on(
      'state_changed',
      (snap) => setFloorPlanUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error(err);
        showToast('Floor plan upload failed. Check Firebase Storage rules.', 'error');
        setIsUploadingFloorPlan(false);
        setFloorPlanUploadProgress(0);
        if (floorPlanFileInputRef.current) floorPlanFileInputRef.current.value = '';
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setValue('floorPlanImageUrl', url);
        showToast('Floor plan uploaded successfully!', 'success');
        setIsUploadingFloorPlan(false);
        setFloorPlanUploadProgress(0);
        if (floorPlanFileInputRef.current) floorPlanFileInputRef.current.value = '';
      }
    );
  };

  // Submit Handler
  const onSubmit = async (data: PropertyFormInputs) => {
    const activeImages = imageUrls.filter((url) => url.trim() !== '');
    if (activeImages.length === 0) {
      showToast('Please provide at least 1 image (URL or upload).', 'warning');
      return;
    }

    const listingDate = new Date(data.createdAt);
    const daysSinceListing = (Date.now() - listingDate.getTime()) / (1000 * 60 * 60 * 24);
    const autoBadges = daysSinceListing <= 30 ? ['new-listing'] : [];
    const compiledPropertyPayload = {
      ...data,
      areaUnit: data.areaUnit || 'Sq. Ft',
      amenities,
      nearbyPlaces,
      images: activeImages,
      badges: [...badges, ...autoBadges],
    };

    console.log('Saving property data:', compiledPropertyPayload);

    setIsSaving(true);
    try {
      if (isEditMode && id) {
        await updateProperty(id, compiledPropertyPayload);
        showToast('Property credentials updated successfully!', 'success');
      } else {
        await addProperty(compiledPropertyPayload);
        showToast('New platform listing launched successfully!', 'success');
      }
      navigate('/properties');
    } catch (err) {
      console.error('Failed to save property:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to save property: ${message}`, 'error');
    } finally {
      setIsSaving(false);
    }
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
                className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                  errors.title ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('title', { required: 'Listing Title is required' })}
              />
              {errors.title && <span className="text-[10px] text-red-500 font-semibold">{errors.title.message}</span>}
            </div>

            {/* Project Name */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="project-name-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Project Name
              </label>
              <input
                id="project-name-field"
                type="text"
                placeholder="e.g. Aerocity, Mehar Kunj, Landmark City"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('projectName')}
              />
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
                className={`w-full px-4 py-3 border rounded-xl text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                  errors.slug ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('slug', { required: 'Slug URL descriptor is required' })}
              />
              {errors.slug && <span className="text-[10px] text-red-500 font-semibold">{errors.slug.message}</span>}
            </div>

            {/* Locality combo input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="locality-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Agra Locality *
              </label>
              <input
                id="locality-field"
                type="text"
                list="locality-options"
                placeholder="Type or select locality..."
                className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                  errors.locality ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('locality', { required: 'Locality assignment is required' })}
              />
              <datalist id="locality-options">
                {LOCALITY_OPTIONS.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
              {errors.locality && <span className="text-[10px] text-red-500 font-semibold">{errors.locality.message}</span>}
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
                className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                  errors.address ? 'border-red-500' : 'border-slate-200'
                }`}
                {...register('address', { required: 'Detailed Address is required' })}
              />
              {errors.address && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.address.message}</span>
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
              <div className="relative">
                <select
                  id="type-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  {...register('type', { required: true })}
                >
                  <option value="">None (Not visible on website)</option>
                  {PROPERTY_TYPE_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Price fields — conditional on property type */}
            {LAND_PROPERTY_TYPES.includes(watchedType) ? (
              <>
                {/* Total Plot Price */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="price-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                    Total Plot Price (in ₹) *
                  </label>
                  <input
                    id="price-field"
                    type="number"
                    placeholder="e.g. 2500000"
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                      errors.price ? 'border-red-500' : 'border-slate-200'
                    }`}
                    {...register('price', {
                      required: 'Total plot price is required',
                      min: { value: 1, message: 'Price must be greater than zero' }
                    })}
                  />
                  {errors.price && <span className="text-[10px] text-red-500 font-semibold">{errors.price.message}</span>}
                </div>

                {/* Formatted Total Price Label */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="priceLabel-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                    Formatted Total Price Label *
                  </label>
                  <input
                    id="priceLabel-field"
                    type="text"
                    placeholder="e.g. ₹25 Lakh"
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                      errors.priceLabel ? 'border-red-500' : 'border-slate-200'
                    }`}
                    {...register('priceLabel', { required: 'Please specify formatted total price label' })}
                  />
                  {errors.priceLabel && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.priceLabel.message}</span>
                  )}
                </div>

                {/* Price per Square Yard */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pricePerSqYard-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                    Price per Square Yard (in ₹) *
                  </label>
                  <input
                    id="pricePerSqYard-field"
                    type="number"
                    placeholder="e.g. 2500"
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                      errors.pricePerSqYard ? 'border-red-500' : 'border-slate-200'
                    }`}
                    {...register('pricePerSqYard', {
                      required: 'Price per square yard is required',
                      min: { value: 1, message: 'Price per sq. yard must be greater than zero' }
                    })}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">Saved as: ₹2,500/sq.yd format on listing</span>
                  {errors.pricePerSqYard && <span className="text-[10px] text-red-500 font-semibold">{errors.pricePerSqYard.message}</span>}
                </div>
              </>
            ) : (
              <>
                {/* Price (Actual numeric index) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="price-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                    Actual Numeric Price (in ₹) *
                  </label>
                  <input
                    id="price-field"
                    type="number"
                    placeholder="e.g. 7500000"
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
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
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                      errors.priceLabel ? 'border-red-500' : 'border-slate-200'
                    }`}
                    {...register('priceLabel', { required: 'Please specify printable price label' })}
                  />
                  {errors.priceLabel && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.priceLabel.message}</span>
                  )}
                </div>
              </>
            )}

            {/* Property Area with unit selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="area-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Property Area *
              </label>
              <div className="flex gap-2">
                <div className="relative w-32 shrink-0">
                  <select
                    id="areaUnit-field"
                    className="w-full px-4 py-3 pr-9 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                    {...register('areaUnit')}
                  >
                    <option value="">None (Not visible on website)</option>
                    <option value="Sq. Ft">Sq. Ft</option>
                    <option value="Sq. Yd">Sq. Yd</option>
                    <option value="Sq. Mt">Sq. Mt</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input
                  id="area-field"
                  type="number"
                  placeholder="e.g. 1450"
                  className="flex-1 min-w-0 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                  {...register('area', { required: 'Total property area is required' })}
                />
              </div>
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
                disabled={!RESIDENTIAL_UNIT_TYPES.includes(watchedType)}
                placeholder="e.g. 3"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                {...register('bhk', { valueAsNumber: true })}
              />
            </div>

            {/* Facing direction dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="facing-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Vastu Facing Orientation
              </label>
              <div className="relative">
                <select
                  id="facing-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  {...register('facing')}
                >
                  <option value="">None (Not visible on website)</option>
                  <option value="East">East (Recommended Vastu)</option>
                  <option value="North">North Facing</option>
                  <option value="West">West Facing</option>
                  <option value="South">South Facing</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Possession Status */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="possession-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Possession Status
              </label>
              <div className="relative">
                <select
                  id="possession-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  {...register('possession')}
                >
                  <option value="">None (Not visible on website)</option>
                  <option value="Ready">Ready to Move-in</option>
                  <option value="Under Construction">Under Construction development</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Posted By — fixed, not editable */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Listing Representative
              </span>
              <input type="hidden" {...register('postedBy')} />
              <div className="w-full px-4 py-2.5 bg-slate-100 rounded-lg text-sm text-slate-500 border border-slate-200">
                BM Properties Team
              </div>
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
                  className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm ${
                    errors.whatsappNumber ? 'border-red-500' : 'border-slate-200'
                  }`}
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
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                  {...register('createdAt')}
                />
              </div>
            </div>

            {/* Property Badges */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <div>
                <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block">
                  Property Badges
                </span>
                <p className="text-xs text-slate-400 mt-0.5">Select applicable badges to highlight this listing</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                {([
                  { key: 'premium', emoji: '🏆', label: 'PREMIUM', desc: 'Mark as premium / luxury property', color: 'peer-checked:border-amber-400 peer-checked:bg-amber-50' },
                  { key: 'verified', emoji: '✅', label: 'VERIFIED', desc: 'Documents verified by BM Properties', color: 'peer-checked:border-emerald-400 peer-checked:bg-emerald-50' },
                  { key: 'urgent-sale', emoji: '⚡', label: 'URGENT SALE', desc: 'Urgent sale / price reduced', color: 'peer-checked:border-red-400 peer-checked:bg-red-50' },
                ] as const).map(({ key, emoji, label, desc, color }) => (
                  <label
                    key={key}
                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      badges.includes(key)
                        ? key === 'premium' ? 'border-amber-400 bg-amber-50'
                        : key === 'verified' ? 'border-emerald-400 bg-emerald-50'
                        : 'border-red-400 bg-red-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={badges.includes(key)}
                      onChange={() => handleToggleBadge(key)}
                    />
                    <span className="text-lg leading-none mt-0.5">{emoji}</span>
                    <div>
                      <p className="text-xs font-extrabold text-[#0A1F44] tracking-wide">{label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
                    </div>
                    {badges.includes(key) && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#0A1F44] flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span>🆕</span>
                <span><strong className="text-blue-700">NEW LISTING</strong> badge is added automatically for 30 days after the listing date.</span>
              </p>
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
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
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

          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setImageTab('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                imageTab === 'url'
                  ? 'bg-white text-[#0A1F44] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Image URL
            </button>
            <button
              type="button"
              onClick={() => setImageTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                imageTab === 'upload'
                  ? 'bg-white text-[#0A1F44] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Upload File
            </button>
          </div>

          {/* TAB 1 — Image URL */}
          {imageTab === 'url' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-snug">
                Paste direct image links from{' '}
                <a
                  href="https://imgbb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0ea5e9] font-semibold underline"
                >
                  imgbb.com
                </a>
                , Google Drive, or any public host. Up to 10 images allowed.
              </p>

              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-3 items-center">
                  {/* Thumbnail preview */}
                  <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {url.trim() ? (
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Paste image URL from imgbb.com, Google Drive, etc..."
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrlInput(index)}
                    className="p-2 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-lg text-red-400 transition-colors flex-shrink-0"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {imageUrls.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddImageUrlInput}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-500 border border-dashed border-slate-300 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Image URL
                </button>
              )}

              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>💡 Tip: Upload to</span>
                <a
                  href="https://imgbb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0ea5e9] font-semibold underline"
                >
                  imgbb.com
                </a>
                <span>(free) and paste the direct link here.</span>
              </p>
            </div>
          )}

          {/* TAB 2 — Upload File */}
          {imageTab === 'upload' && (
            <div className="flex flex-col gap-4">
              {/* Upload area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${
                  isUploading ? 'border-[#0ea5e9] bg-[#0ea5e9]/5' : 'border-slate-300 bg-slate-50 hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isUploading || imageUrls.filter(u => u.trim()).length >= 10}
                  onChange={handleFileUpload}
                />

                <CloudUpload className={`w-10 h-10 ${isUploading ? 'text-[#0ea5e9]' : 'text-slate-300'}`} />
                <div className="text-center pointer-events-none">
                  <p className="text-sm font-semibold text-[#0A1F44]">
                    {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — max 5 MB each</p>
                </div>

                {isUploading && (
                  <div className="w-full max-w-xs pointer-events-none">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Uploading to Firebase Storage…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-[#0ea5e9] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Files are stored in Firebase Storage and the download URL is added to the image gallery automatically.
              </p>
            </div>
          )}

          {/* Shared image preview grid (shown in both tabs) */}
          {imageUrls.filter((u) => u.trim()).length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                  Added Images ({imageUrls.filter((u) => u.trim()).length}/10)
                </p>
                <p className="text-[10px] text-slate-400">First image used as main property photo</p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {imageUrls.filter((u) => u.trim()).map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={url}
                      alt={`Image ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      referrerPolicy="no-referrer"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-[#0A1F44]/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        MAIN
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const realIndex = imageUrls.findIndex((u) => u === url);
                        if (realIndex !== -1) handleRemoveImageUrlInput(realIndex);
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5 — Property Features */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="text-[#8b5cf6] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 5 — Property Features</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Floor Number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="floorNumber-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Floor Number
              </label>
              <input
                id="floorNumber-field"
                type="number"
                placeholder="e.g. 2"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('floorNumber', { valueAsNumber: true })}
              />
            </div>

            {/* Total Floors */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="totalFloors-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Total Floors in Building
              </label>
              <input
                id="totalFloors-field"
                type="number"
                placeholder="e.g. 7"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('totalFloors', { valueAsNumber: true })}
              />
            </div>

            {/* Furnishing */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="furnishing-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Furnishing Status
              </label>
              <div className="relative">
                <select
                  id="furnishing-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  {...register('furnishing')}
                >
                  <option value="">None (Not visible on website)</option>
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Ceiling Height */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ceilingHeight-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Ceiling Height (in meters)
              </label>
              <input
                id="ceilingHeight-field"
                type="number"
                step="0.1"
                placeholder="e.g. 3.2"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('ceilingHeight', { valueAsNumber: true })}
              />
            </div>

            {/* Construction Year */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="constructionYear-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Construction Year
              </label>
              <input
                id="constructionYear-field"
                type="number"
                placeholder="e.g. 2022"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('constructionYear', { valueAsNumber: true })}
              />
            </div>

            {/* Renovation Status */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="renovationStatus-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Renovation Status
              </label>
              <div className="relative">
                <select
                  id="renovationStatus-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  {...register('renovationStatus')}
                >
                  <option value="">None (Not visible on website)</option>
                  <option value="Original">Original</option>
                  <option value="Recent Polish-ups">Recent Polish-ups</option>
                  <option value="Fully Renovated">Fully Renovated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Additional Space */}
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label htmlFor="additionalSpace-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Additional Space
              </label>
              <input
                id="additionalSpace-field"
                type="text"
                placeholder="e.g. Open Terrace / Balcony"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('additionalSpace')}
              />
            </div>
          </div>
        </div>

        {/* SECTION 6 — Utilities */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Zap className="text-[#06b6d4] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 6 — Utilities</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Heating */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="heating-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Heating
              </label>
              <div className="relative">
                <select
                  id="heating-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-none cursor-pointer shadow-sm"
                  {...register('heating')}
                >
                  <option value="">None</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Central Heating">Central Heating</option>
                  <option value="Gas Heating">Gas Heating</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Air Conditioning */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="airConditioning-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Air Conditioning
              </label>
              <div className="relative">
                <select
                  id="airConditioning-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-none cursor-pointer shadow-sm"
                  {...register('airConditioning')}
                >
                  <option value="">None</option>
                  <option value="Not Available">Not Available</option>
                  <option value="Split AC Wiring Ready">Split AC Wiring Ready</option>
                  <option value="Fully Installed">Fully Installed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Elevator Access */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="elevatorAccess-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Elevator Access
              </label>
              <div className="relative">
                <select
                  id="elevatorAccess-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-none cursor-pointer shadow-sm"
                  {...register('elevatorAccess')}
                >
                  <option value="">None</option>
                  <option value="No Elevator">No Elevator</option>
                  <option value="Private Staircase Only">Private Staircase Only</option>
                  <option value="Shared Elevator">Shared Elevator</option>
                  <option value="Private Elevator">Private Elevator</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Ventilation */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ventilation-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Ventilation
              </label>
              <div className="relative">
                <select
                  id="ventilation-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-none cursor-pointer shadow-sm"
                  {...register('ventilation')}
                >
                  <option value="">None</option>
                  <option value="Standard">Standard</option>
                  <option value="Fully Cross Ventilated">Fully Cross Ventilated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Intercom */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="intercom-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Intercom
              </label>
              <div className="relative">
                <select
                  id="intercom-field"
                  className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-none cursor-pointer shadow-sm"
                  {...register('intercom')}
                >
                  <option value="">None</option>
                  <option value="Not Available">Not Available</option>
                  <option value="Gate Ring Doorbell">Gate Ring Doorbell</option>
                  <option value="Full Intercom System">Full Intercom System</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Window Model */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="windowModel-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Window Model
              </label>
              <input
                id="windowModel-field"
                type="text"
                placeholder="e.g. Aluminium Glazed Sliding"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] shadow-sm"
                {...register('windowModel')}
              />
            </div>

            {/* Cable TV */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cableTV-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Cable TV
              </label>
              <input
                id="cableTV-field"
                type="text"
                placeholder="e.g. SFT Cabling Installed"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] shadow-sm"
                {...register('cableTV')}
              />
            </div>

            {/* Internet / WiFi */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="internetWifi-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Internet / WiFi
              </label>
              <input
                id="internetWifi-field"
                type="text"
                placeholder="e.g. Agra Jio/Airtel Fiber Covered"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] shadow-sm"
                {...register('internetWifi')}
              />
            </div>

            {/* Fireplace Toggle */}
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block">Fireplace</span>
              <label className="flex items-center gap-3 mt-1.5 cursor-pointer max-w-max">
                <input type="checkbox" className="sr-only peer" {...register('fireplace')} />
                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06b6d4]" />
                <span className="text-sm font-semibold text-slate-700">Yes, property has a Fireplace</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 7 — Outdoor Features */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="text-[#10b981] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 7 — Outdoor Features</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Private Garage */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="privateGarage-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Private Garage
              </label>
              <input
                id="privateGarage-field"
                type="text"
                placeholder="e.g. Yes (1 Private car space)"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('privateGarage')}
              />
            </div>

            {/* Garden / Backyard */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gardenBackyard-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Garden / Backyard
              </label>
              <input
                id="gardenBackyard-field"
                type="text"
                placeholder="e.g. Yes (Shared / Front Yard)"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('gardenBackyard')}
              />
            </div>

            {/* Swimming Pool */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="swimmingPool-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Swimming Pool
              </label>
              <input
                id="swimmingPool-field"
                type="text"
                placeholder="e.g. Gated Complex Shared Pool"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('swimmingPool')}
              />
            </div>

            {/* Visitor Parking */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="visitorParking-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Visitor Parking
              </label>
              <input
                id="visitorParking-field"
                type="text"
                placeholder="e.g. 2 Open Visitor Slots"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('visitorParking')}
              />
            </div>

            {/* Disabled Access */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="disabledAccess-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Disabled Access
              </label>
              <input
                id="disabledAccess-field"
                type="text"
                placeholder="e.g. Ramp + Accessible Washroom"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('disabledAccess')}
              />
            </div>

            {/* Fencing Boundary */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fencingBoundary-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Fencing Boundary
              </label>
              <input
                id="fencingBoundary-field"
                type="text"
                placeholder="e.g. Full Brick Boundary Wall"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('fencingBoundary')}
              />
            </div>

            {/* CCTV Cameras */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cctvCameras-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                CCTV Cameras
              </label>
              <input
                id="cctvCameras-field"
                type="text"
                placeholder="e.g. CCTV Covered Sector Gate"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('cctvCameras')}
              />
            </div>

            {/* Pet Friendly Toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider block">Pet Friendly</span>
              <label className="flex items-center gap-3 mt-1.5 cursor-pointer max-w-max">
                <input type="checkbox" className="sr-only peer" {...register('petFriendly')} />
                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]" />
                <span className="text-sm font-semibold text-slate-700">Yes, pets are welcome</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 8 — Media */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Video className="text-[#f43f5e] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 8 — Media</h3>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* Video Walkthrough URL */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="videoWalkthroughUrl-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Video Walkthrough URL
              </label>
              <input
                id="videoWalkthroughUrl-field"
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('videoWalkthroughUrl')}
              />
            </div>

            {/* 360 Virtual Tour URL */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="virtualTourUrl-field" className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                360 Virtual Tour URL
              </label>
              <input
                id="virtualTourUrl-field"
                type="text"
                placeholder="https://my.matterport.com/show/?m=..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                {...register('virtualTourUrl')}
              />
            </div>

            {/* Floor Plan Image — two-tab (URL / Upload) */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Floor Plan Image
              </label>

              {/* Tab switcher */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setFloorPlanTab('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    floorPlanTab === 'url'
                      ? 'bg-white text-[#0A1F44] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setFloorPlanTab('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    floorPlanTab === 'upload'
                      ? 'bg-white text-[#0A1F44] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Upload File
                </button>
              </div>

              {/* TAB 1 — Image URL */}
              {floorPlanTab === 'url' && (
                <input
                  id="floorPlanImageUrl-field"
                  type="text"
                  placeholder="https://example.com/floor-plan.png"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                  {...register('floorPlanImageUrl')}
                />
              )}

              {/* TAB 2 — Upload File */}
              {floorPlanTab === 'upload' && (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${
                    isUploadingFloorPlan
                      ? 'border-[#f43f5e] bg-[#f43f5e]/5'
                      : 'border-slate-300 bg-slate-50 hover:border-[#f43f5e]/50 hover:bg-[#f43f5e]/5'
                  }`}
                >
                  <input
                    ref={floorPlanFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={isUploadingFloorPlan}
                    onChange={handleFloorPlanUpload}
                  />
                  <CloudUpload className={`w-10 h-10 ${isUploadingFloorPlan ? 'text-[#f43f5e]' : 'text-slate-300'}`} />
                  <div className="text-center pointer-events-none">
                    <p className="text-sm font-semibold text-[#0A1F44]">
                      {isUploadingFloorPlan ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — max 5 MB</p>
                  </div>
                  {isUploadingFloorPlan && (
                    <div className="w-full max-w-xs pointer-events-none">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Uploading to Firebase Storage…</span>
                        <span>{floorPlanUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-[#f43f5e] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${floorPlanUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preview — shown in both tabs when a value exists */}
              {watchedFloorPlanImageUrl && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <img
                    src={watchedFloorPlanImageUrl}
                    alt="Floor plan preview"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm text-[#0A1F44] font-medium flex-1 truncate">Floor plan added</span>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('floorPlanImageUrl', '');
                      if (floorPlanFileInputRef.current) floorPlanFileInputRef.current.value = '';
                    }}
                    className="shrink-0 p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Brochure PDF Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Brochure PDF
              </label>
              <input type="hidden" {...register('brochureUrl')} />
              {watchedBrochureUrl ? (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen className="w-4 h-4 text-[#f43f5e] shrink-0" />
                    <span className="text-sm text-[#0A1F44] font-medium truncate">{brochureFileName || 'Brochure uploaded'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('brochureUrl', '');
                      setBrochureFileName('');
                      if (brochurePdfInputRef.current) brochurePdfInputRef.current.value = '';
                    }}
                    className="shrink-0 p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all ${
                    isUploadingBrochure ? 'border-[#f43f5e] bg-[#f43f5e]/5' : 'border-slate-300 bg-slate-50 hover:border-[#f43f5e]/50 hover:bg-[#f43f5e]/5'
                  }`}
                >
                  <input
                    ref={brochurePdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={isUploadingBrochure}
                    onChange={handleBrochureUpload}
                  />
                  <CloudUpload className={`w-8 h-8 ${isUploadingBrochure ? 'text-[#f43f5e]' : 'text-slate-300'}`} />
                  <div className="text-center pointer-events-none">
                    <p className="text-sm font-semibold text-[#0A1F44]">
                      {isUploadingBrochure ? 'Uploading PDF...' : 'Click to upload brochure PDF'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF only — max 20 MB</p>
                  </div>
                  {isUploadingBrochure && (
                    <div className="w-full max-w-xs pointer-events-none">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Uploading to Firebase Storage…</span>
                        <span>{brochureUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-[#f43f5e] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${brochureUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 9 — Nearby & Distances */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/70 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="text-[#f97316] w-5 h-5" />
            <h3 className="font-bold text-[#0A1F44] text-base">SECTION 9 — Nearby & Distances</h3>
          </div>

          <div className="flex items-center justify-between -mt-2">
            <p className="text-xs text-slate-500">Add nearby landmarks with category, distance, and travel note.</p>
            <button
              type="button"
              onClick={handleAddNearbyPlace}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A1F44] hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Nearby Place
            </button>
          </div>

          {nearbyPlaces.length === 0 && (
            <p className="text-xs text-slate-400 italic">No nearby places added yet.</p>
          )}

          <div className="flex flex-col gap-3">
            {nearbyPlaces.map((place, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1.5fr_auto] gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="relative">
                  <select
                    value={place.category}
                    onChange={(e) => handleNearbyPlaceChange(index, 'category', e.target.value)}
                    className="w-full px-4 py-3 pr-9 border border-slate-200 rounded-xl text-sm font-medium text-[#0A1F44] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  >
                    <option value="">None (Not visible on website)</option>
                    {NEARBY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. St. Martinez School"
                  value={place.name}
                  onChange={(e) => handleNearbyPlaceChange(index, 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                />
                <input
                  type="text"
                  placeholder="e.g. 1.2 km"
                  value={place.distance}
                  onChange={(e) => handleNearbyPlaceChange(index, 'distance', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                />
                <input
                  type="text"
                  placeholder="e.g. 5 min walk"
                  value={place.travelNote}
                  onChange={(e) => handleNearbyPlaceChange(index, 'travelNote', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNearbyPlace(index)}
                  className="p-2 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-lg text-red-500 transition-colors flex-shrink-0 justify-self-start"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
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
            disabled={isSaving}
            className="px-8 py-3 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Property Listing' : 'Publish Property Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
