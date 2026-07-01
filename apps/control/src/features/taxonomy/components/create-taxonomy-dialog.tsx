"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, X, ChevronDown } from "lucide-react";
import {
  createTaxonomyAction,
  updateTaxonomyAction,
} from "../actions/taxonomy-actions";
import { SlugField, generateSlug } from "./slug-field";
import { ParentPicker } from "./parent-picker";
import {
  TAX_KIND_LABELS,
  TAX_VISIBILITY_LABELS,
} from "../constants";
import type { TaxKind, TaxVisibility, TaxonomyNode } from "../types";

interface CreateTaxonomyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (node: TaxonomyNode) => void;
  defaultKind?: TaxKind;
  /** When provided, pre-fills the edit form */
  editNode?: TaxonomyNode | null;
}

const KIND_OPTIONS = Object.entries(TAX_KIND_LABELS) as [TaxKind, string][];
const VISIBILITY_OPTIONS = Object.entries(TAX_VISIBILITY_LABELS) as [TaxVisibility, string][];

export function CreateTaxonomyDialog({
  open,
  onClose,
  onSuccess,
  defaultKind = "CATEGORY",
  editNode,
}: CreateTaxonomyDialogProps) {
  const isEditing = !!editNode;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSeo, setShowSeo] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [kind, setKind] = useState<TaxKind>(defaultKind);
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [visibility, setVisibility] = useState<TaxVisibility>("PUBLIC");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editNode) {
      setName(editNode.name);
      setSlug(editNode.slug);
      setSlugManuallyEdited(true);
      setKind(editNode.kind);
      setDescription(editNode.description ?? "");
      setCoverImage(editNode.coverImage ?? "");
      setBannerImage(editNode.bannerImage ?? "");
      setIcon(editNode.icon ?? "");
      setParentId(editNode.parentId);
      setSortOrder(editNode.sortOrder);
      setVisibility(editNode.visibility);
      setSeoTitle(editNode.seoTitle ?? "");
      setSeoDesc(editNode.seoDesc ?? "");
      setSeoKeywords(editNode.seoKeywords.join(", "));
    } else {
      // Reset on new
      setName(""); setSlug(""); setSlugManuallyEdited(false);
      setKind(defaultKind); setDescription(""); setCoverImage("");
      setBannerImage(""); setIcon(""); setParentId(null);
      setSortOrder(0); setVisibility("PUBLIC");
      setSeoTitle(""); setSeoDesc(""); setSeoKeywords("");
    }
    setError(null);
    setValidationErrors({});
  }, [editNode, open, defaultKind]);

  // Auto-generate slug from name (unless manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(generateSlug(name));
    }
  }, [name, slugManuallyEdited]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      kind,
      description: description.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      bannerImage: bannerImage.trim() || undefined,
      icon: icon.trim() || undefined,
      parentId: parentId || undefined,
      sortOrder,
      visibility,
      seoTitle: seoTitle.trim() || undefined,
      seoDesc: seoDesc.trim() || undefined,
      seoKeywords: seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      const res = isEditing
        ? await updateTaxonomyAction(editNode!.id, payload)
        : await createTaxonomyAction(payload);

      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        if (res.error.code === "INVALID_PAYLOAD" && res.error.details) {
          const fieldErrors: Record<string, string> = {};
          for (const [field, msgs] of Object.entries(res.error.details)) {
            fieldErrors[field] = (msgs as string[])[0];
          }
          setValidationErrors(fieldErrors);
        } else {
          setError(res.error.message);
        }
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-dialog-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-panel border border-muted rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-panel z-10 flex items-center justify-between px-6 py-4 border-b border-muted">
          <div>
            <h2 id="create-dialog-title" className="text-sm font-semibold text-primary">
              {isEditing ? `Edit: ${editNode?.name}` : `New ${TAX_KIND_LABELS[kind]}`}
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              {isEditing ? "Update taxonomy node details" : "Create a new taxonomy node"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Kind selector (hidden when editing) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary uppercase tracking-wider">
                Kind
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {KIND_OPTIONS.map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`
                      h-8 px-3 text-xs font-medium rounded-md border transition-all duration-150
                      ${kind === k
                        ? "bg-gold/15 border-gold/40 text-gold"
                        : "bg-transparent border-muted text-secondary hover:text-primary hover:border-gold/20"
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <Field label="Name" error={validationErrors.name} required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luxury Living"
              className={inputClass(!!validationErrors.name)}
              required
            />
          </Field>

          {/* Slug */}
          <SlugField
            value={slug}
            onChange={(v) => { setSlug(v); setSlugManuallyEdited(true); }}
            locked={isEditing && !!editNode?.slugLocked}
            isPublished={isEditing && editNode?.status === "PUBLISHED"}
            error={validationErrors.slug}
          />

          {/* Description */}
          <Field label="Description" error={validationErrors.description}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description visible on storefront…"
              className={`${inputClass(false)} h-auto py-2 resize-none`}
            />
          </Field>

          {/* Cover image */}
          <Field label="Cover Image URL" error={validationErrors.coverImage}>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
              className={inputClass(!!validationErrors.coverImage)}
            />
          </Field>

          {/* Banner image (collections only) */}
          {(kind === "COLLECTION" || isEditing) && (
            <Field label="Banner Image URL" error={validationErrors.bannerImage}>
              <input
                type="url"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="https://… (wide banner for collections)"
                className={inputClass(!!validationErrors.bannerImage)}
              />
            </Field>
          )}

          {/* Icon */}
          <Field label="Icon" error={validationErrors.icon}>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="icon-name or URL"
              className={inputClass(!!validationErrors.icon)}
            />
          </Field>

          {/* Parent + Sort order — 2 column */}
          <div className="grid grid-cols-2 gap-4">
            <ParentPicker
              value={parentId}
              onChange={setParentId}
              kind={kind}
              excludeId={editNode?.id}
              label="Parent node"
            />
            <Field label="Sort Order" error={validationErrors.sortOrder}>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={0}
                step={1}
                className={inputClass(!!validationErrors.sortOrder)}
              />
            </Field>
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as TaxVisibility)}
              className={inputClass(false)}
            >
              {VISIBILITY_OPTIONS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* SEO section (collapsible) */}
          <div className="border border-muted rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSeo((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-secondary hover:text-primary transition-colors"
            >
              SEO Metadata
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showSeo ? "rotate-180" : ""}`}
              />
            </button>
            {showSeo && (
              <div className="px-4 pb-4 space-y-4 border-t border-muted">
                <Field label="SEO Title" className="mt-4">
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Overrides name for search engines"
                    className={inputClass(false)}
                    maxLength={200}
                  />
                </Field>
                <Field label="SEO Description">
                  <textarea
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    rows={2}
                    placeholder="Meta description (max 500 chars)"
                    className={`${inputClass(false)} h-auto py-2 resize-none`}
                    maxLength={500}
                  />
                </Field>
                <Field label="SEO Keywords (comma-separated)">
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="luxury, furniture, interiors"
                    className={inputClass(false)}
                  />
                </Field>
              </div>
            )}
          </div>

          {/* General error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-8 px-4 text-xs font-medium bg-transparent border border-muted rounded-md text-secondary hover:text-primary transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="
                flex items-center gap-2 h-8 px-4 text-xs font-medium
                bg-gold/10 border border-gold/30 rounded-md
                text-gold hover:bg-gold/20
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {isPending ? "Saving…" : isEditing ? "Save changes" : `Create ${TAX_KIND_LABELS[kind]}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return `
    w-full h-8 px-3 text-xs
    bg-sidebar border rounded-md
    text-primary placeholder:text-secondary
    focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50
    transition-all duration-150
    ${hasError ? "border-red-500/50" : "border-muted"}
  `;
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, error, required, children, className = "" }: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-medium text-secondary uppercase tracking-wider">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
