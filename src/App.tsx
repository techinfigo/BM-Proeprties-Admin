/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { DataProvider } from './components/DataProvider';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { PropertyForm } from './pages/PropertyForm';
import { FeaturedSpotlight } from './pages/FeaturedSpotlight';
import { PopularProperties } from './pages/PopularProperties';
import { Testimonials } from './pages/Testimonials';
import { ContactInfo } from './pages/ContactInfo';
import { SiteStats } from './pages/SiteStats';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <DataProvider>
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Private Layout Core */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="properties/new" element={<PropertyForm />} />
              <Route path="properties/edit/:id" element={<PropertyForm />} />
              <Route path="featured-spotlight" element={<FeaturedSpotlight />} />
              <Route path="popular-properties" element={<PopularProperties />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="contact-info" element={<ContactInfo />} />
              <Route path="site-stats" element={<SiteStats />} />
            </Route>

            {/* Catch-all Route redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </ToastProvider>
    </Router>
  );
}
