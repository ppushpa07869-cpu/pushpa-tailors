import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/admin/LoginForm';
import { useAuth } from '../../contexts/AuthContext';
import { Scissors } from 'lucide-react';

export default function Login() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, loading, navigate]);

  if (loading) return null; // or a full page spinner

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[40vh] bg-black"></div>
        <div className="absolute top-[39.5vh] left-0 w-full h-[1vh] bg-secondary"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center mb-8">
        <div className="bg-white p-4 rounded-full shadow-lg mb-4">
          <Scissors className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-center text-3xl font-serif font-extrabold text-white tracking-widest">
          PUSHPA TAILORS
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}
