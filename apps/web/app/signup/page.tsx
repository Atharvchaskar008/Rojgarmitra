'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=register');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-ink-secondary">
          नोंदणी व प्रवेश पानावर पुनर्निर्देशित करत आहे... (Redirecting to Unified Access...)
        </p>
      </div>
    </div>
  );
}
