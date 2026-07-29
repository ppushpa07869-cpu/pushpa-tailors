import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Share2, Heart, Download } from 'lucide-react';

const categories = ['All', 'Trending Designs', 'Latest Designs', 'Bridal Collection', 'Festival Collection', 'Designer Collection', 'Wedding Collection'];

// Generate placeholder images of varying heights for masonry layout
const images = Array.from({ length: 16 }).map((_, i) => {
  const height = 300 + Math.floor(Math.random() * 300);
  const catIndex = Math.floor(Math.random() * (categories.length - 1)) + 1;
  return {
    id: i,
    url: `https://images.unsplash.com/photo-1583391733958-625078508e67?auto=format&fit=crop&w=600&h=${height}&q=80`,
    category: categories[catIndex],
    title: `Premium Design ${i + 1}`
  };
});

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages = activeCategory === 'All' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null) {
      const currentIndex = filteredImages.findIndex(img => img.id === selectedImage);
      const nextIndex = (currentIndex + 1) % filteredImages.length;
      setSelectedImage(filteredImages[nextIndex].id);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null) {
      const currentIndex = filteredImages.findIndex(img => img.id === selectedImage);
      const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
      setSelectedImage(filteredImages[prevIndex].id);
    }
  };

  const activeImage = filteredImages.find(img => img.id === selectedImage);

  return (
    <div className="flex flex-col w-full bg-background overflow-x-hidden pt-24 min-h-screen">
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-foreground text-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-secondary font-sans tracking-[0.3em] uppercase text-sm mb-4 block">Inspiration</span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 tracking-wider leading-tight">Design Gallery</h1>
          <div className="w-24 h-1 bg-secondary mx-auto"></div>
        </motion.div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-sans text-sm tracking-widest uppercase transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <motion.div layout className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          <AnimatePresence>
            {filteredImages.map((image) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={image.id}
                className="relative break-inside-avoid group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
                onClick={() => setSelectedImage(image.id)}
              >
                <img 
                  src={image.url} 
                  alt={image.title} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-secondary text-xs uppercase tracking-widest font-medium mb-1">{image.category}</span>
                  <h3 className="text-white font-serif text-lg">{image.title}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More (Fake) */}
        <div className="mt-16 flex justify-center">
          <button className="bg-transparent border border-primary text-primary px-10 py-3 rounded-full font-medium tracking-widest uppercase hover:bg-primary hover:text-white transition-all">
            Load More
          </button>
        </div>
      </section>

      {/* Lightbox / Preview Modal */}
      <AnimatePresence>
        {selectedImage !== null && activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="w-8 h-8" />
            </button>

            <div className="absolute top-6 left-6 text-white/80 font-sans tracking-widest uppercase text-sm">
              {activeImage.title} <span className="text-secondary mx-2">|</span> {activeImage.category}
            </div>

            <button 
              className="absolute left-6 text-white/50 hover:text-white transition-colors p-4 hidden md:block"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[85vh] max-w-5xl flex items-center justify-center group"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={activeImage.url} 
                alt={activeImage.title} 
                className="max-h-[85vh] max-w-full object-contain rounded-sm shadow-2xl"
              />
              
              {/* Toolbar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-white hover:text-secondary transition-colors" title="Zoom">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-4 bg-white/20"></div>
                <button className="text-white hover:text-secondary transition-colors" title="Favorite">
                  <Heart className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-4 bg-white/20"></div>
                <button className="text-white hover:text-secondary transition-colors" title="Share">
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-4 bg-white/20"></div>
                <button className="text-white hover:text-secondary transition-colors" title="Download">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            <button 
              className="absolute right-6 text-white/50 hover:text-white transition-colors p-4 hidden md:block"
              onClick={handleNext}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Mobile Navigation */}
            <div className="absolute bottom-6 flex items-center justify-center gap-12 md:hidden">
              <button className="text-white/80 p-2" onClick={handlePrev}>
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button className="text-white/80 p-2" onClick={handleNext}>
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
