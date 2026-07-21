/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  BookOpen,
  ArrowLeft,
  CloudUpload,
  X,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Heading2,
  Heading3
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useData } from '../components/DataProvider';
import { useToast } from '../components/Toast';

interface BlogFormInputs {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const BlogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { blogs, addBlog, updateBlog } = useData();
  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BlogFormInputs>({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      coverImage: '',
      author: 'BM Properties'
    }
  });

  const watchedTitle = watch('title');
  const watchedCoverImage = watch('coverImage');

  // TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[280px] px-4 py-3 text-[#0A1F44] focus:outline-none'
      }
    }
  });

  // Load existing post in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const post = blogs.find((b) => b.id === id);
      if (post) {
        setValue('title', post.title);
        setValue('slug', post.slug);
        setValue('excerpt', post.excerpt);
        setValue('coverImage', post.coverImage);
        setValue('author', post.author);
        setSlugManuallyEdited(true);
        if (editor && post.content) {
          editor.commands.setContent(post.content);
        }
      }
    }
  }, [isEdit, id, blogs, editor, setValue]);

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited && watchedTitle) {
      setValue('slug', slugify(watchedTitle));
    }
  }, [watchedTitle, slugManuallyEdited, setValue]);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be under 10 MB.', 'warning');
      return;
    }
    const path = `blogs/${Date.now()}-${file.name}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);

    setIsUploadingCover(true);
    setCoverUploadProgress(0);

    task.on(
      'state_changed',
      (snap) => setCoverUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error(err);
        showToast('Upload failed. Check Firebase Storage rules.', 'error');
        setIsUploadingCover(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setValue('coverImage', url);
        showToast('Cover image uploaded!', 'success');
        setIsUploadingCover(false);
      }
    );
  };

  const onSubmit = async (data: BlogFormInputs, published: boolean) => {
    const content = editor?.getHTML() ?? '';
    if (!content || content === '<p></p>') {
      showToast('Content cannot be empty.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      if (isEdit && id) {
        await updateBlog(id, { ...data, published, content, updatedAt: now });
        showToast(published ? 'Blog post published!' : 'Blog post saved as draft.', 'success');
      } else {
        await addBlog({ ...data, published, content, createdAt: now, updatedAt: now });
        showToast(published ? 'Blog post published!' : 'Blog post saved as draft.', 'success');
      }
      navigate('/blogs');
    } catch (err) {
      console.error(err);
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => onSubmit(data, false));
  const handlePublishBlog = handleSubmit((data) => onSubmit(data, true));

  if (!editor) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/blogs')}
          className="p-2 rounded-xl text-slate-500 hover:text-[#0A1F44] hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0ea5e9]/10 rounded-xl">
            <BookOpen className="w-6 h-6 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A1F44]">
              {isEdit ? 'Edit Post' : 'New Blog Post'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? 'Update content and settings' : 'Create and publish a new post'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#0A1F44] uppercase tracking-wide">Post Details</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter post title…"
                  className={`w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-[#0A1F44] border focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 flex-shrink-0">/blog/</span>
                  <input
                    type="text"
                    placeholder="url-friendly-slug"
                    className={`flex-1 px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-[#0A1F44] border focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-mono ${errors.slug ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('slug', {
                      required: 'Slug is required',
                      pattern: { value: /^[a-z0-9-]+$/, message: 'Only lowercase letters, numbers, and hyphens' }
                    })}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setValue('slug', slugify(e.target.value), { shouldValidate: true });
                    }}
                  />
                </div>
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Short 1–2 sentence summary shown on cards and used for SEO…"
                  className={`w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-[#0A1F44] border resize-none focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all ${errors.excerpt ? 'border-red-400' : 'border-slate-200'}`}
                  {...register('excerpt', { required: 'Excerpt is required', maxLength: { value: 300, message: 'Max 300 characters' } })}
                />
                {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt.message}</p>}
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-[#0A1F44] uppercase tracking-wide">Content</h2>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50/60">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive('bold')}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive('italic')}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  active={editor.isActive('strike')}
                  title="Strikethrough"
                >
                  <Strikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  active={editor.isActive('code')}
                  title="Inline Code"
                >
                  <Code className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  active={editor.isActive('heading', { level: 2 })}
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  active={editor.isActive('heading', { level: 3 })}
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  active={editor.isActive('bulletList')}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  active={editor.isActive('orderedList')}
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  active={editor.isActive('blockquote')}
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  active={false}
                  title="Horizontal Rule"
                >
                  <Minus className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  active={false}
                  title="Undo"
                  disabled={!editor.can().undo()}
                >
                  <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  active={false}
                  title="Redo"
                  disabled={!editor.can().redo()}
                >
                  <Redo className="w-4 h-4" />
                </ToolbarButton>
              </div>

              {/* Editor area */}
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Sidebar settings column */}
          <div className="space-y-5">

            {/* Cover image */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#0A1F44] uppercase tracking-wide">Cover Image</h2>

              {watchedCoverImage ? (
                <div className="relative">
                  <img
                    src={watchedCoverImage}
                    alt="Cover"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('coverImage', '')}
                    className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-lg shadow text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-slate-200 hover:border-[#0ea5e9] rounded-xl text-slate-400 hover:text-[#0ea5e9] transition-colors disabled:opacity-60"
                >
                  <CloudUpload className="w-7 h-7" />
                  <span className="text-sm font-medium">
                    {isUploadingCover ? `Uploading… ${coverUploadProgress}%` : 'Upload cover image'}
                  </span>
                  <span className="text-xs">PNG, JPG up to 10 MB</span>
                </button>
              )}

              {isUploadingCover && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#0ea5e9] h-full rounded-full transition-all"
                    style={{ width: `${coverUploadProgress}%` }}
                  />
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />

              {/* Or paste URL */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Or paste image URL</label>
                <input
                  type="url"
                  placeholder="https://…"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#0A1F44] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                  {...register('coverImage')}
                />
              </div>
            </div>

            {/* Author */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#0A1F44] uppercase tracking-wide">Author</h2>
              <input
                type="text"
                placeholder="Author name"
                className={`w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-[#0A1F44] border focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all ${errors.author ? 'border-red-400' : 'border-slate-200'}`}
                {...register('author', { required: 'Author is required' })}
              />
              {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveDraft}
            className="flex-1 px-4 py-3 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublishBlog}
            className="flex-1 px-4 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-[#0ea5e9]/20"
          >
            {isSaving ? 'Publishing…' : 'Publish Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Small toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
      active
        ? 'bg-[#0ea5e9] text-white'
        : 'text-slate-600 hover:bg-slate-200 hover:text-[#0A1F44]'
    }`}
  >
    {children}
  </button>
);
