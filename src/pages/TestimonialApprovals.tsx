/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  CheckCircle,
  XCircle,
  Inbox,
  Star,
  MapPin,
  User,
  Home,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface Submission {
  id: string;
  name?: string;
  location?: string;
  rating?: number;
  reviewText?: string;
  propertyPurchased?: string;
  photoUrl?: string;
  status?: string;
  createdAt?: { seconds: number } | string | null;
}

function formatDate(ts: { seconds: number } | string | null | undefined): string {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  if (typeof ts === 'object' && 'seconds' in ts) {
    return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return '';
}

export const TestimonialApprovals: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, 'testimonial_submissions'),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, 'id'>) }))
        .sort((a, b) => {
          const getTs = (s: Submission) => {
            if (!s.createdAt) return 0;
            if (typeof s.createdAt === 'object' && 'seconds' in s.createdAt)
              return s.createdAt.seconds;
            return 0;
          };
          return getTs(b) - getTs(a);
        });
      setSubmissions(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const approveSubmission = async (sub: Submission) => {
    try {
      // Copy to testimonials collection as an approved text testimonial
      const parts = (sub.name || 'A').trim().split(/\s+/);
      const initials = parts
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

      await addDoc(collection(db, 'testimonials'), {
        testimonialType: 'text',
        customerName: sub.name || '',
        location: sub.location || '',
        reviewText: sub.reviewText || '',
        initials,
        avatarColor: 'navy',
        rating: sub.rating ?? 5,
        status: 'approved',
      });

      // Remove from submissions
      await deleteDoc(doc(db, 'testimonial_submissions', sub.id));
      showToast('Testimonial approved and published!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to approve submission.', 'error');
    }
  };

  const rejectSubmission = async (id: string) => {
    if (!window.confirm('Reject and delete this testimonial submission?')) return;
    try {
      await deleteDoc(doc(db, 'testimonial_submissions', id));
      showToast('Submission rejected and removed.', 'success');
    } catch {
      showToast('Failed to reject submission.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Testimonial Approvals</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and approve testimonials submitted by website visitors
          </p>
        </div>
        {submissions.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            {submissions.length} Pending
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <span className="animate-spin mr-2">⏳</span> Loading submissions…
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Inbox className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">No pending submissions</p>
            <p className="text-xs text-slate-400">
              Visitor testimonial submissions will appear here for review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-[#0A1F44] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 self-start">
                  {sub.photoUrl ? (
                    <img
                      src={sub.photoUrl}
                      alt={sub.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-[#0A1F44] text-sm">
                      {sub.name || 'Anonymous'}
                    </span>
                    {sub.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {sub.location}
                      </span>
                    )}
                    {sub.createdAt && (
                      <span className="text-xs text-slate-400 ml-auto">
                        {formatDate(sub.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* Star rating */}
                  {sub.rating != null && (
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i <= (sub.rating ?? 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-slate-500">{sub.rating}/5</span>
                    </div>
                  )}

                  {/* Review text */}
                  {sub.reviewText && (
                    <p className="text-sm text-slate-700 leading-relaxed mb-2 italic">
                      "{sub.reviewText}"
                    </p>
                  )}

                  {/* Property purchased */}
                  {sub.propertyPurchased && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100 w-fit">
                      <Home className="w-3.5 h-3.5 text-[#0ea5e9]" />
                      <span>Property: {sub.propertyPurchased}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
                  <button
                    onClick={() => approveSubmission(sub)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-semibold"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectSubmission(sub.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors text-xs font-semibold"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
