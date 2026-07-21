/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
  Calendar,
  User
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';

export const Blogs: React.FC = () => {
  const { blogs: rawBlogs, deleteBlog } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  // `blogs` comes from a Firestore onSnapshot listener in DataProvider, so this
  // just applies an immediate optimistic override until that listener catches up.
  const [publishedOverrides, setPublishedOverrides] = useState<Record<string, boolean>>({});

  const blogs = rawBlogs.map((b) => ({
    ...b,
    published: publishedOverrides[b.id] ?? b.published
  }));

  // DIAGNOSTIC: log every doc.id as fetched, to confirm it's the real Firestore ID
  console.log('[Blogs] fetched IDs:', rawBlogs.map((b) => ({ id: b.id, title: b.title, published: b.published })));

  const handleTogglePublish = async (blogId: string, currentPublished: boolean) => {
    const auth = getAuth();
    console.log('[togglePublish] blogId:', blogId, 'currentPublished:', currentPublished);
    console.log('[togglePublish] Current user:', auth.currentUser);
    console.log('[togglePublish] User UID:', auth.currentUser?.uid);

    setTogglingId(blogId);
    try {
      const blogRef = doc(db, 'blogs', blogId);
      await updateDoc(blogRef, { published: !currentPublished });
      setPublishedOverrides((prev) => ({ ...prev, [blogId]: !currentPublished }));
      alert(!currentPublished ? 'Blog published!' : 'Blog unpublished!');
    } catch (error: any) {
      console.error('[togglePublish] FULL error object:', error);
      console.error('[togglePublish] error.code:', error?.code);
      console.error('[togglePublish] error.message:', error?.message);
      alert('Failed to update: ' + error.message + (error.code ? ` (code: ${error.code})` : ''));
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'published' && b.published) ||
      (filter === 'draft' && !b.published);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlog(deleteTarget);
      showToast('Blog post deleted.', 'success');
    } catch {
      showToast('Failed to delete blog post.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0ea5e9]/10 rounded-xl">
            <BookOpen className="w-6 h-6 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A1F44]">Blog Posts</h1>
            <p className="text-sm text-slate-500 mt-0.5">{blogs.length} total posts</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/blogs/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded-xl shadow-sm shadow-[#0ea5e9]/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0A1F44] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl capitalize transition-all ${
                filter === f
                  ? 'bg-[#0A1F44] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No blog posts found</p>
          <p className="text-slate-400 text-sm mt-1">
            {blogs.length === 0
              ? 'Create your first blog post to get started.'
              : 'Try adjusting your search or filter.'}
          </p>
          {blogs.length === 0 && (
            <button
              onClick={() => navigate('/blogs/new')}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white text-sm font-semibold rounded-xl transition-colors hover:bg-[#0284c7]"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Post</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((blog) => (
                <tr key={blog.id} className="group hover:bg-slate-50/70 transition-colors">
                  {/* Post column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0A1F44] truncate max-w-[220px]">{blog.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[220px] mt-0.5">/{blog.slug}</p>
                      </div>
                    </div>
                  </td>
                  {/* Author */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {blog.author}
                    </div>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(blog.createdAt)}
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          blog.published
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                      <button
                        type="button"
                        disabled={togglingId === blog.id}
                        onClick={() => handleTogglePublish(blog.id, blog.published)}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-wait"
                      >
                        {togglingId === blog.id ? 'Saving…' : blog.published ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(blog.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
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

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0A1F44]">Delete Post</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              This will permanently delete the blog post. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
