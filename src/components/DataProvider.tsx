/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, FeaturedSpotlight, PopularProperty, Testimonial, ContactInfo, SiteStats } from '../types';
import {
  initialProperties,
  initialFeaturedSpotlight,
  initialPopularProperties,
  initialTestimonials,
  initialContactInfo,
  initialSiteStats
} from '../data/mockData';

interface DataContextType {
  properties: Property[];
  featuredSpotlight: FeaturedSpotlight;
  popularProperties: PopularProperty[];
  testimonials: Testimonial[];
  contactInfo: ContactInfo;
  siteStats: SiteStats;
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  updateFeaturedSpotlight: (spotlight: FeaturedSpotlight) => void;
  updatePopularProperties: (properties: PopularProperty[]) => void;
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  updateContactInfo: (info: ContactInfo) => void;
  updateSiteStats: (stats: SiteStats) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('bm_properties');
    return saved ? JSON.parse(saved) : initialProperties;
  });

  const [featuredSpotlight, setFeaturedSpotlight] = useState<FeaturedSpotlight>(() => {
    const saved = localStorage.getItem('bm_featured_spotlight');
    return saved ? JSON.parse(saved) : initialFeaturedSpotlight;
  });

  const [popularProperties, setPopularProperties] = useState<PopularProperty[]>(() => {
    const saved = localStorage.getItem('bm_popular_properties');
    return saved ? JSON.parse(saved) : initialPopularProperties;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('bm_testimonials');
    return saved ? JSON.parse(saved) : initialTestimonials;
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    const saved = localStorage.getItem('bm_contact_info');
    return saved ? JSON.parse(saved) : initialContactInfo;
  });

  const [siteStats, setSiteStats] = useState<SiteStats>(() => {
    const saved = localStorage.getItem('bm_site_stats');
    return saved ? JSON.parse(saved) : initialSiteStats;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bm_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('bm_featured_spotlight', JSON.stringify(featuredSpotlight));
  }, [featuredSpotlight]);

  useEffect(() => {
    localStorage.setItem('bm_popular_properties', JSON.stringify(popularProperties));
  }, [popularProperties]);

  useEffect(() => {
    localStorage.setItem('bm_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('bm_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
    localStorage.setItem('bm_site_stats', JSON.stringify(siteStats));
  }, [siteStats]);

  const addProperty = (newProp: Omit<Property, 'id' | 'createdAt'>) => {
    const id = `prop-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const propertyWithId: Property = {
      ...newProp,
      id,
      createdAt
    };
    setProperties((prev) => [propertyWithId, ...prev]);
  };

  const updateProperty = (id: string, updatedFields: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((prop) => (prop.id === id ? { ...prop, ...updatedFields } : prop))
    );
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((prop) => prop.id !== id));
  };

  const updateFeaturedSpotlight = (spotlight: FeaturedSpotlight) => {
    setFeaturedSpotlight(spotlight);
  };

  const updatePopularProperties = (props: PopularProperty[]) => {
    setPopularProperties(props);
  };

  const addTestimonial = (newTest: Omit<Testimonial, 'id'>) => {
    const id = `test-${Date.now()}`;
    setTestimonials((prev) => [{ ...newTest, id }, ...prev]);
  };

  const updateTestimonial = (id: string, updatedFields: Partial<Testimonial>) => {
    setTestimonials((prev) =>
      prev.map((test) => (test.id === id ? { ...test, ...updatedFields } : test))
    );
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((test) => test.id !== id));
  };

  const updateContactInfo = (info: ContactInfo) => {
    setContactInfo(info);
  };

  const updateSiteStats = (stats: SiteStats) => {
    setSiteStats(stats);
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        featuredSpotlight,
        popularProperties,
        testimonials,
        contactInfo,
        siteStats,
        addProperty,
        updateProperty,
        deleteProperty,
        updateFeaturedSpotlight,
        updatePopularProperties,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        updateContactInfo,
        updateSiteStats
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
