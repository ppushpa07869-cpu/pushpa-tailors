
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import {
  Scissors,
  CheckCircle,
  ShieldCheck,
  Heart,
  Star,
  ChevronDown,
  PhoneCall,
  MessageCircle,
  Calendar
} from 'lucide-react';

import {
  getBusinessSettings,
  DEFAULT_BUSINESS_SETTINGS,
  type BusinessSettings
} from '../services/businessSettingsService';

const features = [
  { icon: <Scissors />, title: 'Perfect Stitching', desc: 'Bespoke fitting tailored exactly to your unique measurements.' },
  { icon: <Heart />, title: 'Designer Blouses', desc: 'Intricate handwork, maggam, and stone work designs.' },
  { icon: <ShieldCheck />, title: 'Premium Finishing', desc: 'Double interlock and luxury lining for lasting durability.' }
];

const stats = [
  { number: '1000+', label: 'Happy Customers' },
  { number: '10+', label: 'Years Experience' },
  { number: '5000+', label: 'Orders Completed' },
  { number: '98%', label: 'Customer Satisfaction' }
];

const faqs = [
  { q: 'How many days does stitching take?', a: 'Standard orders take 5-7 days. Bridal and heavy maggam work may take 10-15 days depending on the design.' },
  { q: 'Do you stitch bridal blouses?', a: 'Yes! We specialize in premium bridal blouse stitching with heavy handwork, matching tassels, and custom patterns.' },
  { q: 'Can I bring my own fabric?', a: 'Absolutely. You can bring your own fabric, or choose from our curated selection of premium linings and materials.' },
  { q: 'Do you take urgent orders?', a: 'Yes, we offer express delivery (2-3 days) for select designs with an additional rush charge.' },
  { q: 'Do you alter old blouses?', a: 'Yes, we provide alteration services to ensure your existing outfits fit you perfectly again.' }
];

const testimonials = [
  { name: 'Priya Sharma', text: 'The fitting was absolutely perfect! I gave them my wedding blouse and they did a fantastic maggam work design.', rating: 5 },
  { name: 'Anitha Reddy', text: 'Very professional boutique. Their stitching quality is unmatched and they delivered right on time.', rating: 5 },
  { name: 'Meena Iyer', text: 'I love how they pay attention to the small details. The finishing and lining are premium quality.', rating: 5 }
];

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const [settings, setSettings] = useState<BusinessSettings>(
    DEFAULT_BUSINESS_SETTINGS
  );

  // Load business contact details from Firestore.
  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const data = await getBusinessSettings();

        if (mounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading home page business settings:', error);
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const phoneDigits = settings.phoneNumber.replace(/\D/g, '');
  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="flex flex-col w-full bg-background overflow-x-hidden">
      <Hero />

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 w-full bg-[#FAF8F3] overflow-hidden">
        <div className="absolute inset-0 z-0 mix-blend-multiply opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}></div>

        <div className="absolute top-0 left-0 w-64 h-64 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-flourish.png')] bg-no-repeat bg-left-top"></div>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-flourish.png')] bg-no-repeat bg-right-top" style={{ transform: 'scaleX(-1)' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-flourish.png')] bg-no-repeat bg-left-bottom" style={{ transform: 'scaleY(-1)' }}></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-flourish.png')] bg-no-repeat bg-right-bottom" style={{ transform: 'scale(-1, -1)' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif text-[#222222] mb-6 tracking-wide">The PUSHPA Experience</h2>
            <div className="w-24 h-[2px] bg-[#D4AF37] mx-auto shadow-sm"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
                whileHover={{ y: -12 }}
                className="bg-[#FFFFFF] p-10 rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-[#F5F1EA] flex flex-col items-center text-center group transition-all duration-500"
              >
                <div className="w-20 h-20 rounded-full bg-[#FAF8F3] border border-[#F5F1EA] shadow-sm flex items-center justify-center text-[#8B0000] mb-8 group-hover:scale-110 group-hover:bg-[#8B0000] group-hover:text-[#FFFFFF] transition-all duration-500">
                  <div className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-semibold mb-5 text-[#222222]">{feature.title}</h3>
                <div className="w-12 h-[1px] bg-[#D4AF37] mb-6 opacity-40 group-hover:opacity-100 group-hover:w-16 transition-all duration-500"></div>
                <p className="text-[#666666] font-sans text-base leading-relaxed px-2">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Why Choose Us */}
      <section className="py-24 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-background leading-tight">
                Why Customers Trust <br />
                <span className="text-secondary">PUSHPA TAILORS</span>
              </h2>
              <p className="text-background/80 font-sans text-lg mb-8 max-w-lg">
                We blend traditional craftsmanship with modern luxury, ensuring every stitch speaks volumes about our dedication to perfection.
              </p>
              <div className="space-y-4">
                {['Perfect Measurements', 'Premium Stitching', 'On-Time Delivery', 'Affordable Pricing', 'Personalized Designs'].map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-secondary w-6 h-6" />
                    <span className="font-sans text-background/90 text-lg">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-background/5 backdrop-blur-md border border-background/10 p-8 rounded-xl text-center">
                  <div className="text-4xl md:text-5xl font-serif font-bold text-secondary mb-2">{stat.number}</div>
                  <div className="font-sans text-sm tracking-widest uppercase text-background/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">Client Diaries</h2>
        <div className="w-24 h-1 bg-secondary mx-auto mb-16"></div>

        <div className="relative bg-card rounded-2xl shadow-xl p-8 md:p-16 border border-border/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-muted rounded-full mb-6 border-[3px] border-secondary overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${currentTestimonial}`} alt="Customer" className="w-full h-full object-cover" />
              </div>
              <div className="flex text-secondary mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-xl md:text-2xl font-serif font-light text-foreground mb-8 leading-relaxed italic">
                "{testimonials[currentTestimonial].text}"
              </p>
              <h4 className="font-sans font-semibold text-lg tracking-wide uppercase">{testimonials[currentTestimonial].name}</h4>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === currentTestimonial ? 'bg-primary scale-125' : 'bg-border hover:bg-primary/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/30 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-secondary mx-auto"></div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between font-serif text-lg text-left text-foreground hover:bg-muted/10 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0 text-muted-foreground font-sans leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-24 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-primary z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 leading-tight">
            Ready to Stitch Your Dream Blouse?
          </h2>

          <p className="text-white/80 font-sans text-lg mb-12 max-w-2xl mx-auto">
            Book an appointment today and experience the luxury of custom tailoring tailored exclusively for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] text-white px-8 py-4 rounded-full font-medium tracking-wider uppercase hover:bg-[#20b858] transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            )}

            {phoneDigits && (
              <a
                href={`tel:+${phoneDigits}`}
                className="w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-full font-medium tracking-wider uppercase hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-5 h-5" />
                Call Now
              </a>
            )}

            <Link
              to="/contact"
              className="w-full sm:w-auto bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-medium tracking-wider uppercase hover:bg-secondary/90 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}
