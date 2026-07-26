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
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (status === 'authenticated') return null;

  // 🟢 CASE 1: শুধুমাত্র OAUTH সক্রিয় থাকলে Google UI দেখাবে
  if (loginSystem === 'OAUTH') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="relative w-full max-w-sm rounded-[32px] p-[1.5px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-[0_10px_30px_rgba(66,133,244,0.15)] mt-6">
          <div className="relative w-full bg-white rounded-[30.5px] pt-12 pb-8 px-6 flex flex-col items-start text-left">
            <div className="absolute -top-10 left-8 w-20 h-20 bg-white rounded-full border border-gray-200 flex items-center justify-center">
              <GoogleIcon className="w-10 h-10" />
            </div>

            <div className="flex items-center gap-2.5 mb-3 mt-2">
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Your data is Protected
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-8">
              We never store your Google password. Your login is handled securely through Google's authentication system.
            </p>

            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              style={{ backgroundColor: dynamicColor || '#0082FF' }}
              className="w-full text-white font-bold py-3.5 px-4 rounded-full transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_25px_rgba(66,133,244,0.45)] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <GoogleIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm tracking-wider uppercase font-extrabold">
                Continue with Google
              </span>
            </button>

            <div className="w-full border-t border-gray-100 my-7" />

            <div className="grid grid-cols-3 w-full gap-2">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 bg-emerald-100/70 text-emerald-600 rounded-full flex items-center justify-center mb-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-gray-500">Secure</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-9 bg-blue-100/70 text-blue-600 rounded-full flex items-center justify-center mb-1.5">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h7v8l10-12h-7V2z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-gray-500">Fast</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-9 bg-purple-100/70 text-purple-600 rounded-full flex items-center justify-center mb-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-gray-500">Private</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    );
  }

  // 🟢 CASE 2: MANUAL অথবা OAUTH_MANUAL থাকলে এই ফর্ম দেখাবে
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-6 text-sm">Please login to your account.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800" 
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
              className="w-full border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-gray-700 cursor-pointer"
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