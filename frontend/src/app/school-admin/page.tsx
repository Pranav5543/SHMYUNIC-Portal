'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SchoolAdminAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/school-admin/dashboard');
  }, [router]);

  return (
    <div className="py-20 text-center text-xs font-bold text-gray-400">
      Redirecting to School Admin Dashboard...
    </div>
  );
}
