'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vendor/dashboard');
  }, [router]);

  return (
    <div className="py-20 text-center text-xs font-bold text-gray-400">
      Redirecting to Vendor Partner Dashboard...
    </div>
  );
}
