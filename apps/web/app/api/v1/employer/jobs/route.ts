import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { CreateJobPostingSchema, JobPosting } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['employer', 'admin']);

    const snapshot = await adminDb
      .collection('jobs')
      .where('employerUid', '==', user.uid)
      .get();

    const jobs: JobPosting[] = [];
    snapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() } as JobPosting);
    });

    // Sort descending by createdAt
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      data: jobs,
      meta: { count: jobs.length },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['employer', 'admin']);

    const body = await req.json();
    const validated = CreateJobPostingSchema.parse(body);

    // Get employer profile for verified business name
    let employerName = 'RojgarMitra Employer';
    const employerDoc = await adminDb.collection('employers').doc(user.uid).get();
    if (employerDoc.exists && employerDoc.data()?.businessName) {
      employerName = employerDoc.data()!.businessName;
    }

    const now = new Date().toISOString();
    const jobRef = adminDb.collection('jobs').doc();

    const newJob: JobPosting = {
      id: jobRef.id,
      employerUid: user.uid,
      employerName,
      title: validated.title,
      description: validated.description,
      district: validated.district,
      taluka: validated.taluka,
      areaOrMidc: validated.areaOrMidc,
      requiredSkillIds: validated.requiredSkillIds,
      mandatoryCertificationIds: validated.mandatoryCertificationIds || [],
      salaryMin: validated.salaryMin,
      salaryMax: validated.salaryMax,
      salaryPeriod: validated.salaryPeriod,
      vacancies: validated.vacancies,
      status: 'open',
      sourceType: validated.sourceType || 'internal_employer',
      createdAt: now,
      updatedAt: now,
    };

    await jobRef.set(newJob);

    return NextResponse.json(
      {
        data: newJob,
        message: 'Job vacancy created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
