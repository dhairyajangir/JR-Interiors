"use client";

import React, { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  FormWorkspace,
  FormSection,
  StickyActionBar,
  ValidationSummary,
  DirtyStateGuard,
  PublishChecklist,
  HistoryTimeline,
} from "@jr/ui";
import { CreateProductSchema, UpdateProductSchema } from "../validators/product";
import { createProductAction, updateProductAction, deleteProductAction, archiveProductAction, publishProductAction, rejectProductAction } from "../actions/product-actions";
import { MediaPickerModal } from "./media-picker-modal";
import { 
  Plus, Trash, ArrowUp, ArrowDown, ChevronRight, AlertCircle, Info, RotateCcw, 
  HelpCircle, Globe, Twitter, Facebook, Sparkles, X, Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "../../auth/hooks";

interface Finish {
  name: string;
  hex: string;
}

interface ProductFormInput {
  name: string;
  slug: string;
  tagline: string;
  series: string;
  description: string;
  priceCents: number;
  material: string;
  room: "Living" | "Office" | "Dining" | "Bedroom" | "Studio";
  type: "Seating" | "Tables" | "Storage" | "Bedroom" | "Lighting" | "Decor";
  imageUrl: string;
  images: string[];
  mediaId: string;
  mediaIds: string[];
  finishes: Finish[];
  upholstery: string[];
  stock: number;
  categoryId: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    canonical?: string;
    twitterCard?: string;
    robots?: string;
  };
}

interface ProductEditorProps {
  initialProduct?: any; // The Product DB record
  categories: any[];
  collections: any[];
  auditLogs: any[];
}

