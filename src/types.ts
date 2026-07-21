/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PropertyType =
  | 'Flat / Apartment'
  | 'Independent House / Villa'
  | 'Plot / Land (Residential)'
  | 'Builder Floor'
  | 'Farmhouse'
  | 'Service Apartment'
  | 'Commercial Plot / Land'
  | 'Office Space'
  | 'Retail Shop / Showroom'
  | 'Hospitality (Hotel/Resort)'
  | 'Industrial Plot / Land'
  | 'Factory / Warehouse'
  | 'School / College Campus'
  | 'Hospital';

// Grouped for <optgroup>-style dropdowns in the admin panel
export const PROPERTY_TYPE_GROUPS: { label: string; options: PropertyType[] }[] = [
  {
    label: 'Residential',
    options: [
      'Flat / Apartment',
      'Independent House / Villa',
      'Plot / Land (Residential)',
      'Builder Floor',
      'Farmhouse',
      'Service Apartment'
    ]
  },
  {
    label: 'Commercial',
    options: [
      'Commercial Plot / Land',
      'Office Space',
      'Retail Shop / Showroom',
      'Hospitality (Hotel/Resort)'
    ]
  },
  {
    label: 'Industrial',
    options: ['Industrial Plot / Land', 'Factory / Warehouse']
  },
  {
    label: 'Institutional',
    options: ['School / College Campus', 'Hospital']
  }
];

// Plot/land listings use total + per-sq-yard pricing instead of a single numeric price
export const LAND_PROPERTY_TYPES: PropertyType[] = [
  'Plot / Land (Residential)',
  'Commercial Plot / Land',
  'Industrial Plot / Land'
];

// Only these types represent a livable unit with a BHK count
export const RESIDENTIAL_UNIT_TYPES: PropertyType[] = [
  'Flat / Apartment',
  'Independent House / Villa',
  'Builder Floor',
  'Farmhouse',
  'Service Apartment'
];

export interface Property {
  id: string;
  title: string;
  projectName?: string;
  slug: string;
  locality: string;
  address: string;
  description: string;
  transaction: 'Buy' | 'Rent';
  type: PropertyType;
  price: number;
  priceLabel: string;
  pricePerSqYard?: number;
  area: number;
  areaUnit?: 'Sq. Ft' | 'Sq. Yd' | 'Sq. Mt';
  bhk: number;
  facing: 'North' | 'South' | 'East' | 'West';
  possession: 'Ready' | 'Under Construction';
  postedBy: 'Owner' | 'Agent';
  whatsappNumber: string;
  isFeatured: boolean;
  isPopular?: boolean;
  amenities: string[];
  images: string[];
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
  // Utilities — show on website toggles
  showHeating?: boolean;
  showAirConditioning?: boolean;
  showFireplace?: boolean;
  showElevatorAccess?: boolean;
  showVentilation?: boolean;
  showIntercom?: boolean;
  showWindowModel?: boolean;
  showCableTV?: boolean;
  showWifi?: boolean;
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
  // Nearby & Distances
  nearbyPlaces?: { category: string; name: string; distance: string; travelNote: string }[];
  // Badges
  badges?: ('premium' | 'verified' | 'urgent-sale' | 'new-listing')[];
}

export interface FeaturedSpotlight {
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

export interface Testimonial {
  id: string;
  testimonialType: 'text' | 'whatsapp' | 'video';
  customerName: string;
  location: string;
  // text type
  reviewText?: string;
  initials?: string;
  avatarColor?: 'navy' | 'sky' | 'amber' | 'green';
  rating?: number;
  // whatsapp type
  screenshotUrl?: string;
  caption?: string;
  // video type
  videoUrl?: string;
  thumbnailUrl?: string;
  videoTitle?: string;
  duration?: string;
}

export interface ContactInfo {
  whatsappNumber: string;
  phoneNumber: string;
  emailAddress: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  weekdayHours: string;
  sundayType: 'Closed' | 'Open';
  sundayHours: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export interface SiteStats {
  verifiedPlotsCount: number;
  plotsLabel: string;
  luxuryVillasCount: number;
  villasLabel: string;
  premiumFlatsCount: number;
  flatsLabel: string;
  yearsOfExperience: number;
  happyClientsCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationCategory {
  id: string;
  name: string;
  coverImage: string;
  projectsCount: number;
  displayOrder: number;
  active: boolean;
  associatedProjects?: string[];
  createdAt: string;
}
