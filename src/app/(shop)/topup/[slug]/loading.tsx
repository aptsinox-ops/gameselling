export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto px-3 py-6 space-y-10 min-h-screen font-sans select-none pointer-events-none">
      
      {/* ১. ব্যানার সেকশন শিমার */}
      <div className="w-full h-[140px] md:h-[160px] rounded-lg bg-slate-200 animate-pulse flex items-center p-4">
        <div className="flex items-center space-x-4 w-full">
          {/* ইমেজ স্কয়ার */}
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg bg-slate-300" />
          {/* টেক্সট লাইন */}
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-300 rounded w-1/3 md:w-1/4" />
            <div className="h-4 bg-slate-300 rounded w-1/4 md:w-1/6" />
          </div>
        </div>
      </div>

      {/* ২. সিলেক্ট রিচার্জ (ভ্যারিয়েশন) সেকশন শিমার */}
      <section className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 animate-pulse">
        {/* হেডার টাইটেল */}
        <div className="h-5 bg-slate-200 rounded w-1/4 mb-6" />
        {/* গ্রিড আইটেম */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="h-16 bg-slate-200 rounded-lg" />
          <div className="h-16 bg-slate-200 rounded-lg" />
        </div>
      </section>

      {/* ৩. অ্যাকাউন্ট ইনফো সেকশন শিমার */}
      <section className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 animate-pulse">
        {/* হেডার টাইটেল */}
        <div className="h-5 bg-slate-200 rounded w-1/5 mb-6" />
        {/* ইনপুট ফিল্ড প্লেসহোল্ডার */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-11 bg-slate-200 rounded-lg w-full" />
        </div>
        {/* বাটন প্লেসহোল্ডার */}
        <div className="h-10 bg-slate-200 rounded-lg w-full mt-2" />
      </section>

      {/* ৪. পেমেন্ট মেথড সেকশন শিমার */}
      <section className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 animate-pulse">
        {/* হেডার টাইটেল */}
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-6" />
        {/* পেমেন্ট কার্ড গ্রিড */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-slate-200 rounded-lg" />
          <div className="h-20 bg-slate-200 rounded-lg" />
        </div>
        {/* নিচে ব্যালেন্স লাইনের শিমার */}
        <div className="space-y-3 mt-6">
          <div className="h-10 bg-slate-100 border border-slate-200/50 rounded-lg w-full" />
          <div className="h-10 bg-slate-100 border border-slate-200/50 rounded-lg w-full" />
        </div>
      </section>

    </main>
  );
}