import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);

    const snapshot = await adminDb
      .collection('notifications')
      .where('recipientUid', '==', user.uid)
      .limit(30)
      .get();

    const notifications: any[] = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    // In-memory sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      const snap = await adminDb
        .collection('notifications')
        .where('recipientUid', '==', user.uid)
        .where('isRead', '==', false)
        .get();

      const batch = adminDb.batch();
      snap.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });
      await batch.commit();

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      const notifRef = adminDb.collection('notifications').doc(notificationId);
      const snap = await notifRef.get();
      if (snap.exists && snap.data()?.recipientUid === user.uid) {
        await notifRef.update({ isRead: true });
      }
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Missing parameters' } }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
