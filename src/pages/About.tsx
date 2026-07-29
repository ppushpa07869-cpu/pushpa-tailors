import { motion } from 'framer-motion';
import { Award, Heart, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col w-full bg-background overflow-x-hidden pt-24">
      {/* Header Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-foreground text-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-secondary font-sans tracking-[0.3em] uppercase text-sm mb-4 block">Our Story</span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 tracking-wider leading-tight">Crafting Elegance, <br className="hidden md:block"/> One Stitch at a Time.</h1>
          <div className="w-24 h-1 bg-secondary mx-auto"></div>
        </motion.div>
      </section>

      {/* Story & Image */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-foreground leading-tight">A Legacy of <br/><span className="text-primary">Premium Tailoring</span></h2>
            <div className="space-y-6 text-muted-foreground font-sans text-lg leading-relaxed">
              <p>
                At <strong className="text-foreground">PUSHPA TAILORS</strong>, we believe that every outfit tells a story. With over a decade of experience in professional ladies tailoring, we have mastered the art of creating garments that not only fit perfectly but also reflect your personal elegance.
              </p>
              <p>
                Our journey started with a simple passion for fabrics and design. Today, we are proud to be a premier destination for bespoke tailoring, specializing in designer blouses, intricate maggam work, and bridal collections.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-4xl font-serif font-bold text-secondary">10+</span>
                <span className="text-sm font-sans uppercase tracking-widest text-muted-foreground">Years Experience</span>
              </div>
              <div className="w-[1px] h-12 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-4xl font-serif font-bold text-secondary">100%</span>
                <span className="text-sm font-sans uppercase tracking-widest text-muted-foreground">Custom Fit</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-2xl transform translate-x-6 translate-y-6"></div>
            <img 
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop" 
              alt="Boutique Tailoring" 
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl object-cover object-center border border-border/50"
            />
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-muted/30 px-4 sm:px-6 lg:px-8 w-full border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-card p-10 rounded-2xl shadow-xl border border-border/50 group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-4 text-foreground">Our Vision</h3>
            <p className="text-muted-foreground font-sans leading-relaxed text-sm">
              To be the most trusted and sought-after boutique tailoring brand, setting new standards in fit, design, and customer experience.
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-card p-10 rounded-2xl shadow-xl border border-border/50 group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-4 text-foreground">Our Mission</h3>
            <p className="text-muted-foreground font-sans leading-relaxed text-sm">
              To deliver uncompromising quality through meticulous craftsmanship, empowering women to feel confident and elegant in their bespoke outfits.
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-card p-10 rounded-2xl shadow-xl border border-border/50 group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-4 text-foreground">Philosophy</h3>
            <p className="text-muted-foreground font-sans leading-relaxed text-sm">
              We blend traditional techniques with contemporary fashion. We don't just stitch clothes; we weave dreams into reality with love and precision.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
