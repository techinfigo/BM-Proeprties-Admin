/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property, FeaturedSpotlight, PopularProperty, Testimonial, ContactInfo, SiteStats } from '../types';

export const initialProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Luxury 3 BHK Flat with Taj View',
    slug: 'luxury-3-bhk-flat-with-taj-view',
    locality: 'Tajganj',
    address: 'Heights Apartment, Sector 4, Tajganj, Agra, UP',
    description: 'Offering prime panoramic views of the Taj Mahal, this elegant 3 BHK apartment is situated in a secured gated community. It features modular bathrooms, Italian marble flooring, and 24x7 security personnel. Perfect for luxurious city living in Agra.',
    transaction: 'Buy',
    type: 'Flat',
    price: 9500000,
    priceLabel: '₹95 Lakh',
    area: 1850,
    bhk: 3,
    facing: 'East',
    possession: 'Ready',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: true,
    amenities: ['Lift', 'Parking', 'Security', 'Gym', 'Power Backup', 'CCTV'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-04-10'
  },
  {
    id: 'prop-2',
    title: 'Premium Independent House in Kamla Nagar',
    slug: 'premium-independent-house-in-kamla-nagar',
    locality: 'Kamla Nagar',
    address: 'D-Block, Kamla Nagar, Agra, UP',
    description: 'A beautiful independent residential house situated in the heart of Kamla Nagar. Features wide road connectivity, spacious ventilated rooms, front lawn, and dedicated parking space. Ready to move in.',
    transaction: 'Buy',
    type: 'House',
    price: 15000000,
    priceLabel: '₹1.50 Crore',
    area: 2500,
    bhk: 4,
    facing: 'North',
    possession: 'Ready',
    postedBy: 'Owner',
    whatsappNumber: '919837029310',
    isFeatured: true,
    amenities: ['Parking', 'Security', 'Power Backup', 'CCTV', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-05-01'
  },
  {
    id: 'prop-3',
    title: 'Commercial Office Space on Fatehabad Road',
    slug: 'commercial-office-space-on-fatehabad-road',
    locality: 'Fatehabad Road',
    address: 'A-Z Plaza, Fatehabad Road, Agra, UP',
    description: 'Highly visible first-floor complex ideal for retail outlets, IT offices, or corporate branches. Positioned on the main tourist corridor of Agra, assuring high footfall and great brand visibility.',
    transaction: 'Rent',
    type: 'Commercial',
    price: 45000,
    priceLabel: '₹45,000 / month',
    area: 1200,
    bhk: 0,
    facing: 'South',
    possession: 'Ready',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: false,
    amenities: ['Lift', 'Parking', 'Security', 'Power Backup', 'CCTV'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-05-15'
  },
  {
    id: 'prop-4',
    title: 'Residential Plot in Sikandra Suburb',
    slug: 'residential-plot-in-sikandra-suburb',
    locality: 'Sikandra',
    address: 'Shastripuram Colony, Sikandra, Agra, UP',
    description: 'IDA approved premium freehold boundary plot with water connection, metallic tar roads, and high-security checks. Golden investment opportunity inside a high-demand locality.',
    transaction: 'Buy',
    type: 'Plot',
    price: 4200000,
    priceLabel: '₹42 Lakh',
    area: 1800,
    bhk: 0,
    facing: 'West',
    possession: 'Ready',
    postedBy: 'Owner',
    whatsappNumber: '919837029310',
    isFeatured: true,
    amenities: ['Security', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-03-20'
  },
  {
    id: 'prop-5',
    title: 'Spicious 2 BHK Apartment on Rent',
    slug: 'spicious-2-bhk-apartment-on-rent',
    locality: 'Bodla',
    address: 'Krishna Residency, Bodla Crossing, Agra, UP',
    description: 'Ready to occupy semi-furnished 2 BHK flat featuring wide modern balconies, modular kitchen setup, and proximity to retail markets. Perfect for professional couples & small families.',
    transaction: 'Rent',
    type: 'Flat',
    price: 12000,
    priceLabel: '₹12,000 / month',
    area: 1100,
    bhk: 2,
    facing: 'East',
    possession: 'Ready',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: false,
    amenities: ['Lift', 'Parking', 'Security', 'Power Backup'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-05-18'
  },
  {
    id: 'prop-6',
    title: 'Modern Retail Shop in Shahganj Market',
    slug: 'modern-retail-shop-in-shahganj-market',
    locality: 'Shahganj',
    address: 'Main Bazar Way, Shahganj, Agra, UP',
    description: 'Ground floor shop directly in front of the primary road. Ideal for jewelry, garments, or electronic stores looking to tap into Agra’s traditional local crowd.',
    transaction: 'Rent',
    type: 'Commercial',
    price: 25000,
    priceLabel: '₹25,000 / month',
    area: 450,
    bhk: 0,
    facing: 'North',
    possession: 'Ready',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80'
    ],
    amenities: ['Security', 'CCTV'],
    createdAt: '2026-05-10'
  },
  {
    id: 'prop-7',
    title: 'Cozy 1 BHK House in Shahganj Corner',
    slug: 'cozy-1-bhk-house-in-shahganj-corner',
    locality: 'Shahganj',
    address: 'Ram Nagar Lane, Near Station Road, Shahganj, Agra, UP',
    description: 'Perfect visual house setup for student lock-ups or small office workers looking for low rent with standard basic systems already placed. 24x7 community water supply.',
    transaction: 'Rent',
    type: 'House',
    price: 6500,
    priceLabel: '₹6,500 / month',
    area: 600,
    bhk: 1,
    facing: 'East',
    possession: 'Ready',
    postedBy: 'Owner',
    whatsappNumber: '919837029310',
    isFeatured: false,
    amenities: ['Parking'],
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-05-22'
  },
  {
    id: 'prop-8',
    title: 'Under Construction Studio flat on Fatehabad Road',
    slug: 'under-construction-studio-flat-on-fatehabad-road',
    locality: 'Fatehabad Road',
    address: 'Elite Enclave, Main Fatehabad Road, Agra, UP',
    description: 'Premium modern studio apartment currently under development. Flexible floor plans, access to high-end clubhouse, indoor games facility, and rooftop cafeteria.',
    transaction: 'Buy',
    type: 'Flat',
    price: 3200000,
    priceLabel: '₹32 Lakh',
    area: 750,
    bhk: 1,
    facing: 'North',
    possession: 'Under Construction',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: true,
    amenities: ['Lift', 'Parking', 'Security', 'Gym', 'Swimming Pool', 'Power Backup', 'CCTV', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-05-28'
  },
  {
    id: 'prop-9',
    title: 'Massive Industrial Plot near Agra Cantt',
    slug: 'massive-industrial-plot-near-agra-cantt',
    locality: 'Agra Cantt',
    address: 'Rohta Road Sector, Agra Cantt, Agra, UP',
    description: 'Large boundary industrial or warehousing plot. Located just 15 minutes away from Agra Cantt Railway Station. Ideal for setting up cold storage, packaging center, or distribution unit.',
    transaction: 'Buy',
    type: 'Plot',
    price: 18000000,
    priceLabel: '₹1.80 Crore',
    area: 12000,
    bhk: 0,
    facing: 'South',
    possession: 'Ready',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: false,
    amenities: ['Security', 'Power Backup'],
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-04-05'
  },
  {
    id: 'prop-10',
    title: '3 BHK Modern Duplex in Sikandra',
    slug: '3-bhk-modern-duplex-in-sikandra',
    locality: 'Sikandra',
    address: 'Avas Vikas Colony, Sector 10, Sikandra, Agra, UP',
    description: 'Elegantly completed duplex with modern modular setup. Has gorgeous wooden cladding, modular wardrobes in all bedrooms, and spacious private terrace with garden area.',
    transaction: 'Buy',
    type: 'House',
    price: 8800000,
    priceLabel: '₹88 Lakh',
    area: 2100,
    bhk: 3,
    facing: 'East',
    possession: 'Ready',
    postedBy: 'Owner',
    whatsappNumber: '919837029310',
    isFeatured: false,
    amenities: ['Parking', 'Security', 'Power Backup', 'CCTV', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-05-20'
  },
  {
    id: 'prop-11',
    title: 'Agricultural Land / Farm Plot near Fatehabad',
    slug: 'agricultural-land-farm-plot-near-fatehabad',
    locality: 'Fatehabad Road',
    address: 'Mauza Kundol Road, Agra, UP',
    description: 'Slightly off Fort Road, prime fertile plot suitable for agricultural, organic farming, or weekend farmhouse projects. Safe community border fencing is already established.',
    transaction: 'Buy',
    type: 'Plot',
    price: 6500000,
    priceLabel: '₹65 Lakh',
    area: 25000,
    bhk: 0,
    facing: 'North',
    possession: 'Ready',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: false,
    amenities: [],
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-04-18'
  },
  {
    id: 'prop-12',
    title: 'Ready to Move Studio office in Belanganj',
    slug: 'ready-to-move-studio-office-in-belanganj',
    locality: 'Belanganj',
    address: 'Saraf Bazar, Belanganj, Agra, UP',
    description: 'Prime hub area commercial workspace on the third floor of a landmark plaza. Comes fully carpeted and equipped with individual AC provisions and common lounge spacing.',
    transaction: 'Rent',
    type: 'Commercial',
    price: 18000,
    priceLabel: '₹18,000 / month',
    area: 550,
    bhk: 0,
    facing: 'West',
    possession: 'Ready',
    postedBy: 'Agent',
    whatsappNumber: '919837029310',
    isFeatured: false,
    amenities: ['Lift', 'Security', 'Power Backup', 'CCTV'],
    images: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-05-12'
  }
];

export const initialFeaturedSpotlight: FeaturedSpotlight = {
  title: 'Presidential Estate on Fatehabad Road',
  locationLabel: 'Fatehabad Road, Agra',
  description: 'Unveiling a crown jewel of architectural brilliance, this magnificent lifestyle villa sits nestled on Fatehabad Road. Embellished with top-tier premium Italian marble work, multi-layered automated CCTV defenses, an Olympic-length swimming pool, private dynamic gym spaces, and beautiful private terraces that give a calming garden landscape setup.',
  bhk: 5,
  bathrooms: 6,
  area: 5400,
  priceLabel: '₹4.50 Crore',
  imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
  whatsappNumber: '919837029310'
};

export const initialPopularProperties: PopularProperty[] = [
  {
    id: 'pop-1',
    title: 'High-rise 3 BHK Skycrest',
    locality: 'Fatehabad Road, Agra',
    priceLabel: '₹1.10 Crore',
    statusBadge: 'FEATURED',
    type: 'FLAT',
    area: '1650 SQ.FT',
    bhkLabel: '3 BHK Apartment',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    slug: 'luxury-3-bhk-flat-with-taj-view'
  },
  {
    id: 'pop-2',
    title: 'Residential Plot near Metro Route',
    locality: 'Sikandra, Agra',
    priceLabel: '₹35 Lakh',
    statusBadge: 'HOT DEAL',
    type: 'PLOT',
    area: '1350 SQ.FT',
    bhkLabel: 'Plot',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
    slug: 'residential-plot-in-sikandra-suburb'
  },
  {
    id: 'pop-3',
    title: 'Elegance Garden Villa',
    locality: 'Kamla Nagar, Agra',
    priceLabel: '₹2.10 Crore',
    statusBadge: 'NEW',
    type: 'VILLA',
    area: '3100 SQ.FT',
    bhkLabel: '4 BHK Duplex',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    slug: 'premium-independent-house-in-kamla-nagar'
  },
  {
    id: 'pop-4',
    title: 'Signature Commercial Studio',
    locality: 'Tajganj, Agra',
    priceLabel: '₹85 Lakh',
    statusBadge: 'FEATURED',
    type: 'COMMERCIAL',
    area: '850 SQ.FT',
    bhkLabel: 'Retail / Office',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    slug: 'commercial-office-space-on-fatehabad-road'
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    customerName: 'Amit Shastry',
    location: 'Sikandra, Agra',
    reviewText: 'Finding a reliable property dealer in Agra is a hard task, but BM Properties completely changed our perspective. They helped us grab a wonderful plot in Sikandra and guided us seamlessly through the registrations.',
    initials: 'AS',
    avatarColor: 'navy',
    rating: 5
  },
  {
    id: 'test-2',
    customerName: 'Maggie Singhal',
    location: 'Dayal Bagh, Agra',
    reviewText: 'We listed our Kamla Nagar duplex for rental purposes and within three weeks we found highly professional tenants. Their property advertisement and quick dealer communication is absolutely unmatched.',
    initials: 'MS',
    avatarColor: 'sky',
    rating: 5
  },
  {
    id: 'test-3',
    customerName: 'Diego Gupta',
    location: 'Tajganj, Agra',
    reviewText: 'Incredibly transparent transaction. We bought our very first flat viewable directly facing the outer ring Taj areas. Zero hidden paperwork. Extremely recommended agency for Agra properties!',
    initials: 'DG',
    avatarColor: 'green',
    rating: 5
  }
];

export const initialContactInfo: ContactInfo = {
  whatsappNumber: '919837029310',
  phoneNumber: '+91 98370 29310',
  emailAddress: 'info@bmpropertiesagra.com',
  addressLine: 'Block No-25, Sanjay Palace, Civil Lines',
  city: 'Agra',
  state: 'Uttar Pradesh',
  pinCode: '282002',
  weekdayHours: 'Mon - Sat: 9:30 AM to 7:00 PM',
  sundayType: 'Closed',
  sundayHours: '',
  facebookUrl: 'https://facebook.com/bmpropertiesagra',
  instagramUrl: 'https://instagram.com/bmpropertiesagra',
  youtubeUrl: 'https://youtube.com/c/bmpropertiesagra'
};

export const initialSiteStats: SiteStats = {
  verifiedPlotsCount: 150,
  plotsLabel: '150+',
  luxuryVillasCount: 45,
  villasLabel: '45+',
  premiumFlatsCount: 220,
  flatsLabel: '220+',
  yearsOfExperience: 12,
  happyClientsCount: 850
};
