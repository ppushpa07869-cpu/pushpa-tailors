import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <h1 className="text-9xl font-serif text-primary mb-4">404</h1>
      <h2 className="text-3xl font-serif mb-8 text-gray-800">Page Not Found</h2>
      <p className="text-gray-500 mb-10 text-center max-w-md font-light">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="bg-primary text-white font-semibold px-8 py-3 rounded-sm uppercase tracking-widest hover:bg-black transition-colors duration-300"
      >
        Back to Home
      </Link>
    </div>
  );
}
