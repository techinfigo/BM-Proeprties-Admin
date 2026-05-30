/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Star,
  MapPin,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { properties, updateProperty, deleteProperty } = useData();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [transactionFilter, setTransactionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // Options: newest, oldest, price-high, price-low, area-high

  // Filter & Search Logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        const matchesSearch =
          prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.priceLabel.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'All' || prop.type.toLowerCase() === typeFilter.toLowerCase();
        
        const matchesTransaction =
          transactionFilter === 'All' || prop.transaction.toLowerCase() === transactionFilter.toLowerCase();

        return matchesSearch && matchesType && matchesTransaction;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'price-low') {
          return a.price - b.price;
        }
        if (sortBy === 'price-high') {
          return b.price - a.price;
        }
        if (sortBy === 'area-high') {
          return b.area - a.area;
        }
        return 0;
      });
  }, [properties, searchTerm, typeFilter, transactionFilter, sortBy]);

  // Actions
  const handleToggleFeatured = (id: string, currentStatus: boolean, title: string) => {
    updateProperty(id, { isFeatured: !currentStatus });
    showToast(
      `"${title}" is now ${!currentStatus ? 'Featured' : 'removed from Featured'}.`,
      'success'
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deleteProperty(id);
      showToast('Property listing deleted successfully.', 'success');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Upper header action board */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0A1F44] tracking-tight">Active Agra Real Estate Listings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {filteredProperties.length} of {properties.length} total properties listing database
          </p>
        </div>
        <Link
          to="/properties/new"
          className="flex items-center gap-2 px-5 py-3 bg-[#0A1F44] hover:bg-slate-900 border border-[#0A1F44]/20 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Listing</span>
        </Link>
      </div>

      {/* Segment controls, filters and search */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Field */}
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by title, address, locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-sm text-[#0A1F44] focus:outline-hidden focus:ring-2 focus:focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Property Category
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0A1F44] focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
            >
              <option value="All">All Categories (Flat/House/Plot...)</option>
              <option value="Flat">Flats / Apartments</option>
              <option value="House">Houses / Villas</option>
              <option value="Plot">Plots / Land</option>
              <option value="Commercial">Commercial / Offices</option>
            </select>
          </div>

          {/* Transaction Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Contract Option
            </label>
            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0A1F44] focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
            >
              <option value="All">All Transactions (Buy / Rent)</option>
              <option value="Buy">For Sale (Buy)</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter: Sorting options */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-4 flex-wrap gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Active refinement filters</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Sort lists:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1 px-2.5 bg-slate-100 border-none rounded-md text-xs font-semibold text-[#0A1F44] focus:outline-hidden"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-high">Area: Large to Small</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties List Table Data */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        {filteredProperties.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center">
            <Building2 className="w-14 h-14 text-slate-300 mb-3" />
            <span className="font-bold text-[#0A1F44] text-base mb-1">No matching results</span>
            <p className="text-xs text-slate-500 max-w-sm">
              We couldn't locate listings matching the keyword "{searchTerm}". Double check the spelling or resets your filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('All');
                setTransactionFilter('All');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1F44] text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-left text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Structure Info / Photo</th>
                  <th className="px-6 py-4">Locality</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Agreement</th>
                  <th className="px-6 py-4">Asking price</th>
                  <th className="px-6 py-4">Is Spotlight (Featured)</th>
                  <th className="px-6 py-4 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="text-sm hover:bg-slate-50/60 transition-colors">
                    {/* Thumbnail + Title */}
                    <td className="px-6 py-4 min-w-[220px]">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prop.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=80&q=40'}
                          alt={prop.title}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-slate-50"
                          referrerPolicy="no-referrer"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-[#0A1F44] truncate max-w-xs">{prop.title}</p>
                          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                            {prop.area} SQ.FT · {prop.bhk ? `${prop.bhk} BHK` : 'Plot/Office'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Geography */}
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{prop.locality}</span>
                      </div>
                    </td>

                    {/* Type Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#0ea5e9]/5 text-[#0ea5e9] border border-[#0ea5e9]/10">
                        {prop.type}
                      </span>
                    </td>

                    {/* Transaction Deal Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          prop.transaction === 'Buy'
                            ? 'bg-emerald-50 text-[#10b981] border border-emerald-100'
                            : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}
                      >
                        {prop.transaction === 'Buy' ? 'Buy / Sale' : 'On Rent'}
                      </span>
                    </td>

                    {/* Price with tag */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <span className="text-[#10b981] font-extrabold">{prop.priceLabel}</span>
                      <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                        ₹{prop.price.toLocaleString('en-IN')}
                      </p>
                    </td>

                    {/* Interactive Spotlight check */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(prop.id, prop.isFeatured, prop.title)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          prop.isFeatured
                            ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30 shadow-xs'
                            : 'bg-slate-50 text-slate-400 border-slate-200/60 hover:bg-slate-100/80 hover:text-slate-600'
                        }`}
                        title="Toggle Featured Status"
                      >
                        <Star className={`w-3.5 h-3.5 ${prop.isFeatured ? 'fill-[#f59e0b]' : ''}`} />
                        <span>{prop.isFeatured ? 'Yes (Spotlight)' : 'No (Toggle)'}</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/properties/edit/${prop.id}`)}
                          className="p-2 rounded-lg text-[#0ea5e9] hover:bg-[#0ea5e9]/5 border border-transparent hover:border-[#0ea5e9]/20 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
                          className="p-2 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/5 border border-transparent hover:border-[#ef4444]/20 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
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
