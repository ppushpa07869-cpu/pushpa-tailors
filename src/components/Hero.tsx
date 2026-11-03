
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ArrowRight } from 'lucide-react';

import {
  getBusinessSettings,
  DEFAULT_BUSINESS_SETTINGS,
  type BusinessSettings
} from '../services/businessSettingsService';

interface HeroProps {
  useVideo?: boolean;
  videoUrl?: string;
}

export default function Hero({ useVideo = false, videoUrl }: HeroProps) {
  const [settings, setSettings] = useState<BusinessSettings>(
    DEFAULT_BUSINESS_SETTINGS
  );

  // Load WhatsApp number from Firestore.
  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const data = await getBusinessSettings();

        if (mounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading Hero contact settings:', error);
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, '');

  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
      'Hello, I would like to enquire about blouse stitching.'
    )}`
    : '';

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        {useVideo && videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="w-full h-full object-cover bg-[url('https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"
          />
        )}

        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <span className="text-secondary font-sans tracking-[0.3em] uppercase text-xs sm:text-sm mb-6 flex items-center gap-4">
            <span className="w-12 h-[1px] bg-secondary"></span>
            Elegant Stitching
            <span className="w-12 h-[1px] bg-secondary"></span>
          </span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-wider leading-tight">
            PUSHPA <br className="md:hidden" />TAILORS
          </h1>

          <p className="text-lg md:text-2xl font-light mb-12 text-gray-300 max-w-3xl mx-auto font-sans tracking-wide">
            Perfect Fitting. Timeless Designs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">

            <Link
              to="/gallery"
              className="w-full sm:w-auto bg-primary text-white font-medium px-8 py-4 uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(139,0,0,0.3)] flex items-center justify-center gap-2 group"
            >
              View Designs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/contact"
              className="w-full sm:w-auto bg-transparent border border-white text-white font-medium px-8 py-4 uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
            >
              Book Stitching
            </Link>

            {whatsappDigits && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] text-white font-medium px-8 py-4 uppercase tracking-widest hover:bg-[#20b858] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            )}

          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <div className="flex text-secondary mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-current" />
              ))}
            </div>

            <p className="text-white/80 font-sans tracking-wider text-sm">
              Trusted by 1000+ Happy Customers
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-xs uppercase tracking-widest font-medium">
          Scroll
        </span>

        <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
      </motion.div>

    </div>
  );
}
