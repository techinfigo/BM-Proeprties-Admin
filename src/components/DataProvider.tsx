import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, setDoc, getDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Property, FeaturedSpotlight,
  Testimonial, ContactInfo, SiteStats, BlogPost, LocationCategory
} from '../types';
import {
  initialFeaturedSpotlight,
  initialContactInfo, initialSiteStats
} from '../data/mockData';

interface DataContextType {
  properties: Property[];
  featuredSpotlight: FeaturedSpotlight;
  testimonials: Testimonial[];
  blogs: BlogPost[];
  locationCategories: LocationCategory[];
  contactInfo: ContactInfo;
  siteStats: SiteStats;
  loading: boolean;
  addProperty: (property: Omit<Property, 'id'> & { createdAt?: string }) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  updateFeaturedSpotlight: (spotlight: FeaturedSpotlight) => Promise<void>;
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  updateContactInfo: (info: ContactInfo) => Promise<void>;
  updateSiteStats: (stats: SiteStats) => Promise<void>;
  addBlog: (blog: Omit<BlogPost, 'id'>) => Promise<void>;
  updateBlog: (id: string, blog: Partial<BlogPost>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addLocationCategory: (cat: Omit<LocationCategory, 'id' | 'createdAt'>) => Promise<void>;
  updateLocationCategory: (id: string, cat: Partial<LocationCategory>) => Promise<void>;
  deleteLocationCategory: (id: string) => Promise<void>;
}

// Firestore rejects writes containing an explicit `undefined` field value
// (throws "Unsupported field value: undefined"). Form data routinely carries
// undefined for optional fields that were never filled in, so every write
// path needs to strip those keys before hitting addDoc/updateDoc.
const stripUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

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
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [locationCategories, setLocationCategories] = useState<LocationCategory[]>([]);
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

    // Listen to blogs in real-time
    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
      setBlogs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    });

    // Listen to locationCategories in real-time
    const unsubLocationCategories = onSnapshot(collection(db, 'locationCategories'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as LocationCategory));
      setLocationCategories(data.sort((a, b) => a.displayOrder - b.displayOrder));
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
      unsubBlogs();
      unsubLocationCategories();
    };
  }, []);

  const addProperty = async (newProp: Omit<Property, 'id'> & { createdAt?: string }) => {
    const createdAt = newProp.createdAt || new Date().toISOString().split('T')[0];
    await addDoc(collection(db, 'properties'), stripUndefined({ ...newProp, createdAt }));
  };

  const updateProperty = async (id: string, updatedFields: Partial<Property>) => {
    await updateDoc(doc(db, 'properties', id), stripUndefined(updatedFields));
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

  const addBlog = async (newBlog: Omit<BlogPost, 'id'>) => {
    await addDoc(collection(db, 'blogs'), newBlog);
  };

  const updateBlog = async (id: string, updatedFields: Partial<BlogPost>) => {
    await updateDoc(doc(db, 'blogs', id), updatedFields);
  };

  const deleteBlog = async (id: string) => {
    await deleteDoc(doc(db, 'blogs', id));
  };

  const addLocationCategory = async (cat: Omit<LocationCategory, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString();
    await addDoc(collection(db, 'locationCategories'), { ...cat, createdAt });
  };

  const updateLocationCategory = async (id: string, cat: Partial<LocationCategory>) => {
    await updateDoc(doc(db, 'locationCategories', id), cat);
  };

  const deleteLocationCategory = async (id: string) => {
    await deleteDoc(doc(db, 'locationCategories', id));
  };

  return (
    <DataContext.Provider value={{
      properties, featuredSpotlight,
      testimonials, blogs, locationCategories, contactInfo, siteStats, loading,
      addProperty, updateProperty, deleteProperty,
      updateFeaturedSpotlight,
      addTestimonial, updateTestimonial, deleteTestimonial,
      updateContactInfo, updateSiteStats,
      addBlog, updateBlog, deleteBlog,
      addLocationCategory, updateLocationCategory, deleteLocationCategory
    }}>
      {children}
    </DataContext.Provider>
  );
};
