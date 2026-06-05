/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Star, Trash2, CheckCircle, XCircle, StarOff } from 'lucide-react';
import { useToast } from '../components/Toast';

interface Review {
  id: string;
  name: string;
  email: string;
  propertyTitle?: string;
  rating: number;
  reviewText: string;
  status?: string;
  createdAt?: { seconds: number } | string | null;
}

type Timestamp = { seconds: number } | string | null | undefined;

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

type BadgeConfig = { label: string; dot: string; bg: string; text: string; border: string };

function statusBadge(status: string): BadgeConfig {
  switch (status) {
    case 'approved':
      return { label: 'Approved', dot: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'rejected':
      return { label: 'Rejected', dot: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
    default:
      return { label: 'Pending', dot: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
        />
      ))}
      <span className="ml-1 text-xs text-slate-500">{rating}/5</span>
    </div>
  );
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'reviews'),
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }))
          .sort((a, b) => {
            const getTs = (r: Review) => {
              if (!r.createdAt) return 0;
              if (typeof r.createdAt === 'object' && 'seconds' in r.createdAt) return r.createdAt.seconds;
              return 0;
            };
            return getTs(b) - getTs(a);
          });
        setReviews(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('[Reviews] Firestore error:', err.code, err.message);
        setError(`Could not load reviews: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const approveReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'approved' });
      showToast('Review approved', 'success');
    } catch {
      showToast('Failed to approve review', 'error');
    }
  };

  const rejectReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'rejected' });
      showToast('Review rejected', 'success');
    } catch {
      showToast('Failed to reject review', 'error');
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Permanently delete this review? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      showToast('Review deleted', 'success');
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  const pendingCount = reviews.filter((r) => (r.status ?? 'pending') !== 'approved' && (r.status ?? 'pending') !== 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reviews</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage property reviews submitted by users
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
            <span className="animate-spin mr-2">⏳</span> Loading reviews…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-red-500 gap-3">
            <p className="text-sm font-semibold">Failed to load reviews</p>
            <p className="text-xs text-slate-400 max-w-sm text-center">{error}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <StarOff className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">No reviews yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Review</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((review) => {
                  const status = review.status ?? 'pending';
                  const badge = statusBadge(status);
                  const isPending = status !== 'approved' && status !== 'rejected';
                  const isApproved = status === 'approved';

                  return (
                    <tr key={review.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                        {review.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {review.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs whitespace-nowrap max-w-[180px]">
                        <span className="line-clamp-1 block">{review.propertyTitle || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StarRating rating={review.rating || 0} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[260px]">
                        <span className="line-clamp-2 block">{review.reviewText || '—'}</span>
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
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {isPending && (
                            <>
                              <button
                                onClick={() => approveReview(review.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-semibold"
                                title="Approve"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectReview(review.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors text-xs font-semibold"
                                title="Reject"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          {isApproved && (
                            <button
                              onClick={() => rejectReview(review.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors text-xs font-semibold"
                              title="Reject"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          )}
                          {status === 'rejected' && (
                            <button
                              onClick={() => approveReview(review.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-semibold"
                              title="Approve"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
};
