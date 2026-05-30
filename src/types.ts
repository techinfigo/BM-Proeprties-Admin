/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
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
  amenities: string[];
  images: string[];
  createdAt: string;
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

export interface PopularProperty {
  id: string;
  title: string;
  locality: string;
  priceLabel: string;
  statusBadge: 'FEATURED' | 'HOT DEAL' | 'NEW';
  type: 'FLAT' | 'PLOT' | 'VILLA' | 'HOUSE' | 'COMMERCIAL';
  area: string;
  bhkLabel: string;
  imageUrl: string;
  slug: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  reviewText: string;
  initials: string;
  avatarColor: 'navy' | 'sky' | 'amber' | 'green';
  rating: number;
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
