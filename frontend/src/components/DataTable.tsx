'use client';

import React, { useState } from 'react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search records...'
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
          />
        </div>
        <div className="text-xs text-gray-500 font-semibold">
          Showing {filteredData.length} of {data.length} records
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="py-3 px-4">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-gray-400 font-semibold">
                  No records matching search.
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50/80 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="py-3.5 px-4 font-medium">
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '') : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
