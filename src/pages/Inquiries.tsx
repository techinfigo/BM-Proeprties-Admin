/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { MessageCircle, Trash2, CheckCircle, Inbox, XCircle, RotateCcw, Eye, X, Phone } from 'lucide-react';
import { useToast } from '../components/Toast';

// Field names match what the contact form on the website submits to Firestore
interface Inquiry {
  id: string;
  name: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  createdAt?: { seconds: number } | string | null;
}

type Timestamp = { seconds: number } | string | null | undefined;

function getTimestamp(inquiry: Inquiry): number {
  const ts = inquiry.createdAt;
  if (!ts) return 0;
  if (typeof ts === 'object' && 'seconds' in ts) return ts.seconds;
  return 0;
}

function formatDate(ts: Timestamp): string {
  if (!ts) return '—';
  if (typeof ts === 'string') return ts;
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return '—';
}

function buildWhatsAppUrl(inquiry: Inquiry): string {
  const msg =
    `Hello, I received an inquiry from *${inquiry.name}*.\n` +
    `Phone: ${inquiry.phone}\n` +
    `Subject: ${inquiry.subject}\n` +
    `Message: ${inquiry.message}`;
  return `https://wa.me/919837029310?text=${encodeURIComponent(msg)}`;
}

function isPending(status: string): boolean {
  return !['contacted', 'rejected'].includes(status);
}

type BadgeConfig = { label: string; dot: string; bg: string; text: string; border: string };

function statusBadge(status: string): BadgeConfig {
  switch (status) {
    case 'contacted':
      return { label: 'Contacted', dot: 'bg-sky-500', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' };
    case 'rejected':
      return { label: 'Rejected', dot: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
    default:
      return { label: 'Pending', dot: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  }
}

function InquiryModal({ inquiry, onClose }: { inquiry: Inquiry; onClose: () => void }) {
  const fields: { label: string; value: string | undefined; fullWidth?: boolean }[] = [
    { label: 'Name', value: inquiry.name },
    { label: 'Phone', value: inquiry.phone },
    { label: 'Subject', value: inquiry.subject },
    { label: 'Status', value: inquiry.status },
    { label: 'Message', value: inquiry.message, fullWidth: true },
    { label: 'Created Date', value: formatDate(inquiry.createdAt) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Inquiry Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">{inquiry.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fields Grid */}
        <div className="px-6 py-4 grid grid-cols-2 gap-4">
          {fields.map(({ label, value, fullWidth }) => (
            <div
              key={label}
              className={`flex flex-col gap-0.5 ${fullWidth ? 'col-span-2' : ''}`}
            >
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
              <span className="text-sm text-slate-700 font-medium break-words">{value || '—'}</span>
            </div>
          ))}
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

export const Inquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
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
    } catch (err) {
      showToast('Failed to reject inquiry. Please try again.', 'error');
    }
  };

  const undoReject = async (id: string) => {
    if (!window.confirm('Move this back to pending?')) return;
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: 'pending' });
    } catch (err) {
      showToast('Failed to undo rejection. Please try again.', 'error');
    }
  };

  const markContacted = async (id: string) => {
    if (!window.confirm('Mark this inquiry as contacted?')) return;
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: 'contacted' });
    } catch (err) {
      showToast('Failed to update status. Please try again.', 'error');
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      showToast('Failed to delete inquiry. Please try again.', 'error');
    }
  };

  const pendingCount = inquiries.filter((i) => isPending(i.status)).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage incoming contact inquiries in real time
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Table Card */}
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
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry) => {
                  const pending = isPending(inquiry.status);
                  const isRejected = inquiry.status === 'rejected';
                  const badge = statusBadge(inquiry.status);

                  return (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                        {inquiry.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {inquiry.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                        {inquiry.subject || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {formatDate(inquiry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button
                            onClick={() => setViewingInquiry(inquiry)}
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
        <InquiryModal inquiry={viewingInquiry} onClose={() => setViewingInquiry(null)} />
      )}
    </div>
  );
};
