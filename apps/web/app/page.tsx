import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
          <span>🌾 YCCE HackKumbh 2026</span>
          <span>•</span>
          <span>नागपूर, बुटीबोरी व ग्रामीण विदर्भ</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          रोजगारमित्र <span className="text-emerald-600">RojgarMitra</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 font-medium">
          स्थानिक कौशल्ये • प्रत्यक्ष रोजगार • कौशल्य विकास<br/>
          <span className="text-slate-500 text-base">Local Skills. Real Opportunities. Skill Development.</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <Link
            href="/candidate"
            className="flex flex-col items-center p-6 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm hover:shadow-md transition hover:border-emerald-600 text-left"
          >
            <span className="text-3xl mb-2">👷‍♂️</span>
            <span className="text-xl font-bold text-slate-900">मी नोकरी शोधत आहे</span>
            <span className="text-sm text-slate-500">Candidate / Job Seeker</span>
            <span className="mt-3 text-xs font-semibold text-emerald-600">नोंदणी करा व नोकऱ्या शोधा →</span>
          </Link>

          <Link
            href="/employer"
            className="flex flex-col items-center p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition hover:border-slate-400 text-left"
          >
            <span className="text-3xl mb-2">🏭</span>
            <span className="text-xl font-bold text-slate-900">मला कामगार हवे आहेत</span>
            <span className="text-sm text-slate-500">Employer / Business Owner</span>
            <span className="mt-3 text-xs font-semibold text-slate-700">कामगारांची भरती करा →</span>
          </Link>
        </div>

        <div className="pt-4 text-xs text-slate-400">
          मराठी • हिन्दी • English | आधार किंवा इंग्रजी बायोडाटाची सक्ती नाही
        </div>
      </div>
    </main>
  );
}
