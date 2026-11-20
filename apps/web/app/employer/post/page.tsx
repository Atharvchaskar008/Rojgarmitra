'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { ALL_SKILL_IDS, REGIONAL_TRADES } from '@rojgarmitra/shared';
import { 
  IconArrowLeft, 
  IconArrowRight, 
  IconBuilding, 
  IconCheck 
} from '@/components/icons';

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
  const [customTradeTitle, setCustomTradeTitle] = useState('');
  const [employerScale, setEmployerScale] = useState('msme_workshop');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['house_wiring']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [vacancies, setVacancies] = useState(2);
  const [salaryMin, setSalaryMin] = useState(16000);
  const [salaryMax, setSalaryMax] = useState(22000);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMr = preferredLocale === 'mr';
  const isHi = preferredLocale === 'hi';

  const currentTradeObj = REGIONAL_TRADES.find(t => t.id === selectedTrade) || REGIONAL_TRADES[0];

  const handleSkillToggle = (id: string) => {
    setRequiredSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills(prev => [...prev, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const effectiveTitle = title.trim() || (selectedTrade === 'custom' ? customTradeTitle.trim() : (currentTradeObj.names[preferredLocale] || currentTradeObj.names.en));

    const payload = {
      title: effectiveTitle,
      description,
      district,
      taluka,
      areaOrMidc,
      requiredSkillIds: requiredSkills.length > 0 ? requiredSkills : ['general_helper'],
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
        setErrorMsg(
          preferredLocale === 'mr'
            ? 'जाहिरात देण्यासाठी कृपया प्रथम नियोक्ता म्हणून लॉगिन करा.'
            : 'Please sign in as a verified employer to post vacancies.'
        );
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full">
      <div className="settle-card-hero p-5 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-steel/50">
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-steel-soft text-steel-deep rounded-full border border-steel">
              {isMr ? 'नियोक्ता • कोणतीही भरती जाहिरात द्या' : isHi ? 'नियोक्ता • कोई भी भर्ती विज्ञापन दें' : 'Employer • Post Any Vacancy'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-ink mt-2">
              {dict.employer.post_new_job}
            </h1>
            <p className="text-xs text-ink-secondary mt-1">
              {isMr 
                ? 'कोणतीही व्यक्ती, लहान व्यावसायिक, कंत्राटदार किंवा मोठा उद्योग येथे मोफत भरती जाहिरात देऊ शकतात.'
                : isHi 
                ? 'कोई भी व्यक्ति, छोटा व्यापारी, ठेकेदार या बड़ा उद्योग यहाँ निःशुल्क भर्ती विज्ञापन दे सकता है।'
                : 'Any individual, small shopkeeper, contractor, or enterprise can post open vacancies for free.'}
            </p>
          </div>
          <Link
            href="/employer"
            className="settle-pill-chip text-xs px-3.5 py-1.5 font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            <span>{dict.common.back}</span>
          </Link>
        </div>

        {errorMsg && (
          <div className="p-3 bg-alert-bg text-alert border-2 border-alert rounded-xl text-xs font-bold mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          <div>
            <label className="block font-bold text-ink mb-1.5">
              {dict.job.title} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                isMr 
                  ? 'उदा. बिलिंग असिस्टंट, वेअरहाऊस पॅकर, वेल्डर, सेल्समन, वाहन चालक...'
                  : isHi 
                  ? 'उदा. बिलिंग असिस्टेंट, वेयरहाउस पैकर, वेल्डर, सेल्समैन, वाहन चालक...'
                  : 'e.g. Billing Assistant, Warehouse Picker, Welder, Sales Executive, Driver...'
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">
              {dict.job.description} *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                isMr 
                  ? 'कामाचे नेमके स्वरूप, शिफ्ट वेळ, आवश्यक अनुभव किंवा किमान पात्रता...'
                  : isHi 
                  ? 'काम का विवरण, शिफ्ट का समय, आवश्यक अनुभव या न्यूनतम योग्यता...'
                  : 'Job responsibilities, shift timings, experience, or minimum requirements...'
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">
              {isMr 
                ? 'आस्थापनेचा प्रकार / कामाचे स्वरूप (Employer Category / Scale) *' 
                : isHi 
                ? 'प्रतिष्ठान का प्रकार / काम का स्वरूप (Employer Category / Scale) *' 
                : 'Employer Category / Scale of Establishment *'}
            </label>
            <select
              value={employerScale}
              onChange={e => setEmployerScale(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
            >
              <option value="individual_shopkeeper">
                {isMr ? 'दुकानदार / लहान व्यावसायिक / घरगुती (Shop / Small Business / Household / Trader)' : isHi ? 'दुकानदार / छोटा व्यापारी / घरेलू (Shop / Small Business / Household)' : 'Shop / Small Business / Household / Trader'}
              </option>
              <option value="msme_workshop">
                {isMr ? 'लघु व मध्यम उद्योग / वर्कशॉप (MSME Workshop / Unit / Fabrication)' : isHi ? 'लघु एवं मध्यम उद्योग / वर्कशॉप (MSME Workshop / Unit / Fabrication)' : 'MSME Workshop / Unit / Fabrication'}
              </option>
              <option value="local_contractor">
                {isMr ? 'स्थानिक कंत्राटदार / गॅरेज / सेवा केंद्र (Local Contractor / Service Agency)' : isHi ? 'स्थानीय ठेकेदार / गैराज / सेवा केंद्र (Local Contractor / Service Agency)' : 'Local Contractor / Service Agency / Garage'}
              </option>
              <option value="commercial_logistics">
                {isMr ? 'व्यापारी आस्थापना / गोदाम / ट्रान्सपोर्ट (Retail / Warehouse / Logistics)' : isHi ? 'व्यापारिक प्रतिष्ठान / गोदाम / ट्रांसपोर्ट (Retail / Warehouse / Logistics)' : 'Retail / Warehouse / Logistics Hub'}
              </option>
              <option value="service_agency">
                {isMr ? 'कार्यालय / रुग्णालय / शाळा / संस्था (Office / Healthcare / School / Agency)' : isHi ? 'कार्यालय / अस्पताल / स्कूल / संस्थान (Office / Healthcare / School / Agency)' : 'Office / Clinic / School / Institution'}
              </option>
              <option value="large_industry">
                {isMr ? 'मोठा कारखाना / औद्योगिक प्रकल्प (Large Industrial Plant / MIDC Factory)' : isHi ? 'बड़ा कारखाना / औद्योगिक संयंत्र (Large Industrial Plant / MIDC Factory)' : 'Large Industrial Plant / MIDC Factory'}
              </option>
              <option value="any_employer">
                {isMr ? 'इतर कोणताही कामाचा नियोक्ता (Any Person or Entity Offering Work)' : isHi ? 'अन्य कोई भी कार्य प्रदाता (Any Person or Entity Offering Work)' : 'Any Person or Entity Offering Work'}
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-ink mb-1.5">
                {isMr ? 'जिल्हा (District) *' : isHi ? 'ज़िला (District) *' : 'District *'}
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
              >
                <option value="Nagpur">{isMr ? 'नागपूर (Nagpur)' : isHi ? 'नागपुर (Nagpur)' : 'Nagpur'}</option>
                <option value="Wardha">{isMr ? 'वर्धा (Wardha)' : isHi ? 'वर्धा (Wardha)' : 'Wardha'}</option>
                <option value="Chandrapur">{isMr ? 'चंद्रपूर (Chandrapur)' : isHi ? 'चंद्रपुर (Chandrapur)' : 'Chandrapur'}</option>
                <option value="Amravati">{isMr ? 'अमरावती (Amravati)' : isHi ? 'अमरावती (Amravati)' : 'Amravati'}</option>
                <option value="Bhandara">{isMr ? 'भंडारा (Bhandara)' : isHi ? 'भंडारा (Bhandara)' : 'Bhandara'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-ink mb-1.5">
                {isMr ? 'तालुका (Taluka) *' : isHi ? 'तहसील (Taluka) *' : 'Taluka *'}
              </label>
              <select
                value={taluka}
                onChange={e => setTaluka(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
              >
                <option value="Nagpur Urban">{isMr ? 'नागपूर शहर (Nagpur City / Sitabuldi / Dharampeth)' : isHi ? 'नागपुर शहर (Nagpur City)' : 'Nagpur Urban'}</option>
                <option value="Butibori">{isMr ? 'बुटीबोरी (Butibori)' : isHi ? 'बुटीबोरी (Butibori)' : 'Butibori'}</option>
                <option value="Hingna">{isMr ? 'हिंगणा (Hingna)' : isHi ? 'हिंगना (Hingna)' : 'Hingna'}</option>
                <option value="Umred">{isMr ? 'उमरेड (Umred)' : isHi ? 'उमरेड (Umred)' : 'Umred'}</option>
                <option value="Kamptee">{isMr ? 'कामठी (Kamptee)' : isHi ? 'कामठी (Kamptee)' : 'Kamptee'}</option>
                <option value="Kalmeshwar">{isMr ? 'कळमेश्वर (Kalmeshwar)' : isHi ? 'कलमेश्वर (Kalmeshwar)' : 'Kalmeshwar'}</option>
                <option value="Saoner">{isMr ? 'सावनेर (Saoner)' : isHi ? 'सावनेर (Saoner)' : 'Saoner'}</option>
                <option value="Katol">{isMr ? 'काटोल (Katol)' : isHi ? 'काटोल (Katol)' : 'Katol'}</option>
                <option value="Wardha">{isMr ? 'वर्धा (Wardha)' : isHi ? 'वर्धा (Wardha)' : 'Wardha'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-ink mb-1.5">
                {isMr ? 'परिसर / चौक / MIDC' : isHi ? 'क्षेत्र / चौक / MIDC' : 'Area / Landmark / MIDC'}
              </label>
              <input
                type="text"
                value={areaOrMidc}
                onChange={e => setAreaOrMidc(e.target.value)}
                placeholder={isMr ? 'उदा. Sitabuldi / Butibori MIDC / Wadi' : isHi ? 'उदा. Sitabuldi / Butibori MIDC / Wadi' : 'e.g. Sitabuldi / Butibori MIDC / Wadi'}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">
              {isMr ? 'क्षेत्र / कामाचा प्रकार (Role Category) *' : isHi ? 'क्षेत्र / काम का प्रकार (Role Category) *' : 'Role Category *'}
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
              className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-bold text-sm"
            >
              {REGIONAL_TRADES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.names[preferredLocale] || t.names.en}
                </option>
              ))}
              <option value="custom">
                {isMr ? 'इतर / सानुकूल पद (Custom Role / Any Trade)' : isHi ? 'अन्य / कस्टम पद (Custom Role / Any Trade)' : 'Other / Custom Role (Any Trade)'}
              </option>
            </select>

            {selectedTrade === 'custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customTradeTitle}
                  onChange={e => setCustomTradeTitle(e.target.value)}
                  placeholder={
                    isMr 
                      ? 'सानुकूल पदाचे नाव लिहा (उदा. हॉटेल शेफ, लॅब बॉय, फार्म ऑपरेटर...)'
                      : isHi 
                      ? 'कस्टम पद का नाम लिखें (उदा. होटल शेफ, लैब बॉय, फार्म ऑपरेटर...)'
                      : 'Type custom title (e.g. Hotel Cook, Lab Assistant, Farm Machine Operator...)'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-primary focus:border-ink outline-none bg-white font-bold text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-ink mb-2">
              {isMr ? 'आवश्यक कौशल्ये (Required Skills) *' : isHi ? 'आवश्यक कौशल (Required Skills) *' : 'Required Skills *'}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {currentTradeObj.skills.map(s => {
                const isSelected = requiredSkills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSkillToggle(s.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                      isSelected
                        ? 'settle-pill-chip-active'
                        : 'settle-pill-chip'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {s.names[preferredLocale] || s.names.en}
                  </button>
                );
              })}

              {/* Any custom skills added by user */}
              {requiredSkills
                .filter(id => !currentTradeObj.skills.some(s => s.id === id))
                .map(customId => (
                  <button
                    key={customId}
                    type="button"
                    onClick={() => handleSkillToggle(customId)}
                    className="settle-pill-chip-active px-3.5 py-1.5 rounded-full text-xs font-semibold transition"
                  >
                    ✓ {customId} ✕
                  </button>
                ))}
            </div>

            {/* Custom Skill Input Box */}
            <div className="flex gap-2 items-center max-w-md">
              <input
                type="text"
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder={
                  isMr 
                    ? 'सानुकूल कौशल्य टाईप करा (उदा. Tally, POS Billing, Driving)...'
                    : isHi 
                    ? 'कस्टम कौशल टाइप करें (उदा. Tally, POS Billing, Driving)...'
                    : 'Type custom skill (e.g. Tally, POS Billing, Driving)...'
                }
                className="flex-1 px-3 py-1.5 rounded-xl border border-steel/80 focus:border-ink outline-none bg-white text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="settle-pill-chip px-3 py-1.5 text-xs font-bold"
              >
                {isMr ? '+ जोडा (Add)' : isHi ? '+ जोड़ें (Add)' : '+ Add'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-ink mb-1.5">
                {isMr ? 'जागा (Vacancies) *' : isHi ? 'रिक्त पद (Vacancies) *' : 'Vacancies *'}
              </label>
              <input
                type="number"
                min="1"
                max="500"
                required
                value={vacancies}
                onChange={e => setVacancies(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-ink mb-1.5">
                {isMr ? 'किमान मासिक वेतन (₹)' : isHi ? 'न्यूनतम मासिक वेतन (₹)' : 'Minimum Monthly Wage (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={salaryMin}
                onChange={e => setSalaryMin(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-ink mb-1.5">
                {isMr ? 'कमाल मासिक वेतन (₹)' : isHi ? 'अधिकतम मासिक वेतन (₹)' : 'Maximum Monthly Wage (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={salaryMax}
                onChange={e => setSalaryMax(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-steel/80 focus:border-ink outline-none bg-white font-medium text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 settle-pill-btn text-sm font-bold inline-flex items-center justify-center gap-2"
          >
            <span>
              {submitting 
                ? dict.common.loading 
                : isMr 
                ? 'जाहिरात प्रकाशित करा (Publish Job Opening) ➔' 
                : isHi 
                ? 'विज्ञापन प्रकाशित करें (Publish Job Opening) ➔' 
                : 'Publish Job Opening ➔'}
            </span>
            <IconArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
