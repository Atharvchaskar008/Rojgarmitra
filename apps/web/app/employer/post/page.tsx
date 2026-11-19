'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { ALL_SKILL_IDS, REGIONAL_TRADES } from '@rojgarmitra/shared';

export default function EmployerPostJobPage() {
  const router = useRouter();
  const { preferredLocale, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Nagpur');
  const [taluka, setTaluka] = useState('Butibori');
  const [areaOrMidc, setAreaOrMidc] = useState('Butibori MIDC Phase 2');
  const [selectedTrade, setSelectedTrade] = useState('electrician');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['house_wiring']);
  const [vacancies, setVacancies] = useState(2);
  const [salaryMin, setSalaryMin] = useState(16000);
  const [salaryMax, setSalaryMax] = useState(22000);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentTradeObj = REGIONAL_TRADES.find(t => t.id === selectedTrade) || REGIONAL_TRADES[0];

  const handleSkillToggle = (id: string) => {
    setRequiredSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      title,
      description,
      district,
      taluka,
      areaOrMidc,
      requiredSkillIds: requiredSkills,
      mandatoryCertificationIds: [],
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      salaryPeriod: 'monthly',
      vacancies: Number(vacancies),
      sourceType: 'internal_employer',
    };

    try {
      const token = await getIdToken();
      if (!token) {
        setErrorMsg('Please sign in as a verified employer to post vacancies.');
        setSubmitting(false);
        return;
      }
      const res = await fetch('/api/v1/employer/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        router.push('/employer');
      } else {
        setErrorMsg(json.error?.message || dict.common.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || dict.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              नियोक्ता • Post Vacancy
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              {dict.employer.post_new_job}
            </h1>
          </div>
          <Link
            href="/employer"
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            ← {dict.common.back}
          </Link>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {dict.job.title} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="उदा. औद्योगिक इलेक्ट्रिशियन (Industrial Electrician)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {dict.job.description} *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="कामाचे स्वरूप, वेळ आणि आवश्यक अनुभव..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                जिल्हा (District) *
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Nagpur">नागपूर (Nagpur)</option>
                <option value="Wardha">वर्धा (Wardha)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                तालुका (Taluka) *
              </label>
              <select
                value={taluka}
                onChange={e => setTaluka(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Butibori">बुटीबोरी (Butibori)</option>
                <option value="Hingna">हिंगणा (Hingna)</option>
                <option value="Umred">उमरेड (Umred)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                परिसर / MIDC
              </label>
              <input
                type="text"
                value={areaOrMidc}
                onChange={e => setAreaOrMidc(e.target.value)}
                placeholder="उदा. Butibori MIDC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ट्रेड / व्यवसाय प्रकार *
            </label>
            <select
              value={selectedTrade}
              onChange={e => {
                setSelectedTrade(e.target.value);
                const nextT = REGIONAL_TRADES.find(t => t.id === e.target.value);
                if (nextT && nextT.skills.length > 0) {
                  setRequiredSkills([nextT.skills[0].id]);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
            >
              {REGIONAL_TRADES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.names[preferredLocale] || t.names.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">
              आवश्यक कौशल्ये (Required Skills) *
            </label>
            <div className="flex flex-wrap gap-2">
              {currentTradeObj.skills.map(s => {
                const isSelected = requiredSkills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSkillToggle(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {s.names[preferredLocale] || s.names.en}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                जागा (Vacancies) *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                required
                value={vacancies}
                onChange={e => setVacancies(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                किमान वेतन (₹)
              </label>
              <input
                type="number"
                min="0"
                value={salaryMin}
                onChange={e => setSalaryMin(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                कमाल वेतन (₹)
              </label>
              <input
                type="number"
                min="0"
                value={salaryMax}
                onChange={e => setSalaryMax(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
          >
            {submitting ? dict.common.loading : 'जाहिरात प्रकाशित करा (Publish Job Opening)'}
          </button>
        </form>
      </div>
    </main>
  );
}
