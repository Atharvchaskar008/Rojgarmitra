import { NextRequest, NextResponse } from 'next/server';
import { VocationalCourse } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

const VERIFIED_COURSES: VocationalCourse[] = [
  {
    id: 'course_iti_elec',
    centerId: 'iti_nagpur_gov',
    title: 'Electrician (Craftsman Training Scheme - CTS)',
    titleMr: 'इलेक्ट्रिशियन (शिल्पकार प्रशिक्षण योजना - CTS)',
    titleHi: 'इलेक्ट्रीशियन (शिल्पकार प्रशिक्षण योजना)',
    tradeId: 'electrician',
    skillIds: ['house_wiring', 'industrial_panel', 'motor_rewinding', 'transformer_maintenance'],
    durationMonths: 24,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://admission.dvet.gov.in',
    sourceUrl: 'https://admission.dvet.gov.in',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_solar_technician',
    centerId: 'iti_nagpur_gov',
    title: 'Solar Panel Installation & Maintenance Technician',
    titleMr: 'सोलर पॅनल इन्स्टॉलेशन व देखभाल तंत्रज्ञ (कुसुम योजना)',
    titleHi: 'सोलर पैनल इंस्टॉलेशन एवं रखरखाव तकनीशियन',
    tradeId: 'electrician',
    skillIds: ['solar_pv_wiring', 'house_wiring'],
    durationMonths: 6,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://mahaurja.com',
    sourceUrl: 'https://mahaurja.com/training',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_welder_cts',
    centerId: 'iti_hingna_gov',
    title: 'Welder (Gas, Electric & MIG/TIG)',
    titleMr: 'वेल्डर (गॅस, इलेक्ट्रिक आणि एमआयजी/टीआयजी)',
    titleHi: 'वेल्डर (गैस, इलेक्ट्रिक एवं एमआईजी/टीआईजी)',
    tradeId: 'welder',
    skillIds: ['arc_welding', 'mig_welding', 'tig_welding', 'gas_cutting'],
    durationMonths: 12,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://admission.dvet.gov.in',
    sourceUrl: 'https://admission.dvet.gov.in',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_machinist_cnc',
    centerId: 'iti_butibori_sub',
    title: 'CNC Lathe Machine Operator & Programmer',
    titleMr: 'सीएनसी लेथ मशिन ऑपरेटर व प्रोग्रॅमर',
    titleHi: 'सीएनसी लेथ मशीन ऑपरेटर एवं प्रोग्रामर',
    tradeId: 'fitter_turner',
    skillIds: ['cnc_operation', 'lathe_operation', 'precision_measurement'],
    durationMonths: 6,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://dvet.gov.in',
    sourceUrl: 'https://dvet.gov.in',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_tractor_mechanic',
    centerId: 'iti_umred_gov',
    title: 'Agricultural Machinery & Tractor Repair Mechanic',
    titleMr: 'कृषी यंत्रसामग्री व ट्रॅक्टर दुरुस्ती मेकॅनिक',
    titleHi: 'कृषि मशीनरी एवं ट्रैक्टर मरम्मत मैकेनिक',
    tradeId: 'mechanic',
    skillIds: ['diesel_engine_repair', 'tractor_hydraulics', 'brake_clutch_overhaul'],
    durationMonths: 12,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://admission.dvet.gov.in',
    sourceUrl: 'https://admission.dvet.gov.in',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_midc_dual_apprentice',
    centerId: 'midc_apprenticeship_butibori',
    title: 'MIDC Factory On-The-Job Apprenticeship (Earn While Learning - ₹9,500/mo Stipend)',
    titleMr: 'एमआयडीसी कारखाना प्रत्यक्ष अप्रेंटिसशिप (प्रशिक्षण व दरमहा ₹९,५०० स्टायपेंड)',
    titleHi: 'एमआईडीसी फैक्ट्री ऑन-द-जॉब अप्रेंटिसशिप (सीखने के साथ ₹९,५००/माह वजीफा)',
    tradeId: 'welder',
    skillIds: ['arc_welding', 'mig_welding', 'sheet_metal_fabrication'],
    durationMonths: 12,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://www.apprenticeshipindia.gov.in',
    sourceUrl: 'https://www.apprenticeshipindia.gov.in',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_msme_cnc_automation',
    centerId: 'msme_igtr_nagpur',
    title: 'Master Certificate in CNC Machining & CAD/CAM (MSME IGTR)',
    titleMr: 'सीएनसी मशिनिंग व सीएडी/कॅम मास्टर प्रमाणपत्र (एमएसएमई इंडो-जर्मन टूल रूम)',
    titleHi: 'सीएनसी मशीनिंग एवं सीएडी/सीएएम मास्टर सर्टिफिकेट (एमएसएमई इंडो-जर्मन टूल रूम)',
    tradeId: 'fitter_turner',
    skillIds: ['cnc_operation', 'lathe_operation', 'precision_measurement'],
    durationMonths: 6,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://msmetcnagpur.org',
    sourceUrl: 'https://msmetcnagpur.org',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_polytechnic_cdtp_electrical',
    centerId: 'polytechnic_nagpur_gov',
    title: 'Industrial Electrical Panel & Automation Maintenance (Government Polytechnic)',
    titleMr: 'औद्योगिक इलेक्ट्रिकल पॅनेल व ऑटोमेशन देखभाल (शासकीय तंत्रनिकेतन नागपूर)',
    titleHi: 'औद्योगिक इलेक्ट्रिकल पैनल व ऑटोमेशन रखरखाव (सरकारी पॉलिटेक्निक नागपुर)',
    tradeId: 'electrician',
    skillIds: ['industrial_panel', 'motor_rewinding', 'house_wiring'],
    durationMonths: 6,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://www.gpnagpur.ac.in',
    sourceUrl: 'https://www.gpnagpur.ac.in',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'course_pmkvy_solar_pv',
    centerId: 'pmkvy_nagpur_center',
    title: 'PMKVY 4.0 Suryamitra Solar PV Technician & Inverter Specialist',
    titleMr: 'सूर्यमित्र सोलर पीव्ही तंत्रज्ञ व इन्व्हर्टर स्पेशालिस्ट (PMKVY मोफत प्रशिक्षण + टूलकिट)',
    titleHi: 'सूर्यमित्र सोलर पीवी तकनीशियन एवं इन्वर्टर विशेषज्ञ (PMKVY नि:शुल्क + टूलकिट)',
    tradeId: 'electrician',
    skillIds: ['solar_pv_wiring', 'house_wiring'],
    durationMonths: 3,
    fees: 0,
    enrollmentStatus: 'open',
    officialEnrollUrl: 'https://www.pmkvyofficial.org',
    sourceUrl: 'https://www.pmkvyofficial.org',
    lastCheckedAt: '2026-11-19T06:00:00.000Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tradeId = searchParams.get('tradeId')?.toLowerCase();
    const missingSkill = searchParams.get('missingSkill')?.toLowerCase();

    let courses = [...VERIFIED_COURSES];

    if (tradeId) {
      courses = courses.filter(c => c.tradeId.toLowerCase() === tradeId);
    }

    if (missingSkill) {
      // Find courses that teach this specific missing skill!
      courses = courses.filter(c => c.skillIds.some(s => s.toLowerCase() === missingSkill));
    }

    return NextResponse.json({
      data: courses,
      meta: {
        total: courses.length,
        filterTrade: tradeId || null,
        filterMissingSkill: missingSkill || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}
