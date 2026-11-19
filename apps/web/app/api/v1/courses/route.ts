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
