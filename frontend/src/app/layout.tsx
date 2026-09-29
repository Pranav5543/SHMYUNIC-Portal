import './globals.css';
import React from 'react';
import Navbar from '../components/Navbar';
import { AppProvider } from '../context/AppContext';

export const metadata = {
  title: 'ShopMyUniform | Enterprise Multi-Vertical Uniform Platform',
  description: 'Multi-vertical uniform commerce platform for Students, Corporate Workwear, Healthcare Scrubs, and Institutional B2B Procurement.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#FCFCFB] text-[#4B5563] font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-[#FF561F]/20 selection:text-[#FF561F]">
        <AppProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="bg-white border-t border-gray-200 py-8 px-4 md:px-8 text-xs text-gray-500 text-center">
            <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <p>© 2026 ShopMyUniform Enterprise Platform. All rights reserved.</p>
              <div className="flex gap-6 font-semibold">
                <a href="#" className="hover:text-[#FF561F]">Privacy Policy</a>
                <a href="#" className="hover:text-[#FF561F]">Terms of Service</a>
                <a href="#" className="hover:text-[#FF561F]">Enterprise Security</a>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
