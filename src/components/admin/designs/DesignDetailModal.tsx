import {
  X,
  Edit3,
  Cpu,
  CheckCircle2,
  XCircle,
  Calendar,
  Tag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Design } from '../../../types/design';

interface DesignDetailModalProps {
  isOpen: boolean;
  design: Design | null;
  onClose: () => void;
  onEdit: (design: Design) => void;
  onToggleActive: (design: Design) => void;
}

export default function DesignDetailModal({
  isOpen,
  design,
  onClose,
  onEdit,
  onToggleActive,
}: DesignDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!design) return [];

    const gallery = Array.isArray(design.previewImages)
      ? design.previewImages.filter(
        (image): image is string =>
          typeof image === 'string' && image.trim().length > 0
      )
      : [];

    const allImages = [
      ...(design.previewImageUrl ? [design.previewImageUrl] : []),
      ...gallery,
    ];

    return Array.from(new Set(allImages));
  }, [design]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [design?.id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight' && images.length > 1) {
        setSelectedImageIndex((current) => (current + 1) % images.length);
      } else if (event.key === 'ArrowLeft' && images.length > 1) {
        setSelectedImageIndex(
          (current) => (current - 1 + images.length) % images.length
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !design) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';

    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    return 'Recent';
  };

  const selectedImage = images[selectedImageIndex];

  const showPreviousImage = () => {
    setSelectedImageIndex(
      (current) => (current - 1 + images.length) % images.length
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex(
      (current) => (current + 1) % images.length
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl md:flex-row">
        {/* Main image and gallery */}
        <div className="flex w-full flex-col bg-gray-950 md:w-1/2 md:min-h-0">
          <div className="relative flex min-h-[280px] flex-1 items-center justify-center md:min-h-0">
            {selectedImage ? (
              <img
                key={selectedImage}
                src={selectedImage}
                alt={`${design.name} preview ${selectedImageIndex + 1}`}
                className="max-h-[60vh] w-full object-contain md:max-h-full"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Sparkles className="mb-2 h-12 w-12 opacity-60" />
                <span>No image preview</span>
              </div>
            )}

            <div className="absolute left-4 top-4">
              <span className="rounded-xl border border-white/20 bg-black/70 px-3 py-1.5 text-xs font-bold tracking-widest text-white">
                #{design.designCode}
              </span>
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Previous preview image"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/90"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Next preview image"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/90"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {/* Clickable image thumbnails */}
          {images.length > 0 && (
            <div className="shrink-0 border-t border-white/10 bg-gray-950 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-300">
                Design images ({images.length})
              </p>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selectedImageIndex === index}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImageIndex === index
                      ? 'border-blue-400'
                      : 'border-gray-700 hover:border-gray-400'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Design details */}
        <div className="flex w-full flex-col overflow-y-auto p-6 md:w-1/2 md:p-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {design.workType}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {design.category}
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-bold leading-tight text-gray-900">
                  {design.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close design details"
                className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price and status */}
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Stitching &amp; Work Price
                </span>
                <span className="text-2xl font-bold text-primary">
                  ₹{design.price.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onToggleActive(design)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${design.active
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {design.active ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Active in Catalog
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-500" />
                    Inactive / Hidden
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            {design.description && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Description / వివరణ
                </span>
                <p className="rounded-xl border border-gray-100 bg-white p-3 text-sm leading-relaxed text-gray-700">
                  {design.description}
                </p>
              </div>
            )}

            {/* Machine files */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Cpu className="h-4 w-4 text-primary" />
                <span>
                  Machine Files ({design.machineFiles?.length || 0})
                </span>
              </div>

              {design.machineFiles && design.machineFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {design.machineFiles.map((file, index) => (
                    <span
                      key={`${file}-${index}`}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 font-mono text-xs font-medium text-gray-800 shadow-sm"
                    >
                      <Tag className="h-3 w-3 text-primary/70" />
                      {file}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-gray-400">
                  No DST machine files linked yet.
                </p>
              )}

              <p className="text-[11px] text-gray-400">
                Machine files are kept secure for workshop production and not
                exposed on the public site.
              </p>
            </div>

            {/* Dates */}
            <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Added: {formatDate(design.createdAt)}</span>
              </div>

              {design.updatedAt && (
                <span>• Updated: {formatDate(design.updatedAt)}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(design);
              }}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800"
            >
              <Edit3 className="h-4 w-4" />
              Edit Design (సవరించండి)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
