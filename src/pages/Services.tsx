import { motion } from 'framer-motion';
import { Scissors, Sparkles, Gem, Baby, Ruler, Layers, ArrowRight, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  { icon: <Scissors />, title: 'Blouse Stitching', description: 'Perfectly tailored regular and designer blouses with precision fitting.', price: '₹400' },
  { icon: <Sparkles />, title: 'Designer Blouses', description: 'Custom-fitted, intricately designed blouses for sarees and lehengas.', price: '₹800' },
  { icon: <Gem />, title: 'Bridal Blouses', description: 'Premium maggam work, heavy stone embellishments, and luxury finishing.', price: '₹2500' },
  { icon: <Baby />, title: 'Kids Wear', description: 'Adorable and comfortable custom outfits for children of all ages.', price: '₹600' },
  { icon: <Ruler />, title: 'Alterations', description: 'Professional alteration services to ensure your existing outfits fit perfectly.', price: '₹100' },
  { icon: <Layers />, title: 'Pico & Fall', description: 'Neat and durable pico and fall stitching for sarees.', price: '₹150' },
  { icon: <Shirt />, title: 'Custom Orders', description: 'Bespoke dresses, kurtis, and gowns stitched to your exact preferences.', price: '₹1000' },
];

export default function Services() {
  return (
    <div className="flex flex-col w-full bg-background overflow-x-hidden pt-24">
      {/* Header Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-foreground text-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-secondary font-sans tracking-[0.3em] uppercase text-sm mb-4 block">Bespoke Tailoring</span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 tracking-wider leading-tight">Our Services</h1>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
          <p className="text-background/70 font-sans max-w-2xl mx-auto leading-relaxed">
            Experience the pinnacle of tailoring craftsmanship. From simple elegant cuts to elaborate bridal wear, our services are designed to cater to your every fashion need.
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card border border-border/50 p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-2xl group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <div className="[&>svg]:w-6 [&>svg]:h-6">
                  {service.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-serif text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8 flex-grow">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Starting at</span>
                  <span className="text-lg font-serif font-bold text-secondary">{service.price}</span>
                </div>
                
                <Link to="/contact" className="text-primary text-sm font-medium uppercase tracking-widest flex items-center gap-2 group/link">
                  Enquire
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-muted/30 px-4 sm:px-6 lg:px-8 w-full border-t border-border text-center">
        <h2 className="text-3xl font-serif text-foreground mb-6">Have a custom design in mind?</h2>
        <p className="text-muted-foreground font-sans mb-8 max-w-xl mx-auto">
          Share your reference images or sketches with us. Our master tailors will bring your vision to reality.
        </p>
        <Link 
          to="/contact" 
          className="inline-block bg-primary text-white font-medium px-8 py-4 rounded-full uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
        >
          Contact Us
        </Link>
      </section>
    </div>
  );
}
