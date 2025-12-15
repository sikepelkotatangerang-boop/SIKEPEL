'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call API login dengan database
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save user to localStorage
        mockAuth.setCurrentUser(data.user);

        // Set auth cookie for middleware
        document.cookie = `auth-token=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

        router.push('/dashboard');
      } else {
        setError(data.error || 'Email atau password salah');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/background.png"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay untuk memastikan teks tetap terbaca */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-md w-full space-y-2 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-72 h-32 flex items-center justify-center">
            <Image
              src="/assets/logo_tulisan_sikepel.png"
              alt="Logo SIKEPEL"
              width={400}
              height={400}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>

        <div className="backdrop-blur-sm rounded-3xl p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                type="username"
                placeholder="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-full bg-blue-50 border-transparent focus:border-blue-300 focus:bg-white focus:ring-0 text-gray-900 placeholder-gray-500 transition-all duration-200 outline-none"
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-full bg-blue-50 border-transparent focus:border-blue-300 focus:bg-white focus:ring-0 text-gray-900 placeholder-gray-500 transition-all duration-200 outline-none pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-full text-white bg-[#0f34a3] hover:bg-[#0a267a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-lg"
            >
              <span className="absolute left-2 inset-y-2 flex items-center pl-2">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Lock className="h-4 w-4 text-blue-100 group-hover:text-white" aria-hidden="true" />
                </div>
              </span>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              2025 © Pemerintah Kota Tangerang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
