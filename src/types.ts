/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  title: string;
  slug: string;
  locality: string;
  address: string;
  description: string;
  transaction: 'Buy' | 'Rent';
  type: 'Flat' | 'House' | 'Plot' | 'Commercial';
  price: number;
  priceLabel: string;
  pricePerSqYard?: number;
  area: number;
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
