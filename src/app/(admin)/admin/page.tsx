"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { loginAdmin, registerAdmin, checkAdminExists } from "../auth/actions";
import { Sun, Moon, Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";

// সাবমিট বাটন কম্পোনেন্ট (Spinner এবং কালার লজিকসহ)
function SubmitButton({ label, isDark }: { label: string; isDark: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full p-2.5 mt-6 rounded-xl font-bold text-[16px] md:text-[18px] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg
      ${pending ? "opacity-70 cursor-not-allowed" : ""}
      ${
        isDark
          ? "bg-white text-[#121212] hover:bg-gray-200"
          : "bg-[#121212] text-white hover:bg-gray-800"
      }`}
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : label}
    </button>
  );
}

export default function AdminAuthPage() {
  const [isAdminCreated, setIsAdminCreated] = useState<boolean | null>(null);
  const [theme, setTheme] = useState("dark");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const isDark = theme === "dark";

  useEffect(() => {
    checkAdminExists().then(setIsAdminCreated);
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
  }, []);

  const getStrengthColor = (i: number) => {
    if (password.length === 0) return isDark ? "bg-white/10" : "bg-black/10";
    if (password.length < 4) return "bg-red-500";
    if (password.length < 8) return "bg-yellow-500";
    return "bg-green-500";
  };

  const bgClass = isDark ? "bg-[#0c0c0e]" : "bg-gray-100";
  const cardBg = isDark ? "bg-[#16161a]" : "bg-white";
  
  const textColor = isDark ? "text-white" : "text-gray-800";
  const hintColor = isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400";
  const databaseText = isDark ? "text-white/40" : "text-gray-500";

  const borderInteractive = isDark
    ? "border-2 border-white/10 hover:border-white/30 focus:border-white/50 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
    : "border-2 border-black/10 hover:border-black/30 focus:border-black/50 focus:shadow-[0_0_15px_rgba(0,0,0,0.05)]";

  const inputStyle = `w-full p-3 rounded-xl border-2 bg-transparent outline-none transition-all duration-300 ${borderInteractive} ${textColor} ${hintColor} text-sm shadow-sm`;

  // রিয়েল-টাইমে স্পেস ব্লক করার হ্যান্ডলার
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, ""); 
    setUsername(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!isAdminCreated) {
      // রেজিস্ট্রেশন ভ্যালিডেশন
      const name = formData.get("name") as string;
      const company = formData.get("company") as string;
      const email = formData.get("email") as string;
      const pwd = formData.get("password") as string;
      const confirmPwd = formData.get("confirmPassword") as string;

      if (!name || !username || !company || !email || !phone || !pwd || !confirmPwd) {
        showToast.error("All fields are required!");
        return;
      }
      if (name.length < 3) {
        showToast.error("Name must be at least 3 characters long.");
        return;
      }
      if (username.length < 4) {
        showToast.error("AdminName must be at least 4 characters long.");
        return;
      }
      if (company.length < 3) {
        showToast.error("Company name must be at least 3 characters long.");
        return;
      }
      if (!email.endsWith("@aniton.com")) {
        showToast.error("Gmail address must end with @aniton.com");
        return;
      }
      if (phone.length !== 11) {
        showToast.error("Phone number must be exactly 11 digits.");
        return;
      }
      if (pwd.length < 8) {
        showToast.error("Password must be at least 8 characters long.");
        return;
      }
      if (pwd !== confirmPwd) {
        showToast.error("Passwords do not match.");
        return;
      }

      try {
        await registerAdmin(formData);
        showToast.success("Registration Successful! Please Login.");
        
        // ফর্ম রিসেট করার জন্য স্টেট ক্লিয়ার করা
        setPassword("");
        
        // সাইন-আপ সাকসেস হলে লগইন ফর্ম ওপেন করার জন্য স্টেট ট্রু করে দেওয়া হলো
        setIsAdminCreated(true); 
      } catch (err: any) {
        showToast.error(err.message || "Registration failed.");
      }
    } else {
      // লগইন ভ্যালিডেশন
      const emailOrUser = formData.get("emailOrUser") as string;
      const pwd = formData.get("password") as string;

      if (!emailOrUser || !pwd) {
        showToast.error("Please fill in all fields.");
        return;
      }

      try {
        await loginAdmin(formData);
        showToast.success("Login Successful!");
        router.push("/admin/dashboard");
      } catch (err: any) {
        showToast.error("Wrong Password or AdminName/Gmail!");
      }
    }
  };

  if (isAdminCreated === null) return null;

  return (
    <div className={`flex h-screen items-center justify-center transition-colors duration-500 ${bgClass}`}>
      <button
        onClick={toggleTheme}
        type="button"
        className={`absolute top-5 right-5 p-2 rounded-full transition-all hover:scale-110 shadow-lg ${
          isDark ? "bg-white/10" : "bg-black/10"
        }`}
      >
        {isDark ? <Sun className="text-white" size={20} /> : <Moon className="text-black" size={20} />}
      </button>

      <Card
        className={`w-[93%] max-w-[440px] border-2 mr-7 ml-7 rounded-[24px] shadow-2xl transition-all duration-300 ${
          isDark ? "border-white/5 shadow-white/5" : "border-black/5 shadow-black/10"
        } ${cardBg}`}
      >
        <CardContent className="p-8">
          {!isAdminCreated && (
            <div className="flex justify-center mb-6">
              <div
                className={`w-[100px] h-[100px] rounded-full border-[3px] transition-all ${
                  isDark ? "border-white/20" : "border-black/20"
                } flex items-center justify-center overflow-hidden`}
              >
                <img src="/developer.png" alt="Developer Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isAdminCreated ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input name="name" placeholder="Name" className={inputStyle} />
                  <input 
                    name="username" 
                    placeholder="AdminName" 
                    className={inputStyle} 
                    value={username}
                    onChange={handleUsernameChange}
                  />
                </div>
                <input name="company" placeholder="Company" className={inputStyle} />
                <input name="email" type="text" placeholder="Gmail address (@apt.com)" className={inputStyle} />
                
                <div className={`flex items-center rounded-xl border-2 bg-transparent transition-all duration-300 ${borderInteractive}`}>
                  <span className={`pl-3 pr-2 text-sm font-semibold select-none ${isDark ? "text-white/50" : "text-black/60"}`}>
                    +88
                  </span>
                  <div className={`h-6 w-[1px] ${isDark ? "bg-white/20" : "bg-black/20"}`} />
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="11 digit phone number"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`w-full p-3 bg-transparent outline-none ${textColor} ${hintColor} text-sm pl-2`}
                  />
                </div>

                <input
                  name="password"
                  type="password"
                  placeholder="Password (Min 8 chars)"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputStyle}
                />
                <div className="flex gap-1 h-1 transition-all">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 rounded ${getStrengthColor(i)}`} />
                  ))}
                </div>

                <input name="confirmPassword" type="password" placeholder="Confirm password" autoComplete="new-password" className={inputStyle} />

                <div
                  className={`p-4 rounded-xl text-xs font-mono border-2 transition-all ${
                    isDark ? "border-white/10 " : "border-black/10 "
                  } ${databaseText}`}
                >
                  DATABASE: Connected
                </div>
                <SubmitButton label="Sign Up" isDark={isDark} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mt-10 mb-6">
                  <h1 className={`font-bold text-lg ${textColor}`}>Login to your Admin Panel</h1>
                  <p className={`font-medium text-sm ${isDark ? "text-white/60" : "text-black/60"}`}>
                    To control your website
                  </p>
                </div>

                <hr className={`w-16 h-1 rounded-2xl ${isDark ? "bg-white/60" : "bg-black/60"}`} />

                <input name="emailOrUser" placeholder="Gmail address or AdminName" className={inputStyle} />
                <input name="password" type="password" placeholder="Password" autoComplete="current-password" className={inputStyle} />

                <div className="flex justify-end">
                </div>

                <SubmitButton label="Login" isDark={isDark} />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}