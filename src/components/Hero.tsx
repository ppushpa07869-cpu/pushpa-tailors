import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative bg-black text-white min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-primary/10 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0"></div>
      
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto w-full">
        <h1 className="text-5xl md:text-7xl font-serif text-secondary mb-4 tracking-wider">
          PUSHPA TAILORS
        </h1>
        <p className="text-xl md:text-3xl font-light mb-12 italic text-gray-200">
          Professional Ladies Tailoring
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 text-lg">
          <div className="border border-secondary/50 p-6 rounded-sm backdrop-blur-md bg-black/40 hover:bg-primary/20 transition-colors duration-300">
            <span className="font-serif font-semibold tracking-wide text-secondary">Designer Blouses</span>
          </div>
          <div className="border border-secondary/50 p-6 rounded-sm backdrop-blur-md bg-black/40 hover:bg-primary/20 transition-colors duration-300">
            <span className="font-serif font-semibold tracking-wide text-secondary">Machine Work</span>
          </div>
          <div className="border border-secondary/50 p-6 rounded-sm backdrop-blur-md bg-black/40 hover:bg-primary/20 transition-colors duration-300">
            <span className="font-serif font-semibold tracking-wide text-secondary">Stone Work</span>
          </div>
          <div className="border border-secondary/50 p-6 rounded-sm backdrop-blur-md bg-black/40 hover:bg-primary/20 transition-colors duration-300">
            <span className="font-serif font-semibold tracking-wide text-secondary">Patch Work</span>
          </div>
        </div>

        <Link 
          to="/contact" 
          className="inline-block bg-secondary text-black font-semibold px-10 py-4 rounded-sm uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
        >
          Book an Appointment
        </Link>
      </div>
    </div>
  );
}
