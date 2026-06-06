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
  Heart,
  MapPin,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { properties, updateProperty, deleteProperty } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [transactionFilter, setTransactionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'area-high') return b.area - a.area;
        return 0;
      });
  }, [properties, searchTerm, typeFilter, transactionFilter, sortBy]);

  const allFilteredSelected =
    filteredProperties.length > 0 && filteredProperties.every((p) => selectedIds.has(p.id));
  const someFilteredSelected = filteredProperties.some((p) => selectedIds.has(p.id));

  const handleHeaderCheckbox = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProperties.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProperties.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const handleRowCheckbox = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProperties.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProperties.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} ${count === 1 ? 'property' : 'properties'}? This cannot be undone.`)) return;
    for (const id of selectedIds) {
      await deleteProperty(id);
    }
    setSelectedIds(new Set());
    showToast(`${count} ${count === 1 ? 'property' : 'properties'} deleted successfully.`, 'success');
  };

  const handleTogglePopular = (id: string, currentStatus: boolean, title: string) => {
    updateProperty(id, { isPopular: !currentStatus });
    showToast(
      `"${title}" is now ${!currentStatus ? 'marked as Popular' : 'removed from Popular'}.`,
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
      {/* Header */}
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

      {/* Filters — stacks on mobile via grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by title, address, locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-sm text-[#0A1F44] focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property Category</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0A1F44] focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
            >
              <option value="All">All Categories</option>
              <option value="Flat">Flats / Apartments</option>
              <option value="House">Houses / Villas</option>
              <option value="Plot">Plots / Land</option>
              <option value="Commercial">Commercial / Offices</option>
            </select>
          </div>

          {/* Transaction Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contract Option</label>
            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0A1F44] focus:outline-hidden focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
            >
              <option value="All">All Transactions</option>
              <option value="Buy">For Sale (Buy)</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>
        </div>

        {/* Sort row */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 flex-wrap gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Active refinement filters</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Sort:</span>
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        {filteredProperties.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center">
            <Building2 className="w-14 h-14 text-slate-300 mb-3" />
            <span className="font-bold text-[#0A1F44] text-base mb-1">No matching results</span>
            <p className="text-xs text-slate-500 max-w-sm">
              We couldn't locate listings matching the keyword "{searchTerm}". Double check the spelling or reset your filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter('All'); setTransactionFilter('All'); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1F44] text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Select All / Deselect All toggle above table */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="text-xs font-semibold text-[#0ea5e9] hover:text-[#0284c7] transition-colors cursor-pointer"
              >
                {allFilteredSelected ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIds.size > 0 && (
                <span className="text-xs text-slate-500">{selectedIds.size} selected</span>
              )}
            </div>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
              <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-[#0A1F44] flex-1">
                  {selectedIds.size} {selectedIds.size === 1 ? 'property' : 'properties'} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Deselect All
                </button>
              </div>
            )}

            <div className="overflow-x-auto w-full">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        ref={(el) => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
                        onChange={handleHeaderCheckbox}
                        className="w-4 h-4 rounded border-slate-300 text-[#0ea5e9] cursor-pointer accent-[#0ea5e9]"
                      />
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap">Property</th>
                    <th className="px-4 py-3 whitespace-nowrap">Type / Deal</th>
                    <th className="px-4 py-3 whitespace-nowrap">Asking Price</th>
                    <th className="px-4 py-3 whitespace-nowrap">Badges</th>
                    <th className="px-4 py-3 whitespace-nowrap">Popular</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-slate-50 z-10">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.map((prop) => {
                    const isSelected = selectedIds.has(prop.id);
                    return (
                      <tr
                        key={prop.id}
                        className={`group transition-colors ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'}`}
                      >

                        {/* Checkbox */}
                        <td className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowCheckbox(prop.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#0ea5e9] cursor-pointer accent-[#0ea5e9]"
                          />
                        </td>

                        {/* Thumbnail + title + specs + locality badge */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {prop.images[0] ? (
                              <img
                                src={prop.images[0]}
                                alt={prop.title}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-slate-100"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg border border-slate-200 flex-shrink-0 bg-slate-100 flex flex-col items-center justify-center">
                                <span className="text-[8px] font-medium text-slate-400 leading-tight text-center">No Image</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#0A1F44] truncate max-w-[200px]">{prop.title}</p>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {prop.area} sq.ft{prop.bhk ? ` · ${prop.bhk} BHK` : ' · Plot/Office'}
                              </span>
                              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate max-w-[120px]">{prop.locality}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type + Transaction merged */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#0ea5e9]/8 text-[#0ea5e9] border border-[#0ea5e9]/15 w-fit">
                              {prop.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                              prop.transaction === 'Buy'
                                ? 'bg-emerald-50 text-[#10b981] border border-emerald-100'
                                : 'bg-purple-50 text-purple-600 border border-purple-100'
                            }`}>
                              {prop.transaction === 'Buy' ? 'For Sale' : 'For Rent'}
                            </span>
                          </div>
                        </td>

                        {/* Price — formatted label only */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-extrabold text-[#10b981] whitespace-nowrap">{prop.priceLabel}</span>
                        </td>

                        {/* Badges */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {(() => {
                              const daysSince = (Date.now() - new Date(prop.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                              const allBadges = [
                                ...(prop.badges || []).filter(b => b !== 'new-listing'),
                                ...(daysSince <= 30 ? ['new-listing'] : [])
                              ];
                              if (allBadges.length === 0) return <span className="text-[10px] text-slate-300">—</span>;
                              const BADGE_STYLES: Record<string, { label: string; cls: string }> = {
                                'premium':      { label: '🏆 PREMIUM',      cls: 'bg-amber-50 text-amber-700 border-amber-200' },
                                'verified':     { label: '✅ VERIFIED',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                                'urgent-sale':  { label: '⚡ URGENT',        cls: 'bg-red-50 text-red-600 border-red-100' },
                                'new-listing':  { label: '🆕 NEW',           cls: 'bg-blue-50 text-blue-700 border-blue-100' },
                              };
                              return allBadges.map(b => {
                                const s = BADGE_STYLES[b];
                                if (!s) return null;
                                return (
                                  <span key={b} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap w-fit ${s.cls}`}>
                                    {s.label}
                                  </span>
                                );
                              });
                            })()}
                          </div>
                        </td>

                        {/* Popular toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleTogglePopular(prop.id, !!prop.isPopular, prop.title)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${
                              prop.isPopular
                                ? 'bg-pink-50 text-pink-500 border-pink-200 shadow-xs'
                                : 'bg-slate-50 text-slate-400 border-slate-200/60 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                            title="Toggle Popular Status"
                          >
                            <Heart className={`w-3 h-3 ${prop.isPopular ? 'fill-pink-500' : ''}`} />
                            <span>{prop.isPopular ? 'Yes' : 'No'}</span>
                          </button>
                        </td>

                        {/* Action buttons — sticky right */}
                        <td className={`px-4 py-3 sticky right-0 transition-colors z-10 ${isSelected ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-white group-hover:bg-slate-50'}`}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/properties/edit/${prop.id}`)}
                              className="p-1.5 rounded-lg text-[#0ea5e9] hover:bg-[#0ea5e9]/8 border border-transparent hover:border-[#0ea5e9]/20 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(prop.id, prop.title)}
                              className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/8 border border-transparent hover:border-[#ef4444]/20 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Del</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
