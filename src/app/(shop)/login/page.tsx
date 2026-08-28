"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { toast } from "sonner"; 

const SuccessIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center bg-green-500 rounded-full text-white shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  </div>
);

const ErrorIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </div>
);

const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const { status } = useSession(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dynamicColor, setDynamicColor] = useState('#2563eb'); 
  const [loginSystem, setLoginSystem] = useState<string>('OAUTH_MANUAL');
  const [isCheckingSettings, setIsCheckingSettings] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/profile');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const siteSettings = await res.json();
          const data = siteSettings?.data || siteSettings;

          if (data?.primaryColor) {
            setDynamicColor(data.primaryColor);
          }
          if (data?.loginSystem) {
            setLoginSystem(data.loginSystem);
          }
        }
      } catch (error) {
        console.error("Failed to load settings on login page:", error);
      } finally {
        setIsCheckingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast("Please fill in all fields correctly.", { icon: <ErrorIcon /> });
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        toast("Invalid email or password! Please try again.", { icon: <ErrorIcon /> });
      } else {
        toast("Login successful! Redirecting...", { icon: <SuccessIcon /> });
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err) {
      toast("Something went wrong during login. Please try again.", { icon: <ErrorIcon /> });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || isCheckingSettings) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (status === 'authenticated') return null;

  // 🟢 CASE 1: শুধুমাত্র OAUTH সক্রিয় থাকলে প্রফেশনাল Google UI দেখাবে
  if (loginSystem === 'OAUTH') {
    return (
      <main className="py-6 sm:py-10 px-4 flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="relative w-full max-w-sm rounded-[28px] p-[1.5px] bg-gradient-to-br from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
          <div className="relative w-full bg-white rounded-[26.5px] p-6 sm:p-7 flex flex-col items-center text-center">
            
            {/* Google Top Avatar / Icon */}
            <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-3.5 shadow-sm">
              <GoogleIcon className="w-7 h-7" />
            </div>

            {/* Welcome Back Pill Tag */}
            <span className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 rounded-full mb-2">
              Welcome Back 👋
            </span>

            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
              Sign in to Account
            </h1>
            <p className="text-xs text-gray-500 mb-5 max-w-[260px] leading-relaxed">
              Fast, private, and secure authentication powered by Google.
            </p>

            {/* Security Feature Box */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-5 text-left flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 mb-0.5">Your data is Protected</h4>
                <p className="text-[11px] text-gray-500 leading-snug">
                  We never store your passwords. Authentication is handled directly via Google.
                </p>
              </div>
            </div>

            {/* Main Action Button */}
            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              style={{ backgroundColor: dynamicColor || '#0082FF' }}
              className="w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 hover:opacity-95 hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer group mb-5"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
                <GoogleIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm tracking-wide font-extrabold uppercase">
                Continue with Google
              </span>
            </button>

            {/* Bottom Security Trust Badges */}
            <div className="w-full border-t border-gray-100 pt-4">
              <div className="grid grid-cols-3 w-full gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">Secure</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-1">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h7v8l10-12h-7V2z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">Fast</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">Private</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    );
  }

  // 🟢 CASE 2: MANUAL অথবা OAUTH_MANUAL থাকলে এই ফর্ম দেখাবে
  return (
    <main className="py-6 sm:py-10 px-4 flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Welcome Back</h1>
        <p className="text-gray-500 mb-6 text-sm">Please login to your account.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800 text-sm" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800 text-sm" 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: dynamicColor,
              opacity: loading ? 0.6 : 1
            }}
            className={`w-full text-white font-bold p-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
              loading ? 'cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : 'Login'}
          </button>
        </form>

        {/* 🟢 শুধুমাত্র loginSystem "MANUAL" না হলেই (অর্থাৎ OAUTH_MANUAL হলে) Google Option দেখাবে */}
        {loginSystem !== 'MANUAL' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or</span></div>
            </div>

            {/* Google Sign In Button */}
            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-gray-700 cursor-pointer text-sm"
            >
              <GoogleIcon className="w-5 h-5" />
              Login with Google
            </button>
          </>
        )}
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" style={{ color: dynamicColor }} className="font-bold hover:underline">Sign Up</a>
        </p>
      </div>
    </main>
  );
}