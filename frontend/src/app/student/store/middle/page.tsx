'use client';

import React, { Suspense } from 'react';
import RoleGuard from '@/components/RoleGuard';
import ClassUniformListing, { ClassDivisionConfig } from '@/components/ClassUniformListing';

const middleConfig: ClassDivisionConfig = {
  divisionKey: 'middle',
  divisionName: 'Middle Division',
  classRange: 'Classes 6–8',
  heroBadge: 'Middle Wing • Classes 6–8',
  heroTitle: 'Middle School Uniforms',
  heroDescription: 'Tailored Oxford shirts, pleated trousers, box-pleated skirts, knitted sweaters, and athletic PE gear designed for active middle school students.',
  heroImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
  recommendedSizes: ['28', '30', '32', '34', '36']
};

export default function MiddleUniformPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT_PARENT', 'INTERNAL_ADMIN']}>
      <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-gray-400">Loading Middle School Catalog...</div>}>
        <ClassUniformListing config={middleConfig} />
      </Suspense>
    </RoleGuard>
  );
}
