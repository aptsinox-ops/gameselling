"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"; 
import { signIn, useSession } from "next-auth/react";

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

export default function RegisterPage() {
  const { status } = useSession(); 
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicColor, setDynamicColor] = useState('#2563eb'); 
  const [loginSystem, setLoginSystem] = useState<string>('OAUTH_MANUAL'); // 🟢 State যুক্ত করা হলো
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
            setLoginSystem(data.loginSystem); // 🟢 State আপডেট করা হলো
            
            // যদি শুধুমাত্র "OAUTH" সেটিং থাকে, রেজিস্টার পেজ বন্ধ রেখে সরাসরি /login এ পাঠাবে
            if (data.loginSystem === "OAUTH") {
              router.push('/login');
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to load settings on register page:", error);
      } finally {
        setIsCheckingSettings(false);
      }
    }

    fetchSettings();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const target = e.target as typeof e.target & {
      name: { value: string };
      phone: { value: string };
      email: { value: string };
      password: { value: string };
      retypePassword: { value: string };
    };

    const name = target.name.value.trim();
    const phone = target.phone.value.trim();
    const email = target.email.value.trim();
    const password = target.password.value;
    const retypePassword = target.retypePassword.value;

    if (!name || !phone || !email || !password || !retypePassword) {
      toast("Please fill in all fields correctly.", { icon: <ErrorIcon /> });
      return;
    }

    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      toast("Mobile number must be exactly 11 digits.", { icon: <ErrorIcon /> });
      return;
    }

    if (!email.includes('@')) {
      toast("Please provide a valid email address (e.g., example@gmail.com).", { icon: <ErrorIcon /> });
      return;
    }

    if (password.length < 8) {
      toast("Password must be at least 8 characters long.", { icon: <ErrorIcon /> });
      return;
    }

    if (password !== retypePassword) {
      toast("Password and Retype Password do not match!", { icon: <ErrorIcon /> });
      return;
    }

    setIsLoading(true);

    const formData = { name, phone, email, password, balance: 0 };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast("Registration successful! Logging you in...", { icon: <SuccessIcon /> });
        
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: email,
          password: password,
        });

        if (loginRes?.error) {
          toast("Auto-login failed. Please login manually.", { icon: <ErrorIcon /> });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          toast("Logged in successfully!", { icon: <SuccessIcon /> });
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1500);
        }
      } else {
        const errorMsg = data.message ? data.message.toLowerCase() : "";

        if (errorMsg.includes("email") && errorMsg.includes("phone")) {
          toast("This account is already registered!", { icon: <ErrorIcon /> });
        } else if (errorMsg.includes("email") || errorMsg.includes("gmail")) {
          toast("This Gmail is already registered!", { icon: <ErrorIcon /> });
        } else if (errorMsg.includes("phone") || errorMsg.includes("mobile") || errorMsg.includes("number")) {
          toast("This Phone Number is already registered!", { icon: <ErrorIcon /> });
        } else {
          toast(data.message || "This Account is already Registered.", { icon: <ErrorIcon /> });
        }
        
        setIsLoading(false);
      }
    } catch (error) {
      toast("Network error! Please try again.", { icon: <ErrorIcon /> });
      setIsLoading(false);
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Create an Account</h1>
        <p className="text-gray-500 mb-6 text-sm">Sign up to get the latest updates.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            name="name" 
            placeholder="Full Name" 
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800 focus:shadow-sm" 
          />
          <input 
            name="phone" 
            placeholder="Phone Number (11 Digits)" 
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800 focus:shadow-sm" 
          />
          <input 
            name="email" 
            type="text" 
            placeholder="Email Address" 
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800 focus:shadow-sm" 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password (Min. 8 digits)" 
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800 focus:shadow-sm" 
          />
          
          <input 
            name="retypePassword" 
            type="password" 
            placeholder="Retype Password" 
            onFocus={(e) => (e.target.style.borderColor = dynamicColor)}
            onBlur={(e) => (e.target.style.borderColor = '')}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none transition text-gray-800 focus:shadow-sm" 
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              backgroundColor: dynamicColor,
              opacity: isLoading ? 0.6 : 1
            }}
            className={`w-full text-white font-bold p-3 rounded-lg transition duration-200 shadow-md flex items-center justify-center gap-2 ${
              isLoading ? 'cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : 'Sign Up'}
          </button>
        </form>

        {/* 🟢 শুধুমাত্র loginSystem "MANUAL" না হলেই Google Option দেখাবে */}
        {loginSystem !== 'MANUAL' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or</span></div>
            </div>

            {/* Google Sign Up Button */}
            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-gray-700 cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" style={{ color: dynamicColor }} className="font-bold hover:underline">
            Login now
          </a>
        </p>
      </div>
    </main>
  );
}