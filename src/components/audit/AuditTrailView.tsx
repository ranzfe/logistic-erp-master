import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { History, Search, Shield, Filter, Clock } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useErp();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchModule = moduleFilter === 'All' || log.module === moduleFilter;
    return matchSearch && matchModule;
  });

  const modules = ['All', 'Delivery', 'Monitoring', 'Quotation', 'Invoice', 'Vendor', 'PettyCash', 'Armada', 'Auth'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Audit Trail &amp; Rekam Jejak Sistem (Activity Log)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log aktivitas transaksi, perubahan status, otorisasi keuangan, dan akses pengguna secara transparan.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {modules.map(mod => (
            <button
              key={mod}
              onClick={() => setModuleFilter(mod)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                moduleFilter === mod
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mod === 'All' ? 'Semua Modul' : mod}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari User, Tindakan, Target ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-44">Waktu (WIB)</th>
                <th className="py-3 px-4">Pengguna &amp; Peran</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Aksi Sistem</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-sans font-bold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-indigo-700 font-sans">{log.userRole}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                      {log.module}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-800">
                    {log.action}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {log.targetId}
                  </td>

                  <td className="py-3 px-4 font-sans text-slate-700">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
