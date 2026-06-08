/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { MessageCircle, Trash2, Inbox, XCircle, RotateCcw, Eye, X, Phone } from 'lucide-react';
import { useToast } from '../components/Toast';

// Accepts all fields any form might save — unknown fields are captured via index signature
interface Inquiry {
  id: string;
  // name variants
  name?: string;
  ownerName?: string;
  fullName?: string;
  // phone variants
  phone?: string;
  ownerPhone?: string;
  mobile?: string;
  // other fields
  email?: string;
  subject?: string;
  message?: string;
  description?: string;
  propertyTitle?: string;
  title?: string;
  propertyType?: string;
  locality?: string;
  address?: string;
  price?: string | number;
  area?: string | number;
  bhk?: string | number;
  status?: string;
  createdAt?: { seconds: number } | string | null;
  date?: { seconds: number } | string | null;
  [key: string]: unknown;
}

type Timestamp = { seconds: number } | string | null | undefined;

// Returns the first truthy value from the listed keys on an inquiry document
function pick(inquiry: Inquiry, ...keys: string[]): string {
  for (const key of keys) {
    const val = inquiry[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function getTimestamp(inquiry: Inquiry): number {
  const ts = inquiry.createdAt ?? inquiry.date;
  if (!ts) return 0;
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) return ts.seconds;
  return 0;
}

function formatDate(ts: Timestamp): string {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return '';
}

function formatPrice(val: string | number): string {
  const num = Number(val) || 0;
  if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(2)} Cr`;
  if (num >= 100_000)    return `₹${(num / 100_000).toFixed(1)} Lakh`;
  if (num >= 1_000)      return `₹${(num / 1_000).toFixed(0)}K`;
  return `₹${num}`;
}

function buildWhatsAppUrl(inquiry: Inquiry): string {
  const name    = pick(inquiry, 'name', 'ownerName', 'fullName') || 'Unknown';
  const phone   = pick(inquiry, 'phone', 'ownerPhone', 'mobile');
  const subject = pick(inquiry, 'source', 'subject', 'propertyType');
  const msg =
    `Hello, I received an inquiry from *${name}*.\n` +
    (phone   ? `Phone: ${phone}\n`   : '') +
    (subject ? `Subject: ${subject}` : '');
  return `https://wa.me/919837029310?text=${encodeURIComponent(msg)}`;
}

function isPending(status: string): boolean {
  return !['contacted', 'rejected'].includes(status);
}

type BadgeConfig = { label: string; dot: string; bg: string; text: string; border: string };

function statusBadge(status: string): BadgeConfig {
  switch (status) {
    case 'contacted':
      return { label: 'Contacted', dot: 'bg-sky-500',    bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-200'    };
    case 'rejected':
      return { label: 'Rejected',  dot: 'bg-red-500',    bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200'    };
    default:
      return { label: 'Pending',   dot: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  }
}

// --- Modal ---

function InquiryModal({ inquiry, onClose }: { inquiry: Inquiry; onClose: () => void }) {
  const name = pick(inquiry, 'name', 'ownerName', 'fullName');

  // Each row: label, resolved value, whether it spans both columns
  const rows: { label: string; value: string; wide?: boolean }[] = [];

  const add = (label: string, value: string, wide = false) => {
    if (value) rows.push({ label, value, wide });
  };

  add('Name',           pick(inquiry, 'name', 'ownerName', 'fullName'));
  add('Phone',          pick(inquiry, 'phone', 'ownerPhone', 'mobile'));
  add('Email',          pick(inquiry, 'email'));
  add('Subject',        pick(inquiry, 'subject'));
  add('Property Title', pick(inquiry, 'propertyTitle', 'title'));
  add('Property Type',  pick(inquiry, 'propertyType'));
  add('Locality',       pick(inquiry, 'locality'));
  add('Address',        pick(inquiry, 'address'), true);
  add('Price',          inquiry.price != null ? formatPrice(inquiry.price) : '');
  add('Area (sq ft)',   pick(inquiry, 'area'));
  add('BHK',            pick(inquiry, 'bhk'));
  add('Status',         pick(inquiry, 'status'));
  add('Message',        pick(inquiry, 'message', 'description'), true);
  add('Created Date',   formatDate(inquiry.createdAt ?? inquiry.date));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Inquiry Details</h2>
            {name && <p className="text-xs text-slate-500 mt-0.5">{name}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fields — only renders rows that have a value */}
        <div className="px-6 py-4 grid grid-cols-2 gap-4">
          {rows.length === 0 ? (
            <p className="col-span-2 text-sm text-slate-400">No details available.</p>
          ) : (
            rows.map(({ label, value, wide }) => (
              <div
                key={label}
                className={`flex flex-col gap-0.5 ${wide ? 'col-span-2' : ''}`}
              >
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-sm text-slate-700 font-medium break-words">{value}</span>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Page ---

export const Inquiries: React.FC = () => {
  const [inquiries, setInquiries]       = useState<Inquiry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [viewingInquiry, setViewing]    = useState<Inquiry | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Inquiry, 'id'>) }))
        .sort((a, b) => getTimestamp(b) - getTimestamp(a));
      setInquiries(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const rejectInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this inquiry?')) return;
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: 'rejected' });
    } catch {
      showToast('Failed to reject inquiry.', 'error');
    }
  };

  const undoReject = async (id: string) => {
    if (!window.confirm('Move this back to pending?')) return;
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: 'pending' });
    } catch {
      showToast('Failed to undo rejection.', 'error');
    }
  };

  const markContacted = async (id: string) => {
    if (!window.confirm('Mark this inquiry as contacted?')) return;
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: 'contacted' });
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!window.confirm('Permanently delete this inquiry? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch {
      showToast('Failed to delete inquiry.', 'error');
    }
  };

  const pendingCount = inquiries.filter((i) => isPending(i.status ?? '')).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage incoming inquiries in real time</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <span className="animate-spin mr-2">⏳</span> Loading inquiries…
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Inbox className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">No inquiries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Source / Subject</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry) => {
                  const status    = inquiry.status ?? 'pending';
                  const pending   = isPending(status);
                  const isRejected = status === 'rejected';
                  const badge     = statusBadge(status);

                  const displayName    = pick(inquiry, 'name', 'ownerName', 'fullName') || '—';
                  const displayPhone   = pick(inquiry, 'phone', 'ownerPhone', 'mobile') || '—';
                  const displaySubject = pick(inquiry, 'source', 'subject', 'propertyType', 'title') || '—';
                  const displayDate    = formatDate(inquiry.createdAt ?? inquiry.date) || '—';

                  return (
                    <tr key={inquiry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{displayName}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{displayPhone}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{displaySubject}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{displayDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button
                            onClick={() => setViewing(inquiry)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={buildWhatsAppUrl(inquiry)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {pending && (
                            <>
                              {/* Reject */}
                              <button
                                onClick={() => rejectInquiry(inquiry.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>

                              {/* Mark Contacted */}
                              <button
                                onClick={() => markContacted(inquiry.id)}
                                className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                                title="Mark Contacted"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Undo Reject */}
                          {isRejected && (
                            <button
                              onClick={() => undoReject(inquiry.id)}
                              className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                              title="Undo Reject"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => deleteInquiry(inquiry.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingInquiry && (
        <InquiryModal inquiry={viewingInquiry} onClose={() => setViewing(null)} />
      )}
    </div>
  );
};
