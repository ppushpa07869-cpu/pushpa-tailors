import { motion } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function Contact() {
  return (
    <div className="flex flex-col w-full bg-background overflow-x-hidden pt-24 min-h-screen">
      {/* Header Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-foreground text-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-secondary font-sans tracking-[0.3em] uppercase text-sm mb-4 block">Get In Touch</span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 tracking-wider leading-tight">Visit Our Boutique</h1>
          <div className="w-24 h-1 bg-secondary mx-auto"></div>
        </motion.div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Phone & WhatsApp Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card p-10 rounded-2xl shadow-xl border border-border/50 flex flex-col h-full group"
          >
            <div className="flex gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Phone className="w-6 h-6" />
              </div>
              <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-300">
                <MessageCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-4">Contact Numbers</h3>
            <p className="text-muted-foreground font-sans mb-8 flex-grow">
              Call us or send a message on WhatsApp to book an appointment or inquire about our services.
            </p>
            <div className="space-y-4 font-sans">
              <a href="tel:+911234567890" className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors">
                <Phone className="w-5 h-5 text-primary" /> +91 12345 67890
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-[#25D366] transition-colors">
                <MessageCircle className="w-5 h-5 text-[#25D366]" /> WhatsApp Us
              </a>
            </div>
          </motion.div>

          {/* Business Hours Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card p-10 rounded-2xl shadow-xl border border-border/50 flex flex-col h-full group"
          >
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-8 group-hover:bg-secondary group-hover:text-background transition-colors duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-4">Business Hours</h3>
            <p className="text-muted-foreground font-sans mb-8 flex-grow">
              We are open six days a week. Feel free to walk in during our business hours.
            </p>
            <ul className="space-y-4 font-sans text-foreground">
              <li className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="font-medium text-muted-foreground">Monday – Saturday</span>
                <span className="font-bold">9:00 AM – 8:00 PM</span>
              </li>
              <li className="flex justify-between items-center pt-1">
                <span className="font-medium text-muted-foreground">Sunday</span>
                <span className="font-bold text-destructive tracking-widest uppercase text-xs">Holiday</span>
              </li>
            </ul>
          </motion.div>

          {/* Address Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card p-10 rounded-2xl shadow-xl border border-border/50 flex flex-col h-full group"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-4">Location</h3>
            <p className="text-muted-foreground font-sans mb-8 flex-grow">
              Visit our premium boutique. We're located in the heart of the city for your convenience.
            </p>
            <p className="font-sans text-lg font-medium text-foreground mb-6">
              123 Premium Fashion Street, <br />
              Boutique Avenue, <br />
              City Name - 500001
            </p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 text-primary font-medium uppercase tracking-widest text-sm hover:text-secondary transition-colors"
            >
              Get Directions <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full h-[500px] bg-muted rounded-2xl overflow-hidden relative shadow-2xl border border-border/50 flex items-center justify-center group"
        >
          {/* Fake Map Image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity transition-opacity group-hover:opacity-60 duration-500"></div>
          
          <div className="relative z-10 flex flex-col items-center bg-background/80 backdrop-blur-md p-8 rounded-xl shadow-xl border border-border text-center">
            <MapPin className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-2xl font-serif text-foreground mb-2">PUSHPA TAILORS</h3>
            <p className="text-muted-foreground font-sans mb-6">Interactive Map Loading...</p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-white px-8 py-3 rounded-full font-medium tracking-widest uppercase hover:bg-primary/90 transition-all shadow-lg"
            >
              Open in Google Maps
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
