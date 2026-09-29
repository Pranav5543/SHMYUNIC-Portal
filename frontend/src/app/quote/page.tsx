'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { submitBulkQuote } from '@/services/api';

export default function RequestBulkQuotePage() {
  const { showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState('500');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsedQty = parseInt(quantity.replace(/[^0-9]/g, '')) || 500;
      const res = await submitBulkQuote({
        orgName,
        contactName,
        email,
        phone,
        quantity: parsedQty,
        notes
      });
      setSubmitting(false);
      if (res.quote) {
        setSubmitted(true);
        showToast('Bulk quote inquiry submitted successfully!');
      } else {
        showToast(res.error || 'Failed to submit bulk quote request');
      }
    } catch (err) {
      setSubmitting(false);
      showToast('Error submitting bulk quote inquiry');
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 w-full font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">Institutional B2B Procurement</span>
          <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">Request Institutional Bulk Quote</h1>
          <p className="text-xs text-gray-500 mt-1">Direct factory manufacturing quotes for schools, academies, and corporate organizations.</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-emerald-600 mb-3">check_circle</span>
            <h2 className="text-xl font-black text-[#102a43] mb-2">Inquiry Submitted Successfully</h2>
            <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
              Our B2B Institutional Procurement team will review your specifications for <strong className="text-[#102a43]">{orgName}</strong> ({quantity} units) and contact you within 24 business hours.
            </p>
            <Link href="/student/store" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
              Return to Catalog
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">School / Organization Name *</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Meru International School"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102a43] mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102a43] mb-1">Estimated Quantity (Sets) *</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                >
                  <option value="250">100 - 250 Sets</option>
                  <option value="500">250 - 500 Sets</option>
                  <option value="1000">500 - 1,000 Sets</option>
                  <option value="2500">1,000+ Institutional Order</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102a43] mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu.in"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102a43] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">Uniform Specifications & Custom Crest Details</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specify colors, embroidery requirements, delivery timelines..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#FF561F] hover:bg-[#E64A1A] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{submitting ? 'Submitting Quote...' : 'Submit Bulk Procurement Quote Request'}</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
