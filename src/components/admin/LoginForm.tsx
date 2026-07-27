import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const persistence = data.rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      if (error.code) {
        setAuthError(`${error.code} - ${error.message}`);
      } else {
        setAuthError(error.message || 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-sm shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-primary tracking-wider mb-2">Admin Login</h2>
        <p className="text-gray-500 font-light text-sm">Secure portal for Pushpa Tailors</p>
      </div>

      {authError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-primary text-primary text-sm font-medium">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            {...register('email')}
            className={`w-full border ${errors.email ? 'border-primary' : 'border-gray-300'} px-4 py-3 rounded-sm focus:ring-secondary focus:border-secondary outline-none transition-colors`}
            placeholder="admin@pushpatailors.com"
          />
          {errors.email && <p className="text-primary text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              {...register('password')}
              className={`w-full border ${errors.password ? 'border-primary' : 'border-gray-300'} px-4 py-3 rounded-sm focus:ring-secondary focus:border-secondary outline-none transition-colors pr-12`}
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-primary text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input 
              id="rememberMe" 
              type="checkbox" 
              {...register('rememberMe')}
              className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded-sm"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-black transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-black text-white font-semibold py-4 rounded-sm hover:bg-primary transition-colors duration-300 tracking-widest uppercase flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
}
