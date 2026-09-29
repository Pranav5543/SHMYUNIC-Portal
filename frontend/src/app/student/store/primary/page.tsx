'use client';

import React, { Suspense } from 'react';
import RoleGuard from '@/components/RoleGuard';
import ClassUniformListing, { ClassDivisionConfig } from '@/components/ClassUniformListing';

const primaryConfig: ClassDivisionConfig = {
  divisionKey: 'primary',
  divisionName: 'Primary Division',
  classRange: 'Classes 1–5',
  heroBadge: 'Primary Wing • Classes 1–5',
  heroTitle: 'Primary School Uniforms',
  heroDescription: 'Comfortable, durable, and stain-resistant daily shirts, skirts, trousers, PE sportswear, and crested essentials designed for growing primary students.',
  heroImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=80',
  recommendedSizes: ['24', '26', '28', '30', '32']
};

export default function PrimaryUniformPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT_PARENT', 'INTERNAL_ADMIN']}>
      <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-gray-400">Loading Primary Uniform Catalog...</div>}>
        <ClassUniformListing config={primaryConfig} />
      </Suspense>
    </RoleGuard>
  );
}
