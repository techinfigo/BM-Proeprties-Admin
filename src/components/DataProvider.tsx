import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, setDoc, getDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Property, FeaturedSpotlight,
  Testimonial, ContactInfo, SiteStats
} from '../types';
import {
  initialFeaturedSpotlight,
  initialContactInfo, initialSiteStats
} from '../data/mockData';

interface DataContextType {
  properties: Property[];
  featuredSpotlight: FeaturedSpotlight;
  testimonials: Testimonial[];
  contactInfo: ContactInfo;
  siteStats: SiteStats;
  loading: boolean;
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  updateFeaturedSpotlight: (spotlight: FeaturedSpotlight) => Promise<void>;
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  updateContactInfo: (info: ContactInfo) => Promise<void>;
  updateSiteStats: (stats: SiteStats) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredSpotlight, setFeaturedSpotlight] = useState<FeaturedSpotlight>(initialFeaturedSpotlight);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo);
  const [siteStats, setSiteStats] = useState<SiteStats>(initialSiteStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to properties in real-time
    const unsubProperties = onSnapshot(collection(db, 'properties'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Property));
      setProperties(data);
    });

    // Listen to testimonials in real-time
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial));
      setTestimonials(data);
    });

    // Load single documents
    const loadSingleDocs = async () => {
      try {
        const [spotSnap, contactSnap, statsSnap] = await Promise.all([
          getDoc(doc(db, 'siteConfig', 'featuredSpotlight')),
          getDoc(doc(db, 'siteConfig', 'contactInfo')),
          getDoc(doc(db, 'siteConfig', 'siteStats')),
        ]);

        if (spotSnap.exists()) setFeaturedSpotlight(spotSnap.data() as FeaturedSpotlight);
        if (contactSnap.exists()) setContactInfo(contactSnap.data() as ContactInfo);
        if (statsSnap.exists()) setSiteStats(statsSnap.data() as SiteStats);
      } catch (err) {
        console.error('Error loading config:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSingleDocs();
    return () => {
      unsubProperties();
      unsubTestimonials();
    };
  }, []);

  const addProperty = async (newProp: Omit<Property, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString().split('T')[0];
    await addDoc(collection(db, 'properties'), { ...newProp, createdAt });
  };

  const updateProperty = async (id: string, updatedFields: Partial<Property>) => {
    await updateDoc(doc(db, 'properties', id), updatedFields);
  };

  const deleteProperty = async (id: string) => {
    await deleteDoc(doc(db, 'properties', id));
  };

  const updateFeaturedSpotlight = async (spotlight: FeaturedSpotlight) => {
    await setDoc(doc(db, 'siteConfig', 'featuredSpotlight'), spotlight);
    setFeaturedSpotlight(spotlight);
  };

  const addTestimonial = async (newTest: Omit<Testimonial, 'id'>) => {
    await addDoc(collection(db, 'testimonials'), newTest);
  };

  const updateTestimonial = async (id: string, updatedFields: Partial<Testimonial>) => {
    await updateDoc(doc(db, 'testimonials', id), updatedFields);
  };

  const deleteTestimonial = async (id: string) => {
    await deleteDoc(doc(db, 'testimonials', id));
  };

  const updateContactInfo = async (info: ContactInfo) => {
    await setDoc(doc(db, 'siteConfig', 'contactInfo'), info);
    setContactInfo(info);
  };

  const updateSiteStats = async (stats: SiteStats) => {
    await setDoc(doc(db, 'siteConfig', 'siteStats'), stats);
    setSiteStats(stats);
  };

  return (
    <DataContext.Provider value={{
      properties, featuredSpotlight,
      testimonials, contactInfo, siteStats, loading,
      addProperty, updateProperty, deleteProperty,
      updateFeaturedSpotlight,
      addTestimonial, updateTestimonial, deleteTestimonial,
      updateContactInfo, updateSiteStats
    }}>
      {children}
    </DataContext.Provider>
  );
};
