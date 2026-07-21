/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  CloudUpload,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon
} from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';
import { LocationCategory } from '../types';

interface FormState {
  name: string;
  coverImage: string;
  projectsCount: number;
  displayOrder: number;
  active: boolean;
  associatedProjects: string[];
}

const emptyForm = (): FormState => ({
  name: '',
  coverImage: '',
  projectsCount: 0,
  displayOrder: 0,
  active: true,
  associatedProjects: []
});

export const LocationCategories: React.FC = () => {
  const { locationCategories, properties, addLocationCategory, updateLocationCategory, deleteLocationCategory } = useData();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unique project names from the properties collection
  const allProjectNames = useMemo(() => {
    const names = properties
      .map((p) => p.projectName?.trim())
      .filter((n): n is string => !!n);
    return Array.from(new Set(names)).sort();
  }, [properties]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (cat: LocationCategory) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      coverImage: cat.coverImage,
      projectsCount: cat.projectsCount,
      displayOrder: cat.displayOrder,
      active: cat.active,
      associatedProjects: cat.associatedProjects ?? []
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isUploading || isSaving) return;
    setModalOpen(false);
    setEditId(null);
    setForm(emptyForm());
  };

  const toggleProject = (name: string) => {
    setForm((f) => {
      const current = f.associatedProjects;
      const next = current.includes(name)
        ? current.filter((p) => p !== name)
        : [...current, name];
      return { ...f, associatedProjects: next, projectsCount: next.length };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be under 10 MB.', 'warning');
      return;
    }
    const path = `locationCategories/${Date.now()}-${file.name}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);

    setIsUploading(true);
    setUploadProgress(0);

    task.on(
      'state_changed',
      (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error(err);
        showToast('Upload failed. Check Firebase Storage rules.', 'error');
        setIsUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setForm((f) => ({ ...f, coverImage: url }));
        showToast('Image uploaded!', 'success');
        setIsUploading(false);
      }
    );
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Location name is required.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      if (editId) {
        await updateLocationCategory(editId, form);
        showToast('Location category updated.', 'success');
      } else {
        await addLocationCategory(form);
        showToast('Location category added.', 'success');
      }
      closeModal();
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLocationCategory(deleteTarget);
      showToast('Location category deleted.', 'success');
    } catch {
      showToast('Failed to delete.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (cat: LocationCategory) => {
    try {
      await updateLocationCategory(cat.id, { active: !cat.active });
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0ea5e9]/10 rounded-xl">
            <MapPin className="w-6 h-6 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A1F44]">Location Categories</h1>
            <p className="text-sm text-slate-500 mt-0.5">{locationCategories.length} location{locationCategories.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded-xl shadow-sm shadow-[#0ea5e9]/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* List */}
      {locationCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No location categories yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first location to get started.</p>
          <button
            onClick={openAdd}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white text-sm font-semibold rounded-xl transition-colors hover:bg-[#0284c7]"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Projects</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Order</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {locationCategories.map((cat) => (
                <tr key={cat.id} className="group hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cat.coverImage ? (
                        <img
                          src={cat.coverImage}
                          alt={cat.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#0A1F44]">{cat.name}</p>
                        {cat.associatedProjects && cat.associatedProjects.length > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {cat.associatedProjects.slice(0, 2).join(', ')}
                            {cat.associatedProjects.length > 2 && ` +${cat.associatedProjects.length - 2} more`}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{cat.projectsCount}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-600">{cat.displayOrder}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className="flex items-center gap-1.5 transition-colors"
                      title={cat.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                    >
                      {cat.active ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-600">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-400">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat.id)}
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

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0ea5e9]/10 rounded-xl">
                  <MapPin className="w-4.5 h-4.5 text-[#0ea5e9]" />
                </div>
                <h2 className="text-base font-bold text-[#0A1F44]">
                  {editId ? 'Edit Location' : 'Add Location'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {/* Location name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Dayalbagh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0A1F44] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cover Image</label>
                {form.coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                    <img
                      src={form.coverImage}
                      alt="Cover"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white shadow-sm transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5 transition-all disabled:opacity-60"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
                        <span className="text-xs text-slate-500">Uploading… {uploadProgress}%</span>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0ea5e9] rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-6 h-6 text-slate-400" />
                        <span className="text-xs text-slate-500">Click to upload image</span>
                        <span className="text-[11px] text-slate-400">PNG, JPG up to 10 MB</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Associated Projects */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Associated Projects
                    {form.associatedProjects.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-[#0ea5e9] text-white rounded-full">
                        {form.associatedProjects.length} selected
                      </span>
                    )}
                  </label>
                </div>

                {allProjectNames.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl border border-slate-100">
                    No projects found in the properties collection.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-44 overflow-y-auto">
                    {allProjectNames.map((name) => {
                      const checked = form.associatedProjects.includes(name);
                      return (
                        <label
                          key={name}
                          className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors border-b border-slate-100 last:border-0 ${
                            checked ? 'bg-sky-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProject(name)}
                            className="w-4 h-4 rounded border-slate-300 accent-[#0ea5e9] flex-shrink-0"
                          />
                          <span className={`text-sm ${checked ? 'font-semibold text-[#0A1F44]' : 'text-slate-600'}`}>
                            {name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {form.associatedProjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {form.associatedProjects.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0ea5e9]/10 text-[#0ea5e9] text-[11px] font-semibold rounded-full"
                      >
                        {p}
                        <button
                          type="button"
                          onClick={() => toggleProject(p)}
                          className="hover:text-[#0284c7] leading-none"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Number of Projects & Display Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Number of Projects</label>
                  <input
                    type="number"
                    min={0}
                    value={form.projectsCount}
                    onChange={(e) => setForm((f) => ({ ...f, projectsCount: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    Auto-calculated from selected projects, or enter manually
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={form.displayOrder}
                    onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-[#0A1F44]">Active</p>
                  <p className="text-xs text-slate-400 mt-0.5">Show this location on the homepage</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className="transition-colors"
                >
                  {form.active ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded-xl transition-colors disabled:opacity-60"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving…' : editId ? 'Save Changes' : 'Add Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0A1F44]">Delete Location</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              This will permanently delete the location category. This action cannot be undone.
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
