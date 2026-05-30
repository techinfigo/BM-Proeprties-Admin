/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Star,
  MessageSquare,
  Bell,
  Pencil,
  Trash2,
  TrendingUp,
  MapPin,
  IndianRupee,
  Plus
} from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { properties, testimonials, deleteProperty } = useData();

  // Computations
  const totalProperties = properties.length;
  const featuredPropertiesCount = useMemo(() => properties.filter((p) => p.isFeatured).length, [properties]);
  const totalTestimonialsCount = testimonials.length;
  const pendingInquiriesCount = 3; // Simulated from list in Header

  // Recent 5 properties
  const recentProperties = useMemo(() => {
    // Sort or just pick the top 5
    return [...properties].slice(0, 5);
  }, [properties]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteProperty(id);
      showToast('Property deleted successfully', 'success');
    }
  };

  const statCards = [
    {
      title: 'Total Properties',
      value: totalProperties,
      icon: Building2,
      colorClass: 'text-[#0ea5e9]',
      bgClass: 'bg-[#0ea5e9]/10',
      borderClass: 'border-[#0ea5e9]/20',
      description: 'Active marketplace listings'
    },
    {
      title: 'Featured Properties',
      value: featuredPropertiesCount,
      icon: Star,
      colorClass: 'text-[#f59e0b]',
      bgClass: 'bg-[#f59e0b]/10',
      borderClass: 'border-[#f59e0b]/20',
      description: 'Highlighted on home view'
    },
    {
      title: 'Total Testimonials',
      value: totalTestimonialsCount,
      icon: MessageSquare,
      colorClass: 'text-[#10b981]',
      bgClass: 'bg-[#10b981]/10',
      borderClass: 'border-[#10b981]/20',
      description: 'Verified buyer reviews'
    },
    {
      title: 'Pending Inquiries',
      value: pendingInquiriesCount,
      icon: Bell,
      colorClass: 'text-[#ef4444]',
      bgClass: 'bg-[#ef4444]/10',
      borderClass: 'border-[#ef4444]/20',
      description: 'Customers waiting callback'
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Welcome Hero Banner */}
      <div className="bg-[#0A1F44] text-white p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-slate-700/10">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome to Brokerage Console</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            You are managing BM Properties estate platform. Feel free to quickly alter listings, tweak homepage spotlight, or update buyer remarks.
          </p>
        </div>
        <Link
          to="/properties/new"
          className="flex items-center gap-2 px-5 py-3 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#0ea5e9]/10 active:scale-98 cursor-pointer max-w-max"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Listing</span>
        </Link>
      </div>

      {/* Grid of 4 card metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 bg-white rounded-xl border ${card.borderClass} flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#475569]">{card.title}</span>
                <div className={`p-2.5 rounded-lg ${card.bgClass} ${card.colorClass} border ${card.borderClass} transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-[#0A1F44] tracking-tight">{card.value}</span>
                <p className="text-[11px] text-[#475569] mt-0.5">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0A1F44] text-base">Recently Added Listings</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top 5 recent active additions in Agra</p>
          </div>
          <Link
            to="/properties"
            className="text-xs font-bold text-[#0ea5e9] hover:text-[#0b84bc] transition-colors flex items-center gap-1.5"
          >
            <span>Go to Properties Manager &rarr;</span>
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">No properties exist inside client state database</p>
            <Link to="/properties/new" className="text-xs font-bold text-[#0ea5e9] mt-1 inline-block hover:underline">
              Add first commercial or flat listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-left text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Locality</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status / Badge</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProperties.map((prop) => (
                  <tr key={prop.id} className="text-sm hover:bg-slate-50/70 transition-colors">
                    {/* Title with small photo thumbnail preview */}
                    <td className="px-6 py-4 font-semibold text-[#0A1F44] min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=80&q=40'}
                          alt={prop.title}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="overflow-hidden truncate max-w-xs">
                          <p className="truncate block font-semibold text-[#0A1F44]">{prop.title}</p>
                          <span className="text-[10px] text-slate-400 capitalize block mt-0.5">
                            For {prop.transaction}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Locality with map icon */}
                    <td className="px-6 py-4 text-[#475569]">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{prop.locality}</span>
                      </div>
                    </td>
                    {/* Type badge */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-[#0ea5e9] border border-sky-100 uppercase">
                        {prop.type}
                      </span>
                    </td>
                    {/* Price in rupees */}
                    <td className="px-6 py-4 text-emerald-600 font-bold">
                      <div className="flex items-center gap-0.5 text-xs text-[#10b981]">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{prop.priceLabel}</span>
                      </div>
                    </td>
                    {/* Status badge showing features */}
                    <td className="px-6 py-4">
                      {prop.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                          <Star className="w-2.5 h-2.5 fill-[#f59e0b]" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-100">
                          Regular
                        </span>
                      )}
                    </td>
                    {/* Quick modification actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/properties/edit/${prop.id}`)}
                          className="p-1.5 rounded-lg text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
                          className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
