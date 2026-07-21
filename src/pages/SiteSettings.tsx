/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Layout,
  Image,
  Plus,
  Trash2,
  Loader2,
  Navigation,
  AlignLeft,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Sparkles,
  Monitor,
  Link2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';

interface NavLink { label: string; url: string; }
interface QuickLink { label: string; url: string; }

interface NavbarSettings {
  announcementText: string;
  announcementEnabled: boolean;
  logoText: string;
  logoImageUrl: string;
  navLinks: NavLink[];
}

interface FooterSettings {
  tagline: string;
  address: string;
  phone: string;
  email: string;
  copyrightText: string;
  quickLinks: QuickLink[];
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
}

interface HeroSettings {
  badgeText: string;
  headingLine1: string;
  headingLine2: string;
  backgroundImageUrl: string;
}

const defaultNavbar: NavbarSettings = {
  announcementText: 'PROPERTY PRICES IN AGRA SECTORS INCREASING SOON. BOOK YOUR SITE VISIT!',
  announcementEnabled: true,
  logoText: 'BM Properties',
  logoImageUrl: '',
  navLinks: []
};

const defaultFooter: FooterSettings = {
  tagline: '',
  address: '',
  phone: '',
  email: '',
  copyrightText: `© ${new Date().getFullYear()} BM Properties. All rights reserved.`,
  quickLinks: [],
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  twitterUrl: ''
};

const defaultHero: HeroSettings = {
  badgeText: 'LET US GUIDE YOUR HOME',
  headingLine1: 'FIND A PROPERTY',
  headingLine2: "YOU'LL LOVE",
  backgroundImageUrl: ''
};

const inputCls =
  'w-full px-3 py-2 bg-slate-50 rounded-lg text-xs text-[#0A1F44] border border-slate-200 focus:outline-[#0ea5e9] focus:bg-white transition-colors';
const labelCls = 'text-xs font-bold text-[#0A1F44] uppercase tracking-wider';

