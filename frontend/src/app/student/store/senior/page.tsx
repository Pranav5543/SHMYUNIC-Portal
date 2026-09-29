'use client';

import React, { Suspense } from 'react';
import RoleGuard from '@/components/RoleGuard';
import ClassUniformListing, { ClassDivisionConfig } from '@/components/ClassUniformListing';

const seniorConfig: ClassDivisionConfig = {
  divisionKey: 'senior',
  divisionName: 'Senior Division',
  classRange: 'Classes 9–12',
  heroBadge: 'Senior Wing • Classes 9–12',
  heroTitle: 'Senior School Uniforms',
  heroDescription: 'Premium tailored formal blazers, crisp long-sleeve Oxford shirts, tailored trousers, silk-feel school ties, and crested academic essentials.',
  heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  recommendedSizes: ['32', '34', '36', '38', '40']
};

export default function SeniorUniformPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT_PARENT', 'INTERNAL_ADMIN']}>
      <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-gray-400">Loading Senior School Catalog...</div>}>
        <ClassUniformListing config={seniorConfig} />
      </Suspense>
    </RoleGuard>
  );
}
