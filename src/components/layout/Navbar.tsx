import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Scissors } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white text-black shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <Scissors className="text-primary h-8 w-8" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-widest text-primary leading-none">PUSHPA</span>
                <span className="font-sans font-medium text-xs tracking-[0.3em] text-secondary">TAILORS</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => 
                  `text-sm font-semibold uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'hover:text-secondary'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `block px-3 py-3 text-base font-medium uppercase tracking-widest rounded-sm ${isActive ? 'text-primary bg-primary/5' : 'hover:text-secondary hover:bg-secondary/5'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
