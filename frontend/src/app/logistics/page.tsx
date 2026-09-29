'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogisticsAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/operations/dashboard');
  }, [router]);

  return (
    <div className="py-20 text-center text-xs font-bold text-gray-400">
      Redirecting to Fulfillment & Logistics Dashboard...
    </div>
  );
}
