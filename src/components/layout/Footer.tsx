import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t-[6px] border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Scissors className="text-secondary h-8 w-8" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-widest text-white leading-none">PUSHPA</span>
                <span className="font-sans font-medium text-xs tracking-[0.3em] text-secondary">TAILORS</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Professional Ladies Tailoring. We specialize in bringing your dream outfits to life with our premium designer blouses, machine work, stone work, and intricate patch work.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-secondary text-xl mb-6 tracking-wider">Quick Links</h3>
            <ul className="space-y-4 text-sm text-gray-300 font-medium tracking-wide">
              <li><Link to="/" className="hover:text-secondary transition-colors uppercase">Home</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition-colors uppercase">About Us</Link></li>
              <li><Link to="/services" className="hover:text-secondary transition-colors uppercase">Services</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors uppercase">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-secondary text-xl mb-6 tracking-wider">Visit Us</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="leading-relaxed">
                Experience the perfect fit. Visit our boutique for personalized tailoring services.
              </li>
              <li>
                <strong className="block text-white mb-1">Working Hours:</strong>
                Mon - Sat: 10:00 AM - 8:00 PM<br/>
                Sunday: Closed
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500 tracking-wider">
          &copy; {new Date().getFullYear()} PUSHPA TAILORS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
