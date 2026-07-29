import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Scissors, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-[90] transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Scissors className="text-primary h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-2xl tracking-[0.2em] text-foreground leading-tight">PUSHPA</span>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-medium text-xs tracking-[0.3em] text-primary">TAILORS</span>
                    <span className="w-4 h-[1px] bg-secondary"></span>
                    <span className="font-sans text-[10px] tracking-widest text-muted-foreground uppercase hidden sm:block">Elegant Stitching</span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-12">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => 
                    `text-sm font-medium uppercase tracking-[0.2em] transition-all relative py-2 ${isActive ? 'text-primary' : 'text-foreground hover:text-primary'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.name}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              
              {/* Admin Login Icon */}
              <div className="relative group">
                <Link 
                  to="/admin/login" 
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/5 hover:bg-primary/10 backdrop-blur-sm transition-colors"
                >
                  <Shield className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                </Link>
                {/* Tooltip */}
                <div className="absolute top-12 right-0 bg-foreground text-background text-xs px-3 py-2 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  <p className="font-medium">Admin Login</p>
                  <p className="text-[10px] text-background/70">(Admin Only)</p>
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-foreground rotate-45"></div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-4">
              <button 
                onClick={() => setIsOpen(true)}
                className="text-foreground hover:text-primary transition-colors focus:outline-none p-2 rounded-full bg-foreground/5"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[95] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-background shadow-2xl z-[100] md:hidden flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-border">
                <span className="font-serif font-bold text-lg tracking-widest">MENU</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-foreground/5 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-grow py-8 px-6 space-y-6 overflow-y-auto">
                {links.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center justify-between text-lg font-serif tracking-wide border-b border-border/50 pb-4 ${isActive ? 'text-primary' : 'text-foreground'}`
                    }
                  >
                    {link.name}
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                ))}
              </div>

              <div className="p-6 border-t border-border bg-foreground/5 mt-auto">
                <Link 
                  to="/admin/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  ADMIN LOGIN
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
