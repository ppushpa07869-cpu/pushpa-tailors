
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { designService } from '../services/designService';
import type { Design } from '../types/design';

interface ManifestEntry {
  designCode: string;
  images: string[];
}

interface GalleryItem {
  id: string;
  url: string;
  images: string[];
  category: string;
  title: string;
  workType?: string;
  code?: string;
}

function normalizeCode(code: string): string {
  const value = String(code ?? '').trim();
  return /^\d+$/.test(value) ? String(Number(value)) : value;
}

function getFilename(url: string): string {
  try {
    return decodeURIComponent(
      url.split('/').pop()?.split(/[?#]/)[0] || 'Preview image'
    );
  } catch {
    return url.split('/').pop()?.split(/[?#]/)[0] || 'Preview image';
  }
}

function uniqueStrings(values: string[]): string[] {
  return [
    ...new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
}

function isImageKitUrl(url: string): boolean {
  return /^https:\/\/ik\.imagekit\.io\//i.test(url);
}

function isValidImageUrl(url: string): boolean {
  return (
    /^https:\/\/ik\.imagekit\.io\//i.test(url) ||
    /^https?:\/\//i.test(url)
  );
}

// Prefer full-design photographs over detail photographs.
function isFullImage(url: string): boolean {
  const filename = getFilename(url).toLowerCase();
  return /^full(?:[\s_-].*)?\.jpg$/.test(filename);
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [dbDesigns, setDbDesigns] = useState<Design[]>([]);
  const [imageManifest, setImageManifest] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [manifestError, setManifestError] = useState(false);

  // Load active designs from Firebase.
  useEffect(() => {
    let mounted = true;

    designService
      .getActiveDesigns()
      .then((designs) => {
        if (mounted) {
          setDbDesigns(designs);
          setLoadError(false);
        }
      })
      .catch((error) => {
        console.error('Unable to load gallery designs:', error);
        if (mounted) setLoadError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Load ImageKit image manifest.
  useEffect(() => {
    let mounted = true;

    fetch('/design-image-manifest-imagekit.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Image manifest could not be loaded');
        }

        return response.json() as Promise<ManifestEntry[]>;
      })
      .then((entries) => {
        if (!Array.isArray(entries)) {
          throw new Error('Invalid image manifest format');
        }

        const map: Record<string, string[]> = {};

        entries.forEach((entry) => {
          if (
            !entry?.designCode ||
            !Array.isArray(entry.images)
          ) {
            return;
          }

          const code = normalizeCode(entry.designCode);

          const images = entry.images.filter(
            (path): path is string =>
              typeof path === 'string' &&
              path.trim().length > 0 &&
              isValidImageUrl(path.trim())
          );

          if (code && images.length > 0) {
            map[code] = uniqueStrings([
              ...(map[code] || []),
              ...images,
            ]);
          }
        });

        if (mounted) {
          setImageManifest(map);
          setManifestError(false);
        }
      })
      .catch((error) => {
        console.warn('Optional image manifest unavailable:', error);

        if (mounted) {
          setManifestError(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setManifestLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Combine Firebase designs with ImageKit images.
  const galleryItems = useMemo<GalleryItem[]>(() => {
    return dbDesigns
      .map((design) => {
        const code = normalizeCode(design.designCode);

        const firebaseImages = Array.isArray(design.previewImages)
          ? design.previewImages.filter(
            (image): image is string =>
              typeof image === 'string' &&
              image.trim().length > 0 &&
              isValidImageUrl(image.trim())
          )
          : [];

        const primaryImage =
          typeof design.previewImageUrl === 'string'
            ? design.previewImageUrl.trim()
            : '';

        const manifestImages = imageManifest[code] || [];

        // ImageKit images take priority over Firebase image paths.
        const imageKitImages = manifestImages.filter(isImageKitUrl);

        const otherImages = uniqueStrings([
          ...firebaseImages,
          ...manifestImages.filter(
            (url) => !isImageKitUrl(url)
          ),
          ...(primaryImage && isValidImageUrl(primaryImage)
            ? [primaryImage]
            : []),
        ]);

        const allImages = uniqueStrings([
          ...imageKitImages,
          ...otherImages,
        ]);

        // Move the full-design image to the first position when available.
        const fullImage = allImages.find(isFullImage);

        const images = fullImage
          ? [
            fullImage,
            ...allImages.filter((image) => image !== fullImage),
          ]
          : allImages;

        return {
          id: design.id || design.designCode,
          url: images[0] || '',
          images,
          category: design.category || 'Other / Custom',
          title: design.name || `Design ${design.designCode}`,
          workType: design.workType,
          code: design.designCode,
        };
      })
      .filter((design) => design.url !== '');
  }, [dbDesigns, imageManifest]);

  const categories = useMemo(() => {
    const values = new Set<string>(['All']);

    galleryItems.forEach((item) => {
      values.add(item.category);
    });

    return Array.from(values);
  }, [galleryItems]);

  const filteredImages = useMemo(
    () =>
      activeCategory === 'All'
        ? galleryItems
        : galleryItems.filter(
          (item) => item.category === activeCategory
        ),
    [galleryItems, activeCategory]
  );

  const selectedDesign = galleryItems.find(
    (item) => item.id === selectedDesignId
  );

  const activeImage = selectedDesign?.images[selectedPreviewIndex];

  const openDesign = (id: string) => {
    setSelectedDesignId(id);
    setSelectedPreviewIndex(0);
  };

  const closeViewer = () => {
    setSelectedDesignId(null);
    setSelectedPreviewIndex(0);
  };

  const showPreviousImage = (event?: React.MouseEvent) => {
    event?.stopPropagation();

    if (!selectedDesign) return;

    setSelectedPreviewIndex((current) =>
      current === 0
        ? selectedDesign.images.length - 1
        : current - 1
    );
  };

  const showNextImage = (event?: React.MouseEvent) => {
    event?.stopPropagation();

    if (!selectedDesign) return;

    setSelectedPreviewIndex((current) =>
      current === selectedDesign.images.length - 1
        ? 0
        : current + 1
    );
  };

  const downloadImage = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!activeImage) return;

    const link = document.createElement('a');
    link.href = activeImage;
    link.download = getFilename(activeImage);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  useEffect(() => {
    if (!selectedDesignId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeViewer();
      } else if (event.key === 'ArrowLeft') {
        showPreviousImage();
      } else if (event.key === 'ArrowRight') {
        showNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDesignId, selectedDesign, selectedPreviewIndex]);

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-12 md:py-20">

        {/* Gallery heading */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
            <Sparkles className="h-4 w-4" />
            Our Design Collection
          </div>

          <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">
            Explore Our Designs
          </h1>

          <p className="mx-auto max-w-2xl text-muted-foreground">
            Browse our collection of embroidery designs and discover
            inspiration for your next creation.
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${activeCategory === category
                ? 'bg-secondary text-white shadow-md'
                : 'border border-border bg-card text-foreground hover:border-secondary hover:text-secondary'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-secondary/20 border-t-secondary" />
            <p className="text-muted-foreground">
              Loading designs...
            </p>
          </div>
        )}

        {/* Firebase error */}
        {!isLoading && loadError && (
          <div className="py-16 text-center">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

            <h2 className="font-serif text-2xl">
              Unable to load designs
            </h2>

            <p className="mt-2 text-muted-foreground">
              Please try again later.
            </p>
          </div>
        )}

        {/* Manifest loading */}
        {!isLoading && !loadError && manifestLoading && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Loading additional design previews...
          </p>
        )}

        {/* Manifest error */}
        {!isLoading && !loadError && manifestError && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            The public image manifest could not be loaded.
            Firebase images will still be shown.
          </p>
        )}

        {/* Empty gallery */}
        {!isLoading && !loadError && galleryItems.length === 0 && (
          <div className="py-16 text-center">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

            <h2 className="font-serif text-2xl">
              No designs available yet
            </h2>

            <p className="mt-2 text-muted-foreground">
              Please check back later for our design collection.
            </p>
          </div>
        )}

        {/* Empty category */}
        {!isLoading &&
          !loadError &&
          galleryItems.length > 0 &&
          filteredImages.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              No designs found in this category.
            </p>
          )}

        {/* Gallery grid */}
        {!isLoading && !loadError && (
          <motion.div
            layout
            className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-3 lg:columns-4"
          >
            <AnimatePresence>
              {filteredImages.map((design) => (
                <motion.button
                  layout
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={design.id}
                  className="group relative block w-full break-inside-avoid cursor-pointer overflow-hidden rounded-2xl border border-gray-100/50 bg-white text-left shadow-sm transition-all hover:shadow-xl"
                  onClick={() => openDesign(design.id)}
                >
                  <img
                    src={design.url}
                    alt={design.title}
                    loading="lazy"
                    className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.style.visibility = 'hidden';
                    }}
                  />

                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-5 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                    {design.code && (
                      <span className="mb-1 font-mono text-[11px] font-bold tracking-widest text-secondary">
                        #{design.code}
                      </span>
                    )}

                    <span className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-300">
                      {design.category}
                      {design.workType ? ` • ${design.workType}` : ''}
                    </span>

                    <h3 className="font-serif text-lg font-semibold text-white">
                      {design.title}
                    </h3>

                    {design.images.length > 1 && (
                      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs text-white">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {design.images.length} preview images
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Image viewer modal */}
      <AnimatePresence>
        {selectedDesignId && activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md md:p-8"
            onClick={closeViewer}
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Close preview"
              className="absolute right-4 top-4 z-20 p-2 text-white/70 transition-colors hover:text-white md:right-6 md:top-6"
              onClick={(event) => {
                event.stopPropagation();
                closeViewer();
              }}
            >
              <X className="h-7 w-7" />
            </button>

            {/* Previous image */}
            {selectedDesign && selectedDesign.images.length > 1 && (
              <button
                type="button"
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:left-6"
                onClick={showPreviousImage}
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}

            {/* Main image */}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-full max-w-full flex-col items-center"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={activeImage}
                alt={selectedDesign?.title || 'Design preview'}
                className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
              />

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-white">
                <div className="text-center">
                  <h3 className="font-serif text-xl font-semibold">
                    {selectedDesign?.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/60">
                    {selectedDesign?.code
                      ? `Design #${selectedDesign.code}`
                      : ''}
                  </p>

                  {selectedDesign && selectedDesign.images.length > 1 && (
                    <p className="mt-1 text-xs text-white/60">
                      Image {selectedPreviewIndex + 1} of{' '}
                      {selectedDesign.images.length}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={downloadImage}
                  className="rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20"
                  aria-label="Download image"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {/* Next image */}
            {selectedDesign && selectedDesign.images.length > 1 && (
              <button
                type="button"
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:right-6"
                onClick={showNextImage}
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
