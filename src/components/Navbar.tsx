"use client";
import React from 'react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter flex items-center gap-1 text-[#0f172a]">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-2 py-0.5 rounded italic">DEMO</span>
              TOPUP
            </span>
          </div>

          {/* Menus */}
          <div className="hidden md:flex space-x-6 text-[13px] font-semibold text-gray-600">
            <span className="cursor-pointer hover:text-blue-600 transition">Uid Topup ▾</span>
            <span className="cursor-pointer hover:text-blue-600 transition">Vouchers ▾</span>
            <span className="cursor-pointer hover:text-blue-600 transition">Topup ▾</span>
            <span className="cursor-pointer hover:text-blue-600 transition">Contact</span>
          </div>

          {/* Login Button */}
          <button className="bg-[#2563eb] hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold tracking-wide transition shadow-sm">
            Login
          </button>

        </div>
      </div>
    </nav>
  );
}