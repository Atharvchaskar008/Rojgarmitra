import { describe, it, expect, vi } from 'vitest';
import { RegionalRagService, EvidenceDocument } from '../../apps/web/src/lib/services/regional-rag';
import { adminDb } from '../../apps/web/src/lib/firebase/admin';

describe('RegionalRagService Retrieval Ordering Regression Test', () => {
  it('retrieves documents added dynamically to Firestore before allDocs is evaluated', async () => {
    const ragService = new RegionalRagService();

    const mockDoc: EvidenceDocument = {
      id: 'ev_dynamic_solar_butibori',
      evidenceType: 'vocational_course',
      title: 'Solar PV Installation Workshop Butibori',
      sourceUrl: 'https://dvet.gov.in/solar-workshop-butibori',
      content: 'Hands-on certified rooftop solar PV installation program in Butibori MIDC.',
      tradeTags: ['electrician', 'solar_technician'],
      skillTags: ['solar_pv_wiring', 'inverter_setup'],
      geographicMetadata: {
        district: 'Nagpur',
        taluka: 'Butibori',
        areaOrMidc: 'Butibori MIDC',
      },
      verificationStatus: 'verified',
      confidence: 'high',
      retrievedAt: new Date().toISOString(),
    };

    // Store directly or mock Firestore collection get
    const originalGet = adminDb.collection;
    const fakeCollection = vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        empty: false,
        forEach: (cb: (doc: { id: string; data: () => EvidenceDocument }) => void) => {
          cb({ id: mockDoc.id, data: () => mockDoc });
        },
      }),
    });
    // @ts-ignore
    adminDb.collection = fakeCollection;

    try {
      const results = await ragService.retrieveEvidence({
        trade: 'solar_technician',
        taluka: 'Butibori',
        district: 'Nagpur',
      });

      // The dynamically fetched document must be present in retrieved results
      expect(results.some((doc) => doc.id === mockDoc.id)).toBe(true);
      const matched = results.find((doc) => doc.id === mockDoc.id);
      expect(matched?.title).toBe('Solar PV Installation Workshop Butibori');
    } finally {
      // @ts-ignore
      adminDb.collection = originalGet;
    }
  });
});