export function ProductEditor({
  initialProduct,
  categories,
  collections,
  auditLogs,
}: ProductEditorProps) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [activeSection, setActiveSection] = useState("general");
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<"thumbnail" | "images">("images");

  // Permissions Mapping
  const isSeller = currentUser?.role === "SELLER";
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  
  const canWrite = currentUser?.permissions.includes("CATALOG_WRITE") ?? false;
  const canPublish = currentUser?.permissions.includes("CATALOG_APPROVE") ?? false;
  
  const canDelete = isSeller 
    ? (initialProduct?.status !== "PUBLISHED" && canWrite)
    : (currentUser?.permissions.includes("CATALOG_WRITE") ?? false);

  const canArchive = isAdmin; // Sellers cannot archive

  // Default values
  const defaultValues: ProductFormInput = {
    name: initialProduct?.name ?? "",
    slug: initialProduct?.slug ?? "",
    tagline: initialProduct?.tagline ?? "",
    series: initialProduct?.series ?? "",
    description: initialProduct?.description ?? "",
    priceCents: initialProduct?.priceCents ?? 0,
    material: initialProduct?.material ?? "",
    room: (initialProduct?.room as any) ?? "Living",
    type: (initialProduct?.type as any) ?? "Seating",
    imageUrl: initialProduct?.imageUrl ?? "",
    images: initialProduct?.images ?? [],
    mediaId: initialProduct?.mediaId ?? "",
    mediaIds: initialProduct?.mediaIds ?? [],
    finishes: (initialProduct?.finishes as Finish[]) ?? [],
    upholstery: initialProduct?.upholstery ?? [],
    stock: initialProduct?.stock ?? 0,
    categoryId: initialProduct?.categoryId ?? "",
    seo: {
      title: initialProduct?.seo?.title ?? "",
      description: initialProduct?.seo?.description ?? "",
      keywords: initialProduct?.seo?.keywords ?? [],
      ogImage: initialProduct?.seo?.ogImage ?? "",
      canonical: initialProduct?.seo?.canonical ?? "",
      twitterCard: initialProduct?.seo?.twitterCard ?? "summary_large_image",
      robots: initialProduct?.seo?.robots ?? "index, follow",
    },
  };

  // Form Initialization
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(initialProduct ? UpdateProductSchema : CreateProductSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchAll = watch();

  // Undo Stack Architecture
  const [undoStack, setUndoStack] = useState<ProductFormInput[]>([]);
  const lastStateRef = useRef<ProductFormInput>(defaultValues);

  // Undo triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoStack]);

  const handleUndo = () => {
    if (undoStack.length === 0) {
      toast.info("Nothing to undo.");
      return;
    }
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    lastStateRef.current = previous;
    reset(previous);
    toast.success("Undo successful.");
  };

  // Track state for Undo
  const saveStateForUndo = useCallback((state: ProductFormInput) => {
    setUndoStack((prev) => {
      // Don't push duplicates
      if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(state)) {
        return prev;
      }
      return [...prev.slice(-19), lastStateRef.current]; // Cap at 20 undo states
    });
    lastStateRef.current = state;
  }, []);

  // Watch finishes and upholstery fields using useFieldArray
  const { fields: finishFields, append: appendFinish, remove: removeFinish } = useFieldArray({
    control,
    name: "finishes",
  });

  const [upholsteryInput, setUpholsteryInput] = useState("");
  const handleAddUpholstery = () => {
    const clean = upholsteryInput.trim();
    if (!clean) return;
    const current = watchAll.upholstery ?? [];
    if (current.includes(clean)) {
      toast.error("Upholstery option already exists.");
      return;
    }
    saveStateForUndo(watchAll);
    setValue("upholstery", [...current, clean], { shouldDirty: true });
    setUpholsteryInput("");
  };

  const handleRemoveUpholstery = (idx: number) => {
    saveStateForUndo(watchAll);
    const current = watchAll.upholstery ?? [];
    setValue("upholstery", current.filter((_, i) => i !== idx), { shouldDirty: true });
  };

  // Reorder images
  const handleReorderImage = (index: number, direction: "up" | "down") => {
    const currentImages = [...(watchAll.images ?? [])];
    const currentMediaIds = [...(watchAll.mediaIds ?? [])];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= currentImages.length) return;

    saveStateForUndo(watchAll);

    // Swap images
    const tempImage = currentImages[index];
    currentImages[index] = currentImages[targetIdx];
    currentImages[targetIdx] = tempImage;

    // Swap media IDs
    const tempId = currentMediaIds[index];
    currentMediaIds[index] = currentMediaIds[targetIdx];
    currentMediaIds[targetIdx] = tempId;

    setValue("images", currentImages, { shouldDirty: true });
    setValue("mediaIds", currentMediaIds, { shouldDirty: true });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    saveStateForUndo(watchAll);
    const currentImages = [...(watchAll.images ?? [])];
    const currentMediaIds = [...(watchAll.mediaIds ?? [])];

    currentImages.splice(index, 1);
    currentMediaIds.splice(index, 1);

    setValue("images", currentImages, { shouldDirty: true });
    setValue("mediaIds", currentMediaIds, { shouldDirty: true });

    // If primary was deleted, reset primary
    if (watchAll.imageUrl === currentImages[index]) {
      setValue("imageUrl", currentImages[0] ?? "", { shouldDirty: true });
      setValue("mediaId", currentMediaIds[0] ?? "", { shouldDirty: true });
    }
  };

  // Set Primary Image
  const handleSetPrimary = (index: number) => {
    saveStateForUndo(watchAll);
    const currentImages = watchAll.images ?? [];
    const currentMediaIds = watchAll.mediaIds ?? [];
    setValue("imageUrl", currentImages[index] ?? "", { shouldDirty: true });
    setValue("mediaId", currentMediaIds[index] ?? "", { shouldDirty: true });
    toast.success("Primary thumbnail updated.");
  };

  // Debounced Auto-Save Strategy
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performAutoSave = useCallback(async (data: ProductFormInput) => {
    if (!initialProduct) return; // Only auto-save existing products, creation requires explicit action
    setIsSaving(true);
    try {
      const res = await updateProductAction(initialProduct.id, data);
      if (res.success) {
        setIsSaving(false);
      } else {
        console.error("Auto-save failed:", res.error);
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!initialProduct || !isDirty) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave(watchAll);
    }, 2000); // 2 second debounce

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [watchAll, isDirty, initialProduct, performAutoSave]);

  // Explicit Save Draft / Create
  const handleSave = async (data: ProductFormInput) => {
    setIsSaving(true);
    try {
      if (initialProduct) {
        const res = await updateProductAction(initialProduct.id, data);
        if (res.success) {
          toast.success("Product draft updated successfully.");
          reset(data); // Clear dirty state
        } else {
          toast.error(res.error.message || "Failed to update product.");
        }
      } else {
        // Create new
        const res = await createProductAction(data);
        if (res.success) {
          toast.success("Product created successfully as Draft.");
          router.push(`/dashboard/products/${res.data.id}`);
        } else {
          toast.error(res.error.message || "Failed to create product.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit for Review
  const handleSubmitReview = async () => {
    if (!initialProduct) return;
    setIsSaving(true);
    try {
      const res = await updateProductAction(initialProduct.id, {
        ...watchAll,
        status: "PENDING_REVIEW",
      });
      if (res.success) {
        toast.success("Product submitted for moderation review.");
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to submit for review.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish (Admin Only)
  const handlePublish = async () => {
    if (!initialProduct) return;
    setIsSaving(true);
    try {
      const res = await publishProductAction(initialProduct.id);
      if (res.success) {
        toast.success("Product successfully published to showroom catalog.");
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to publish product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Request Changes / Reject (Admin Only)
  const handleReject = async () => {
    if (!initialProduct) return;
    const note = prompt("Please provide a moderation reason for requesting changes on this product (min 5 characters):");
    if (note === null) return;
    if (note.trim().length < 5) {
      toast.error("Changes requested reason must be at least 5 characters long.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await rejectProductAction(initialProduct.id, note);
      if (res.success) {
        toast.success("Moderation feedback logged. Product status updated.");
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to update product status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Archive (Admin Only)
  const handleArchive = async () => {
    if (!initialProduct) return;
    if (!confirm("Are you sure you want to archive this product? This will hide it from the storefront.")) return;
    setIsSaving(true);
    try {
      const res = await archiveProductAction(initialProduct.id);
      if (res.success) {
        toast.success("Product catalog item archived.");
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to archive product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!initialProduct) return;
    if (!confirm("Are you sure you want to delete this product? This database action is permanent and cannot be undone.")) return;
    setIsSaving(true);
    try {
      const res = await deleteProductAction(initialProduct.id);
      if (res.success) {
        toast.success("Product permanently deleted.");
        router.push("/dashboard/products");
      } else {
        toast.error(res.error.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Media Picker Callback
  const handleMediaSelect = (selectedAssets: any[]) => {
    if (mediaPickerMode === "thumbnail") {
      const first = selectedAssets[0];
      if (first) {
        setValue("imageUrl", first.url, { shouldDirty: true });
        setValue("mediaId", first.id, { shouldDirty: true });
      }
    } else {
      // Add multi selection
      const currentImages = [...(watchAll.images ?? [])];
      const currentMediaIds = [...(watchAll.mediaIds ?? [])];

      selectedAssets.forEach((asset) => {
        if (!currentMediaIds.includes(asset.id)) {
          currentImages.push(asset.url);
          currentMediaIds.push(asset.id);
        }
      });

      setValue("images", currentImages, { shouldDirty: true });
      setValue("mediaIds", currentMediaIds, { shouldDirty: true });

      // If no thumbnail set yet, auto set first image
      if (!watchAll.imageUrl && currentImages[0]) {
        setValue("imageUrl", currentImages[0], { shouldDirty: true });
        setValue("mediaId", currentMediaIds[0], { shouldDirty: true });
      }
    }
  };

  // Checklist Items calculation
  const checklistItems = {
    hasName: watchAll.name.trim().length >= 2,
    hasDescription: watchAll.description.trim().length >= 10,
    hasMaterial: watchAll.material.trim().length >= 2,
    hasRoom: !!watchAll.room,
    hasType: !!watchAll.type,
    hasPrimaryImage: !!watchAll.imageUrl,
    hasCategory: !!watchAll.categoryId,
    hasValidPrice: watchAll.priceCents > 0,
    hasValidStock: watchAll.stock >= 0,
    hasSEO: !!watchAll.slug && (watchAll.seo?.title?.trim().length ?? 0) >= 5 && (watchAll.seo?.description?.trim().length ?? 0) >= 10,
  };

  const publishChecklistComplete = Object.values(checklistItems).every(Boolean);

  // Map errors into standard array for ValidationSummary
  const validationErrors = Object.entries(errors).map(([key, val]) => ({
    field: key,
    message: (val as any).message ?? "Field is invalid",
  }));

  // Identify sections with validation errors for sidebar indicator badge
  const sectionsConfig = [
    { id: "general", label: "General Information", hasError: !!(errors.name || errors.slug || errors.tagline || errors.series || errors.description || errors.material || errors.room || errors.type || errors.categoryId) },
    { id: "pricing", label: "Pricing Details", hasError: !!errors.priceCents },
    { id: "inventory", label: "Inventory & Status", hasError: !!errors.stock },
    { id: "media", label: "Showroom Media", hasError: !!(errors.imageUrl || errors.images) },
    { id: "finishes", label: "Finishes Swatches", hasError: !!errors.finishes },
    { id: "upholstery", label: "Upholstery Options", hasError: !!errors.upholstery },
    { id: "seo", label: "SEO Config", hasError: !!errors.seo },
    { id: "publishing", label: "Publishing Moderation" },
    ...(initialProduct ? [{ id: "history", label: "Audit Timeline" }] : []),
  ];

  // Slug auto-generation from name
  useEffect(() => {
    if (!initialProduct && watchAll.name && !watchAll.slug) {
      const generated = watchAll.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [watchAll.name, setValue, initialProduct]);

  // SEO Score calculation (poor rules warning)
  const seoTitleLen = watchAll.seo?.title?.trim().length ?? 0;
  const seoDescLen = watchAll.seo?.description?.trim().length ?? 0;
  const poorSeoWarning = 
    seoTitleLen < 5 || seoTitleLen > 60 || seoDescLen < 15 || seoDescLen > 160;

  // Format price helper
  const formattedPrice = (watchAll.priceCents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
  });

  return (
    <form onSubmit={handleSubmit(handleSave)} className="w-full">
      {/* Dirty state guard warns on navigation */}
      <DirtyStateGuard isDirty={isDirty} />

      <FormWorkspace
        title={initialProduct ? `Edit ${initialProduct.name}` : "Create Catalog Product"}
        subtitle={initialProduct ? `Reference ID: ${initialProduct.referenceId}` : "Draft a premium catalog furniture item"}
        sections={sectionsConfig}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        validationSummary={<ValidationSummary errors={validationErrors} />}
        actionBar={
          <StickyActionBar
            status={initialProduct?.status ?? "DRAFT"}
            isSaving={isSaving}
            isDirty={isDirty}
            canWrite={canWrite}
            canPublish={canPublish}
            canArchive={canArchive}
            canDelete={canDelete}
            onSaveDraft={initialProduct?.status !== "PUBLISHED" ? () => handleSave(watchAll) : undefined}
            onSubmitReview={isSeller ? handleSubmitReview : undefined}
            onPublish={isAdmin ? handlePublish : undefined}
            onReject={isAdmin ? handleReject : undefined}
            onArchive={isAdmin ? handleArchive : undefined}
            onDelete={initialProduct ? handleDelete : undefined}
            onCancel={() => router.push("/dashboard/products")}
            publishChecklistComplete={publishChecklistComplete}
          />
        }
      >
        {/* GENERAL SECTION */}
        {activeSection === "general" && (
          <FormSection id="general" title="General Information" description="Set core metadata, title, and taxonomy folders.">
            {/* Product Name */}
            <div className="flex flex-col space-y-1.5 md:col-span-2">
              <label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Product Name <span className="text-error">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                placeholder="e.g., Artisan Lounge Chair"
              />
              {errors.name && <p className="text-[10px] text-error font-medium">{errors.name.message}</p>}
            </div>

            {/* Slug */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="slug" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                URL Slug <span className="text-error">*</span>
              </label>
              <input
                id="slug"
                type="text"
                disabled={initialProduct?.status === "PUBLISHED"}
                {...register("slug")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze disabled:bg-muted disabled:text-secondary disabled:cursor-not-allowed"
                placeholder="artisan-lounge-chair"
              />
              {initialProduct?.status === "PUBLISHED" && (
                <p className="text-[9px] text-secondary font-light">
                  <Info className="inline h-3 w-3 mr-1" /> Slug is locked for SEO stability once published.
                </p>
              )}
              {errors.slug && <p className="text-[10px] text-error font-medium">{errors.slug.message}</p>}
            </div>

            {/* Series */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="series" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Series / Brand Line
              </label>
              <input
                id="series"
                type="text"
                {...register("series")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                placeholder="e.g., Minimal Living 2026"
              />
              {errors.series && <p className="text-[10px] text-error font-medium">{errors.series.message}</p>}
            </div>

            {/* Tagline */}
            <div className="flex flex-col space-y-1.5 md:col-span-2">
              <label htmlFor="tagline" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Tagline Summary
              </label>
              <input
                id="tagline"
                type="text"
                {...register("tagline")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                placeholder="e.g., Walnut Solid Wood / Pure Ivory Linen"
              />
              {errors.tagline && <p className="text-[10px] text-error font-medium">{errors.tagline.message}</p>}
            </div>

            {/* Description (Rich Text area style) */}
            <div className="flex flex-col space-y-1.5 md:col-span-2">
              <label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Product Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                {...register("description")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze leading-relaxed"
                placeholder="Describe material details, architectural layout dimensions, and handcrafted specifications."
              />
              {errors.description && <p className="text-[10px] text-error font-medium">{errors.description.message}</p>}
            </div>

            {/* Room Category */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="room" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Showroom Room Category <span className="text-error">*</span>
              </label>
              <select
                id="room"
                {...register("room")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze font-medium text-primary"
              >
                <option value="Living">Living</option>
                <option value="Office">Office</option>
                <option value="Dining">Dining</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Studio">Studio</option>
              </select>
              {errors.room && <p className="text-[10px] text-error font-medium">{errors.room.message}</p>}
            </div>

            {/* Furniture Type */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="type" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Furniture Product Type <span className="text-error">*</span>
              </label>
              <select
                id="type"
                {...register("type")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze font-medium text-primary"
              >
                <option value="Seating">Seating</option>
                <option value="Tables">Tables</option>
                <option value="Storage">Storage</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Lighting">Lighting</option>
                <option value="Decor">Decor</option>
              </select>
              {errors.type && <p className="text-[10px] text-error font-medium">{errors.type.message}</p>}
            </div>

            {/* Material */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="material" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Primary Wood/Material <span className="text-error">*</span>
              </label>
              <input
                id="material"
                type="text"
                {...register("material")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                placeholder="e.g., Solid Walnut Oak"
              />
              {errors.material && <p className="text-[10px] text-error font-medium">{errors.material.message}</p>}
            </div>

            {/* Taxonomy Category Link */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="categoryId" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Hierarchy Taxonomy Category <span className="text-error">*</span>
              </label>
              <select
                id="categoryId"
                {...register("categoryId")}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze font-medium text-primary"
              >
                <option value="">Select category folder...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-[10px] text-error font-medium">{errors.categoryId.message}</p>}
            </div>
          </FormSection>
        )}

        {/* PRICING SECTION */}
        {activeSection === "pricing" && (
          <FormSection id="pricing" title="Pricing Details" description="Establish the base pricing structure, tax rules, and discounts.">
            {/* Price cents */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="priceCents" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Base Price (in INR cents/paise) <span className="text-error">*</span>
              </label>
              <input
                id="priceCents"
                type="number"
                {...register("priceCents", { valueAsNumber: true })}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                placeholder="e.g., 4500000 (which is ₹45,000.00)"
              />
              {errors.priceCents && <p className="text-[10px] text-error font-medium">{errors.priceCents.message}</p>}
            </div>

            {/* Price Preview */}
            <div className="bg-base border border-muted rounded-md p-4 flex flex-col justify-center select-none">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Formatted Showroom Price</span>
              <span className="text-2xl font-bold text-bronze mt-1">{formattedPrice}</span>
              <p className="text-[10px] text-secondary font-light mt-1.5">
                Prices are stored as integer cents in database. Inclusive of 18% GST (architecture spec).
              </p>
            </div>
          </FormSection>
        )}

        {/* INVENTORY SECTION */}
        {activeSection === "inventory" && (
          <FormSection id="inventory" title="Inventory & Stock status" description="Assign stocks, monitor thresholds, and view state indicators.">
            {/* Stock count */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="stock" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Units in Stock <span className="text-error">*</span>
              </label>
              <input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
                className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
              />
              {errors.stock && <p className="text-[10px] text-error font-medium">{errors.stock.message}</p>}
            </div>

            {/* Inventory Status Indicator */}
            <div className="bg-base border border-muted rounded-md p-4 flex items-center justify-between select-none">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Availability Status</span>
                <p className="text-xs font-semibold text-primary mt-1">
                  {watchAll.stock > 0 ? "In Stock & Available" : "Out of Stock / Backorder"}
                </p>
              </div>
              <span
                className={`h-3 w-3 rounded-full ${
                  watchAll.stock > 10
                    ? "bg-success"
                    : watchAll.stock > 0
                    ? "bg-warning"
                    : "bg-error"
                }`}
              />
            </div>
          </FormSection>
        )}

        {/* MEDIA SECTION */}
        {activeSection === "media" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-muted pb-3">
              <h2 className="text-base font-semibold text-primary font-display">
                Showroom Media Gallery
              </h2>
              <p className="text-xs text-secondary font-light mt-0.5 max-w-3xl leading-relaxed">
                Upload luxury showroom photography. Arrange images in display sequence. Set a primary thumbnail.
              </p>
            </div>

            {/* Thumbnail Preview Area */}
            {watchAll.imageUrl && (
              <div className="border border-muted bg-base/10 rounded-md p-4 flex flex-col md:flex-row items-center gap-6 select-none">
                <div className="relative h-32 w-32 shrink-0 bg-panel border border-muted rounded-md overflow-hidden shadow-sm">
                  <img src={watchAll.imageUrl} alt="Thumbnail primary" className="h-full w-full object-cover" />
                  <span className="absolute top-1.5 left-1.5 bg-bronze text-panel text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    Primary Cover
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-primary">Cover Photo Attached</span>
                  <p className="text-[10px] text-secondary font-light leading-relaxed max-w-md">
                    This is the default card thumbnail shown in the search filter grid, category catalog pages, and cart lists.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerMode("thumbnail");
                      setMediaModalOpen(true);
                    }}
                    className="inline-flex items-center text-[10px] font-semibold text-bronze hover:underline uppercase tracking-wider"
                  >
                    Change Primary image
                  </button>
                </div>
              </div>
            )}

            {/* Multi Image Gallery Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Additional Carousel Photos ({(watchAll.images ?? []).length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerMode("images");
                    setMediaModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-1 text-bronze hover:text-bronze/90 text-xs font-semibold uppercase tracking-wider"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Attach Media Library items</span>
                </button>
              </div>

              {(watchAll.images ?? []).length === 0 ? (
                <div className="border border-dashed border-muted rounded-md py-12 flex flex-col items-center justify-center text-center text-secondary">
                  <span className="text-xs font-light">No additional photos attached.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerMode("images");
                      setMediaModalOpen(true);
                    }}
                    className="text-xs font-semibold text-bronze hover:underline mt-1.5"
                  >
                    Browse media assets
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(watchAll.images ?? []).map((img, idx) => {
                    const isPrimary = watchAll.imageUrl === img;
                    return (
                      <div
                        key={idx}
                        className={`group relative aspect-square bg-panel border rounded-md overflow-hidden ${
                          isPrimary ? "border-bronze ring-2 ring-bronze/10" : "border-muted"
                        }`}
                      >
                        <img src={img} alt={`Attached asset ${idx}`} className="w-full h-full object-cover" />

                        {isPrimary && (
                          <div className="absolute top-1.5 left-1.5 bg-bronze text-panel text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                            Primary
                          </div>
                        )}

                        {/* Order Controls */}
                        <div className="absolute top-1.5 right-1.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleReorderImage(idx, "up")}
                              className="bg-panel/90 hover:bg-panel text-primary p-1 rounded shadow"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                          )}
                          {idx < (watchAll.images ?? []).length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleReorderImage(idx, "down")}
                              className="bg-panel/90 hover:bg-panel text-primary p-1 rounded shadow"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        {/* Image overlay controls */}
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="bg-panel text-primary hover:bg-bronze hover:text-panel text-[9px] font-medium py-1 px-2 rounded shadow transition-all"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="bg-error text-panel hover:bg-error/90 p-1.5 rounded shadow transition-all"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FINISHES SECTION */}
        {activeSection === "finishes" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-muted pb-3">
              <h2 className="text-base font-semibold text-primary font-display">
                Wood & Metal Finishes Swatches
              </h2>
              <p className="text-xs text-secondary font-light mt-0.5 max-w-3xl leading-relaxed">
                Add timber grain shades, powder coated metals, or veneer sheets for product customization options.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {finishFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 border border-muted bg-base/10 rounded-md select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="h-6 w-6 rounded-full border border-muted shadow-inner shrink-0"
                        style={{ backgroundColor: watchAll.finishes?.[idx]?.hex || "#FFF" }}
                      />
                      <div>
                        <span className="text-xs font-semibold text-primary block">
                          {watchAll.finishes?.[idx]?.name}
                        </span>
                        <span className="text-[10px] font-mono text-secondary">
                          {watchAll.finishes?.[idx]?.hex}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        saveStateForUndo(watchAll);
                        removeFinish(idx);
                      }}
                      className="text-secondary hover:text-error transition-all"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Finish form */}
              <div className="bg-base/30 border border-muted p-4 rounded-md flex flex-col sm:flex-row items-end gap-4 max-w-2xl">
                <div className="flex-1 flex flex-col space-y-1.5 w-full">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    Finish Name
                  </label>
                  <input
                    id="new-finish-name"
                    type="text"
                    className="w-full bg-panel border border-muted rounded-md py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                    placeholder="e.g., Natural Ash Wood"
                  />
                </div>
                <div className="flex flex-col space-y-1.5 w-24 shrink-0">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    Color Hex
                  </label>
                  <input
                    id="new-finish-hex"
                    type="color"
                    className="w-full h-8 bg-panel border border-muted rounded-md p-1 outline-none cursor-pointer"
                    defaultValue="#D4AF37"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nameInput = document.getElementById("new-finish-name") as HTMLInputElement;
                    const hexInput = document.getElementById("new-finish-hex") as HTMLInputElement;
                    if (!nameInput?.value.trim()) {
                      toast.error("Finish name is required.");
                      return;
                    }
                    saveStateForUndo(watchAll);
                    appendFinish({ name: nameInput.value, hex: hexInput.value });
                    nameInput.value = "";
                  }}
                  className="bg-panel hover:bg-base text-primary border border-muted text-xs font-semibold py-2 px-4 rounded-md transition-all shrink-0 w-full sm:w-auto text-center"
                >
                  Add Option
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPHOLSTERY SECTION */}
        {activeSection === "upholstery" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-muted pb-3">
              <h2 className="text-base font-semibold text-primary font-display">
                Upholstery Fabrics & Leathers
              </h2>
              <p className="text-xs text-secondary font-light mt-0.5 max-w-3xl leading-relaxed">
                Add textured weave linen, velvet, bouclé, or aniline full-grain leather selection types.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(watchAll.upholstery ?? []).map((textile, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 bg-base/40 border border-muted rounded-md py-1.5 px-3 text-xs select-none"
                  >
                    <span className="text-primary font-medium">{textile}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUpholstery(idx)}
                      className="text-secondary hover:text-error transition-all"
                    >
                      <X className="h-3 w-3 shrink-0" />
                    </button>
                  </div>
                ))}
                {(watchAll.upholstery ?? []).length === 0 && (
                  <p className="text-xs text-secondary font-light">No upholstery textile customizer options set.</p>
                )}
              </div>

              {/* Add Upholstery */}
              <div className="flex items-center max-w-md gap-2.5">
                <input
                  type="text"
                  placeholder="e.g., Pure Linen Bouclé"
                  value={upholsteryInput}
                  onChange={(e) => setUpholsteryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUpholstery();
                    }
                  }}
                  className="flex-1 bg-base border border-muted rounded-md py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                />
                <button
                  type="button"
                  onClick={handleAddUpholstery}
                  className="bg-panel hover:bg-base text-primary border border-muted text-xs font-semibold py-2 px-4 rounded-md transition-all shrink-0"
                >
                  Add Option
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEO SECTION */}
        {activeSection === "seo" && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-muted pb-3">
              <h2 className="text-base font-semibold text-primary font-display">
                Search Engine Optimization
              </h2>
              <p className="text-xs text-secondary font-light mt-0.5 max-w-3xl leading-relaxed">
                Customize titles and descriptions to index furniture catalog items correctly on search engines.
              </p>
            </div>

            {/* SEO Form Inputs */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Meta title */}
              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="seo.title" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    SEO Meta Title
                  </label>
                  <span className={`text-[10px] font-mono ${seoTitleLen > 60 || seoTitleLen < 5 ? "text-error" : "text-success"}`}>
                    {seoTitleLen} / 60 characters
                  </span>
                </div>
                <input
                  id="seo.title"
                  type="text"
                  {...register("seo.title")}
                  className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                  placeholder="Artisan Oak Lounge Chair | JR Interiors"
                />
                {errors.seo?.title && <p className="text-[10px] text-error font-medium">{errors.seo.title.message}</p>}
              </div>

              {/* Meta description */}
              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="seo.description" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    SEO Meta Description
                  </label>
                  <span className={`text-[10px] font-mono ${seoDescLen > 160 || seoDescLen < 15 ? "text-error" : "text-success"}`}>
                    {seoDescLen} / 160 characters
                  </span>
                </div>
                <textarea
                  id="seo.description"
                  rows={3}
                  {...register("seo.description")}
                  className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze leading-normal"
                  placeholder="Handcrafted walnut solid wood lounge chair upholstered with premium ivory linen canvas fabric. Designed for absolute mid-century luxury living room spaces."
                />
                {errors.seo?.description && <p className="text-[10px] text-error font-medium">{errors.seo.description.message}</p>}
              </div>

              {/* Canonical URL */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="seo.canonical" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Canonical URL
                </label>
                <input
                  id="seo.canonical"
                  type="text"
                  {...register("seo.canonical")}
                  className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
                  placeholder="https://jrinteriors.in/catalog/artisan-lounge-chair"
                />
                {errors.seo?.canonical && <p className="text-[10px] text-error font-medium">{errors.seo.canonical.message}</p>}
              </div>

              {/* Robots */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="seo.robots" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Robots Indexing Rules
                </label>
                <select
                  id="seo.robots"
                  {...register("seo.robots")}
                  className="w-full bg-base border border-muted rounded-md py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-bronze font-medium text-primary"
                >
                  <option value="index, follow">Index, Follow (Default)</option>
                  <option value="noindex, follow">Noindex, Follow (Private)</option>
                  <option value="noindex, nofollow">Noindex, Nofollow (Blocked)</option>
                </select>
              </div>
            </div>

            {/* Live Warnings */}
            {poorSeoWarning && (
              <div className="bg-warning/5 border border-warning/15 rounded-md p-4 flex items-start space-x-3 select-none">
                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-warning">Poor SEO Recommendation Warning</span>
                  <p className="text-[10px] text-secondary font-light mt-0.5 leading-relaxed">
                    Meta Titles perform best under 60 characters. Meta Descriptions should stay between 50 to 160 characters. Adding proper lengths helps search crawlers index pages effectively.
                  </p>
                </div>
              </div>
            )}

            {/* Google Search Snippet Preview */}
            <div className="border border-muted bg-panel rounded-md p-5 luxury-shadow-sm space-y-2 select-none">
              <div className="flex items-center space-x-1.5 text-secondary text-[10px] font-semibold uppercase tracking-wider">
                <Globe className="h-3.5 w-3.5" />
                <span>Google Search Snippet Preview</span>
              </div>
              <div className="space-y-1">
                <cite className="text-[10px] text-secondary not-italic font-light block truncate">
                  https://jrinteriors.in/catalog/{watchAll.slug || "artisan-lounge-chair"}
                </cite>
                <span className="text-base text-blue-800 hover:underline cursor-pointer block font-medium">
                  {watchAll.seo?.title || watchAll.name || "Artisan Oak Lounge Chair | JR Interiors"}
                </span>
                <p className="text-xs text-secondary leading-relaxed font-light">
                  {watchAll.seo?.description || "No SEO description set yet. Provide a search description under catalog settings to preview snippet index."}
                </p>
              </div>
            </div>

            {/* Social Share Card Preview */}
            <div className="border border-muted bg-panel rounded-md p-5 luxury-shadow-sm space-y-3 select-none">
              <div className="flex items-center space-x-1.5 text-secondary text-[10px] font-semibold uppercase tracking-wider">
                <Twitter className="h-3.5 w-3.5" />
                <span>Social Card Share Preview</span>
              </div>
              <div className="border border-muted rounded-md overflow-hidden max-w-md bg-base/5">
                <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                  {watchAll.imageUrl ? (
                    <img src={watchAll.imageUrl} alt="OG Card Share" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-secondary/30" />
                  )}
                  <span className="absolute bottom-2 left-2 bg-primary/75 text-panel text-[8px] font-medium tracking-wide uppercase px-2 py-0.5 rounded">
                    OG IMAGE
                  </span>
                </div>
                <div className="p-4 border-t border-muted space-y-1">
                  <span className="text-[9px] text-secondary font-light font-mono block uppercase">
                    jrinteriors.in
                  </span>
                  <span className="text-xs font-semibold text-primary block truncate">
                    {watchAll.seo?.title || watchAll.name || "Artisan Oak Lounge Chair"}
                  </span>
                  <p className="text-[10px] text-secondary leading-relaxed font-light line-clamp-2">
                    {watchAll.seo?.description || "Handcrafted walnut solid wood furniture lounge chair customized for showroom styling catalog."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PUBLISHING SECTION */}
        {activeSection === "publishing" && (
          <div className="space-y-6 animate-fade-in select-none">
            <div className="border-b border-muted pb-3">
              <h2 className="text-base font-semibold text-primary font-display">
                Publishing Moderation Checklist
              </h2>
              <p className="text-xs text-secondary font-light mt-0.5 max-w-3xl leading-relaxed">
                Review requirements checklist. Enforce validation checklist gates.
              </p>
            </div>

            {/* Moderator Rejection Reason if any */}
            {initialProduct?.status === "CHANGES_REQUESTED" && initialProduct?.reviewNote && (
              <div className="bg-warning/5 border border-warning/15 rounded-md p-4 flex items-start space-x-3">
                <AlertCircle className="h-4.5 w-4.5 text-warning shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-warning block">Moderation Changes Requested Feedback</span>
                  <p className="text-xs text-primary font-medium mt-1 leading-relaxed">
                    &ldquo;{initialProduct.reviewNote}&rdquo;
                  </p>
                  <p className="text-[10px] text-secondary font-light mt-1.5 leading-normal">
                    Update the flagged properties and submit again for verification approval.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {/* Checklist */}
              <div className="md:col-span-2">
                <PublishChecklist items={checklistItems} />
              </div>

              {/* Status details card */}
              <div className="bg-panel border border-muted rounded-md p-5 space-y-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Moderation State Info
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary">Current Status:</span>
                    <span className="font-semibold text-primary capitalize">
                      {initialProduct?.status?.toLowerCase() ?? "DRAFT"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary">Owner Role:</span>
                    <span className="font-semibold text-primary select-none">
                      {isSeller ? "Seller Profile" : "Administrator"}
                    </span>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-muted text-[10px] text-secondary font-light leading-normal space-y-1.5">
                  <p>
                    <strong>Sellers</strong> can only draft and submit products for review.
                  </p>
                  <p>
                    <strong>Administrators</strong> must evaluate drafts against specifications checklist rules to publish catalog items live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOG TIMELINE */}
        {activeSection === "history" && initialProduct && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-muted pb-3">
              <h2 className="text-base font-semibold text-primary font-display">
                Product Activity Audit Trail
              </h2>
              <p className="text-xs text-secondary font-light mt-0.5 max-w-3xl leading-relaxed">
                Chronological track of administrative edits, publishing status transitions, and moderator notes.
              </p>
            </div>

            <HistoryTimeline logs={auditLogs} />
          </div>
        )}
      </FormWorkspace>

      {/* Media Library Picker Modal Portal */}
      <MediaPickerModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        selectedIds={mediaPickerMode === "thumbnail" ? (watchAll.mediaId ? [watchAll.mediaId] : []) : (watchAll.mediaIds ?? [])}
        multiple={mediaPickerMode === "images"}
      />
    </form>
  );
}
