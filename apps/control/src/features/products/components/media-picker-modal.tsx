"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { X, Upload, Search, Trash2, CheckCircle2, Image as ImageIcon, ZoomIn } from "lucide-react";
import { uploadMediaAssetAction, listMediaAssetsAction, deleteMediaAssetAction } from "../../media/actions/media-actions";
import { toast } from "sonner";

interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assets: MediaAsset[]) => void;
  selectedIds: string[];
  multiple?: boolean;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedIds,
  multiple = true,
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Load assets from library
  const loadAssets = async (query = "") => {
    const res = await listMediaAssetsAction({ search: query });
    if (res.success) {
      setAssets(res.data);
    } else {
      toast.error("Failed to load media assets");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAssets();
      setLocalSelected(selectedIds);
    }
  }, [isOpen, selectedIds]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleSelect = (asset: MediaAsset) => {
    if (multiple) {
      setLocalSelected((prev) =>
        prev.includes(asset.id)
          ? prev.filter((id) => id !== asset.id)
          : [...prev, asset.id]
      );
    } else {
      setLocalSelected([asset.id]);
    }
  };

  // Upload file helper
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only images are supported for product media.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size cannot exceed 2 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        const res = await uploadMediaAssetAction({
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          base64Data,
        });

        if (res.success) {
          toast.success("Image uploaded successfully.");
          loadAssets();
          // Auto select uploaded asset
          setLocalSelected((prev) =>
            multiple ? [...prev, res.data.id] : [res.data.id]
          );
        } else {
          toast.error(res.error.message || "Failed to upload image.");
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during file upload.");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      files.forEach((file) => uploadFile(file));
    }
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => uploadFile(file));
    }
  };

  // Delete asset
  const handleDeleteAsset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this image from the library?")) return;
    const res = await deleteMediaAssetAction(id);
    if (res.success) {
      toast.success("Image deleted from library.");
      setLocalSelected((prev) => prev.filter((selectedId) => selectedId !== id));
      loadAssets();
    } else {
      toast.error(res.error.message || "Failed to delete image.");
    }
  };

  const handleConfirm = () => {
    const selectedAssets = assets.filter((asset) => localSelected.includes(asset.id));
    onSelect(selectedAssets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm select-none">
      <div className="bg-panel border border-muted w-full max-w-4xl h-[85vh] rounded-md shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-muted flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-bronze">
              Media Library
            </h3>
            <p className="text-[10px] text-secondary font-light">
              Select assets to attach to this product. Max file size is 2 MB.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-secondary hover:bg-base hover:text-primary transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* Left panel: Upload & Search */}
          <div className="w-full md:w-64 shrink-0 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary/60" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadAssets(e.target.value);
                }}
                className="w-full bg-base border border-muted rounded-md py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
              />
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
                dragActive
                  ? "border-bronze bg-bronze/5"
                  : "border-muted hover:border-bronze/50 bg-base/20 hover:bg-base/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-6 w-6 text-secondary/60 mb-2" />
              <span className="text-xs font-medium text-primary">
                {isUploading ? "Uploading..." : "Upload Images"}
              </span>
              <span className="text-[10px] text-secondary font-light mt-1">
                Drag & drop or click to browse
              </span>
            </div>
          </div>

          {/* Right panel: Assets Grid */}
          <div className="flex-1 flex flex-col min-h-0 bg-base/20 border border-muted rounded-md p-4">
            {assets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-secondary py-12">
                <ImageIcon className="h-8 w-8 text-secondary/40 mb-2" />
                <p className="text-xs">No media assets found</p>
                <p className="text-[10px] font-light mt-1">Upload a new image to start</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {assets.map((asset) => {
                    const isSelected = localSelected.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        onClick={() => handleToggleSelect(asset)}
                        className={`relative aspect-square bg-panel border rounded-md overflow-hidden cursor-pointer group transition-all duration-150 ${
                          isSelected
                            ? "border-bronze ring-2 ring-bronze/20"
                            : "border-muted hover:border-secondary/50"
                        }`}
                      >
                        <img
                          src={asset.url}
                          alt={asset.filename}
                          className="w-full h-full object-cover"
                        />
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-bronze text-panel p-0.5 rounded-full shadow">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomUrl(asset.url);
                            }}
                            className="bg-panel/90 text-primary hover:bg-panel p-1.5 rounded-md shadow transition-transform transform hover:scale-105"
                          >
                            <ZoomIn className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAsset(asset.id, e)}
                            className="bg-error/90 text-panel hover:bg-error p-1.5 rounded-md shadow transition-transform transform hover:scale-105"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* File Details Tag */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/80 to-transparent p-1.5 text-[9px] text-panel font-light truncate">
                          {asset.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-muted bg-sidebar/10 flex items-center justify-end space-x-3">
          <span className="text-[10px] text-secondary font-light select-none">
            {localSelected.length} asset{localSelected.length !== 1 && "s"} selected
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-panel hover:bg-base text-secondary border border-muted py-2 px-4 rounded-md transition-all font-medium text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-bronze hover:bg-bronze/90 text-panel py-2 px-4 rounded-md transition-all font-semibold text-xs shadow"
          >
            Apply Selection
          </button>
        </div>
      </div>

      {/* Lightbox Zoom Portal */}
      {zoomUrl && (
        <div
          onClick={() => setZoomUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md cursor-zoom-out select-none animate-fade-in"
        >
          <img
            src={zoomUrl}
            alt="Zoomed preview"
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