export const SiteSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [navbar, setNavbar] = useState<NavbarSettings>(defaultNavbar);
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter);
  const [hero, setHero] = useState<HeroSettings>(defaultHero);

  const [savingNavbar, setSavingNavbar] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [navSnap, footerSnap, heroSnap] = await Promise.all([
          getDoc(doc(db, 'siteConfig', 'navbarSettings')),
          getDoc(doc(db, 'siteConfig', 'footerSettings')),
          getDoc(doc(db, 'siteConfig', 'heroSettings'))
        ]);
        if (navSnap.exists()) setNavbar({ ...defaultNavbar, ...navSnap.data() as NavbarSettings });
        if (footerSnap.exists()) setFooter({ ...defaultFooter, ...footerSnap.data() as FooterSettings });
        if (heroSnap.exists()) setHero({ ...defaultHero, ...heroSnap.data() as HeroSettings });
      } catch {
        showToast('Failed to load site settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveNavbar = async () => {
    setSavingNavbar(true);
    try {
      await setDoc(doc(db, 'siteConfig', 'navbarSettings'), navbar);
      showToast('Navbar settings saved successfully!', 'success');
    } catch {
      showToast('Failed to save navbar settings', 'error');
    } finally {
      setSavingNavbar(false);
    }
  };

  const saveFooter = async () => {
    setSavingFooter(true);
    try {
      await setDoc(doc(db, 'siteConfig', 'footerSettings'), footer);
      showToast('Footer settings saved successfully!', 'success');
    } catch {
      showToast('Failed to save footer settings', 'error');
    } finally {
      setSavingFooter(false);
    }
  };

  const saveHero = async () => {
    setSavingHero(true);
    try {
      await setDoc(doc(db, 'siteConfig', 'heroSettings'), hero);
      showToast('Hero section settings saved successfully!', 'success');
    } catch {
      showToast('Failed to save hero settings', 'error');
    } finally {
      setSavingHero(false);
    }
  };

  // Nav links helpers
  const addNavLink = () =>
    setNavbar(n => ({ ...n, navLinks: [...n.navLinks, { label: '', url: '' }] }));
  const removeNavLink = (i: number) =>
    setNavbar(n => ({ ...n, navLinks: n.navLinks.filter((_, idx) => idx !== i) }));
  const updateNavLink = (i: number, field: keyof NavLink, val: string) =>
    setNavbar(n => {
      const links = [...n.navLinks];
      links[i] = { ...links[i], [field]: val };
      return { ...n, navLinks: links };
    });

  // Quick links helpers
  const addQuickLink = () =>
    setFooter(f => ({ ...f, quickLinks: [...f.quickLinks, { label: '', url: '' }] }));
  const removeQuickLink = (i: number) =>
    setFooter(f => ({ ...f, quickLinks: f.quickLinks.filter((_, idx) => idx !== i) }));
  const updateQuickLink = (i: number, field: keyof QuickLink, val: string) =>
    setFooter(f => {
      const links = [...f.quickLinks];
      links[i] = { ...links[i], [field]: val };
      return { ...f, quickLinks: links };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading site settings…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Site Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage global site configuration — navbar, footer, and homepage hero section.
        </p>
      </div>

      {/* ─── SECTION 1: Navbar Settings ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-6 md:px-8 py-4 border-b border-slate-100 bg-slate-50/60">
          <Navigation className="text-[#0ea5e9] w-4.5 h-4.5" />
          <h3 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">
            Section 1 — Navbar Settings
          </h3>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-6">
          {/* Announcement bar */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className={labelCls}>Announcement Bar</span>
              <button
                type="button"
                onClick={() => setNavbar(n => ({ ...n, announcementEnabled: !n.announcementEnabled }))}
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                {navbar.announcementEnabled ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-[#10b981]" />
                    <span className="text-[#10b981]">Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-400">Disabled</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Announcement Text</label>
              <input
                type="text"
                placeholder="PROPERTY PRICES IN AGRA SECTORS INCREASING SOON…"
                className={inputCls}
                value={navbar.announcementText}
                onChange={e => setNavbar(n => ({ ...n, announcementText: e.target.value }))}
              />
            </div>
          </div>

          {/* Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Logo Text</label>
              <input
                type="text"
                placeholder="BM Properties"
                className={inputCls}
                value={navbar.logoText}
                onChange={e => setNavbar(n => ({ ...n, logoText: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Logo Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                className={inputCls}
                value={navbar.logoImageUrl}
                onChange={e => setNavbar(n => ({ ...n, logoImageUrl: e.target.value }))}
              />
            </div>
          </div>

          {/* Logo preview */}
          {navbar.logoImageUrl && (
            <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg w-fit">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Preview:</span>
              <img
                src={navbar.logoImageUrl}
                alt="Logo preview"
                className="h-8 object-contain"
                onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            </div>
          )}

          {/* Nav links */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Nav Links</label>
              <button
                type="button"
                onClick={addNavLink}
                className="flex items-center gap-1 text-xs font-semibold text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>
            {navbar.navLinks.length === 0 && (
              <p className="text-xs text-slate-400 italic">No nav links added yet.</p>
            )}
            {navbar.navLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Home)"
                  className={`${inputCls} flex-1`}
                  value={link.label}
                  onChange={e => updateNavLink(i, 'label', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="URL (e.g. /properties)"
                  className={`${inputCls} flex-[2]`}
                  value={link.url}
                  onChange={e => updateNavLink(i, 'url', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeNavLink(i)}
                  className="p-1.5 text-slate-400 hover:text-[#ef4444] hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={savingNavbar}
            onClick={saveNavbar}
            className="w-full py-3 bg-[#0A1F44] hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingNavbar ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {savingNavbar ? 'Saving…' : 'Save Navbar Settings'}
          </button>
        </div>
      </div>

      {/* ─── SECTION 2: Footer Settings ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-6 md:px-8 py-4 border-b border-slate-100 bg-slate-50/60">
          <AlignLeft className="text-[#f59e0b] w-4.5 h-4.5" />
          <h3 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">
            Section 2 — Footer Settings
          </h3>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-6">
          {/* Tagline */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Company Tagline</label>
            <textarea
              rows={2}
              placeholder="Your trusted real estate partner in Agra…"
              className={inputCls}
              value={footer.tagline}
              onChange={e => setFooter(f => ({ ...f, tagline: e.target.value }))}
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className={`${labelCls} flex items-center gap-1`}>
              <MapPin className="w-3.5 h-3.5 text-[#f59e0b]" />
              Footer Address
            </label>
            <textarea
              rows={2}
              placeholder="Block No-25, Sanjay Palace, Civil Lines, Agra"
              className={inputCls}
              value={footer.address}
              onChange={e => setFooter(f => ({ ...f, address: e.target.value }))}
            />
          </div>

          {/* Phone / Email / Copyright */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={`${labelCls} flex items-center gap-1`}>
                <Phone className="w-3.5 h-3.5 text-[#0ea5e9]" />
                Footer Phone
              </label>
              <input
                type="text"
                placeholder="+91 98370 29310"
                className={inputCls}
                value={footer.phone}
                onChange={e => setFooter(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`${labelCls} flex items-center gap-1`}>
                <Mail className="w-3.5 h-3.5 text-[#10b981]" />
                Footer Email
              </label>
              <input
                type="email"
                placeholder="info@bmpropertiesagra.com"
                className={inputCls}
                value={footer.email}
                onChange={e => setFooter(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Copyright Text</label>
              <input
                type="text"
                placeholder="© 2025 BM Properties. All rights reserved."
                className={inputCls}
                value={footer.copyrightText}
                onChange={e => setFooter(f => ({ ...f, copyrightText: e.target.value }))}
              />
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Quick Links</label>
              <button
                type="button"
                onClick={addQuickLink}
                className="flex items-center gap-1 text-xs font-semibold text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>
            {footer.quickLinks.length === 0 && (
              <p className="text-xs text-slate-400 italic">No quick links added yet.</p>
            )}
            {footer.quickLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. About Us)"
                  className={`${inputCls} flex-1`}
                  value={link.label}
                  onChange={e => updateQuickLink(i, 'label', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="URL (e.g. /about)"
                  className={`${inputCls} flex-[2]`}
                  value={link.url}
                  onChange={e => updateQuickLink(i, 'url', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeQuickLink(i)}
                  className="p-1.5 text-slate-400 hover:text-[#ef4444] hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-4">
            <span className={labelCls}>Social Media Links</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <Facebook className="w-3.5 h-3.5" /> Facebook URL
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/bmproperties"
                  className={inputCls}
                  value={footer.facebookUrl}
                  onChange={e => setFooter(f => ({ ...f, facebookUrl: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5" /> Instagram URL
                </label>
                <input
                  type="text"
                  placeholder="https://instagram.com/bmproperties"
                  className={inputCls}
                  value={footer.instagramUrl}
                  onChange={e => setFooter(f => ({ ...f, instagramUrl: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5" /> YouTube URL
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/c/bmproperties"
                  className={inputCls}
                  value={footer.youtubeUrl}
                  onChange={e => setFooter(f => ({ ...f, youtubeUrl: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-sky-500 uppercase tracking-wider flex items-center gap-1">
                  <Twitter className="w-3.5 h-3.5" /> Twitter / X URL
                </label>
                <input
                  type="text"
                  placeholder="https://twitter.com/bmproperties"
                  className={inputCls}
                  value={footer.twitterUrl}
                  onChange={e => setFooter(f => ({ ...f, twitterUrl: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={savingFooter}
            onClick={saveFooter}
            className="w-full py-3 bg-[#0A1F44] hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingFooter ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {savingFooter ? 'Saving…' : 'Save Footer Settings'}
          </button>
        </div>
      </div>

      {/* ─── SECTION 3: Homepage Hero ────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-6 md:px-8 py-4 border-b border-slate-100 bg-slate-50/60">
          <Sparkles className="text-[#10b981] w-4.5 h-4.5" />
          <h3 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider">
            Section 3 — Homepage Hero
          </h3>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Hero Badge Text</label>
              <input
                type="text"
                placeholder="LET US GUIDE YOUR HOME"
                className={inputCls}
                value={hero.badgeText}
                onChange={e => setHero(h => ({ ...h, badgeText: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Heading Line 1</label>
              <input
                type="text"
                placeholder="FIND A PROPERTY"
                className={inputCls}
                value={hero.headingLine1}
                onChange={e => setHero(h => ({ ...h, headingLine1: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Heading Line 2</label>
              <input
                type="text"
                placeholder="YOU'LL LOVE"
                className={inputCls}
                value={hero.headingLine2}
                onChange={e => setHero(h => ({ ...h, headingLine2: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`${labelCls} flex items-center gap-1`}>
              <Image className="w-3.5 h-3.5 text-[#10b981]" />
              Hero Background Image URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/hero-bg.jpg"
              className={inputCls}
              value={hero.backgroundImageUrl}
              onChange={e => setHero(h => ({ ...h, backgroundImageUrl: e.target.value }))}
            />
          </div>

          {/* Hero preview */}
          {hero.backgroundImageUrl && (
            <div
              className="relative rounded-xl overflow-hidden h-40 bg-cover bg-center flex items-center justify-center"
              style={{ backgroundImage: `url(${hero.backgroundImageUrl})` }}
            >
              <div className="absolute inset-0 bg-[#0A1F44]/55" />
              <div className="relative text-center text-white z-10 px-4">
                {hero.badgeText && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#0ea5e9]/80 px-2 py-0.5 rounded-full block w-fit mx-auto mb-2">
                    {hero.badgeText}
                  </span>
                )}
                <p className="font-extrabold text-lg leading-tight drop-shadow-sm">
                  {hero.headingLine1 || 'FIND A PROPERTY'}
                </p>
                <p className="font-extrabold text-lg leading-tight text-[#0ea5e9] drop-shadow-sm">
                  {hero.headingLine2 || "YOU'LL LOVE"}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={savingHero}
            onClick={saveHero}
            className="w-full py-3 bg-[#0A1F44] hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {savingHero ? 'Saving…' : 'Save Hero Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
