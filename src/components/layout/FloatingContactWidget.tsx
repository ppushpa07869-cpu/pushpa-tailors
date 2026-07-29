import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, PhoneCall, MapPin, X, MessageSquare } from 'lucide-react';

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const actions = [
    { 
      icon: <MessageCircle className="w-5 h-5" />, 
      label: 'WhatsApp', 
      href: 'https://wa.me/1234567890?text=Hello,%20I%20would%20like%20to%20enquire%20about%20blouse%20stitching.', 
      color: 'bg-[#25D366] hover:bg-[#20b858]' 
    },
    { 
      icon: <PhoneCall className="w-5 h-5" />, 
      label: 'Call', 
      href: 'tel:+911234567890', 
      color: 'bg-primary hover:bg-primary/90' 
    },
    { 
      icon: <MapPin className="w-5 h-5" />, 
      label: 'Directions', 
      href: 'https://maps.google.com', 
      color: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col space-y-3"
          >
            {actions.map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                target={action.label === 'Call' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-center p-3 rounded-full text-white shadow-lg ${action.color} transition-transform hover:scale-110 group relative`}
              >
                {action.icon}
                <span className="absolute right-14 bg-black/80 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={toggleOpen}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.24)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:scale-105 transition-all relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full border border-primary opacity-50 animate-ping"></span>
        )}
      </button>
    </div>
  );
}
