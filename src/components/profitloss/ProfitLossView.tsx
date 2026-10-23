import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Filter, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  DollarSign, 
  Truck 
} from 'lucide-react';

export const ProfitLossView: React.FC = () => {
  const { profitLossSummary, getDeliveryProfitBreakdown, hasPermission } = useErp();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Bulan Ini (Oktober 2026)');

  const deliveryProfitList = getDeliveryProfitBreakdown();

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['No Surat Jalan', 'Klien', 'Rute', 'Armada', 'Status', 'Pendapatan (IDR)', 'Biaya Vendor (IDR)', 'Kas Kecil (IDR)', 'Total HPP (IDR)', 'Laba Kotor (IDR)', 'Margin (%)'];
    const rows = deliveryProfitList.map(item => [
      item.doNumber,
      `"${item.customerName}"`,
      `"${item.route}"`,
      item.armadaPlate,
      item.status,
      item.revenue,
      item.vendorCost,
      item.pettyCost,
      item.totalCost,
      item.grossProfit,
      `${item.marginPercent}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_P&L_LogistiX_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    totalRevenue,
    directCostVendor,
    directCostPettyCash,
    directCostFleetMaintenance,
    totalCostOfSales,
    grossProfit,
    grossMarginPercent,
    operatingExpenses,
    netProfit,
    netMarginPercent
  } = profitLossSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>Laporan Laba Rugi Komprehensif (Profit &amp; Loss Statement)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis real-time pendapatan kargo, HPP vendor kapal/BBM, kas kecil jalan, biaya operasional kantor, dan laba bersih.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-xs"
          >
            <option value="Bulan Ini (Oktober 2026)">Bulan Berjalan (Oktober 2026)</option>
            <option value="Kuartal 3 2026">Kuartal 3 (Juli - September 2026)</option>
            <option value="Tahun 2026 (YTD)">Tahun Buku 2026 (YTD)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Pendapatan Usaha (Revenue)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Faktur freight pengiriman logistik
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Harga Pokok Pendapatan (HPP / COGS)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-1">
            Rp {totalCostOfSales.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Vendor kapal + BBM/Tol + Pemeliharaan
          </div>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-xs text-emerald-800 font-semibold">Laba Kotor (Gross Profit)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
            Rp {grossProfit.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Gross Margin: {grossMarginPercent}%
          </div>
        </div>

        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-xs">
          <div className="text-xs text-indigo-900 font-semibold">Laba Bersih Operasional (Net Profit)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-900 mt-1">
            Rp {netProfit.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-1">
            Net Margin: {netMarginPercent}%
          </div>
        </div>
      </div>

      {/* Structured P&L Statement (Formal Indonesian Accounting Table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Laporan Laba Rugi Operasional Terpadu - {selectedPeriod}
            </h2>
            <p className="text-xs text-slate-500">
              Mata Uang: Indonesian Rupiah (IDR) · SAK Entitas Privat Standar
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs font-mono">
          {/* Section 1: Revenue */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold text-slate-900 pb-1 border-b border-slate-200">
              <span className="font-sans text-sm">PENDAPATAN USAHA (REVENUE)</span>
              <span className="text-sm">Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pl-4 py-1">
              <span className="font-sans">Pendapatan Freight Pengiriman Kargo &amp; Logistik</span>
              <span>Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Section 2: COGS / HPP */}
          <div className="space-y-1 pt-2">
            <div className="flex justify-between items-center font-bold text-slate-900 pb-1 border-b border-slate-200">
              <span className="font-sans text-sm">BEBAN POKOK PENDAPATAN (HPP / DIRECT COSTS)</span>
              <span className="text-rose-700 text-sm">(Rp {totalCostOfSales.toLocaleString('id-ID')})</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pl-4 py-0.5">
              <span className="font-sans">Biaya Vendor Freight &amp; Kapal Ferry Ro-Ro (ASDP/Subkon)</span>
              <span>(Rp {directCostVendor.toLocaleString('id-ID')})</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pl-4 py-0.5">
              <span className="font-sans">Biaya Kas Kecil Pengiriman (BBM Biosolar, E-Toll, Uang Saku Supir, Parkir)</span>
              <span>(Rp {directCostPettyCash.toLocaleString('id-ID')})</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pl-4 py-0.5">
              <span className="font-sans">Biaya Pemeliharaan &amp; Spareparts Armada (Bengkel Karoseri)</span>
              <span>(Rp {directCostFleetMaintenance.toLocaleString('id-ID')})</span>
            </div>
          </div>

          {/* Gross Profit Row */}
          <div className="flex justify-between items-center font-bold text-emerald-800 bg-emerald-50/70 p-2.5 rounded border border-emerald-200 text-sm">
            <span className="font-sans">LABA KOTOR (GROSS PROFIT)</span>
            <span>Rp {grossProfit.toLocaleString('id-ID')} ({grossMarginPercent}%)</span>
          </div>

          {/* Section 3: Operating Expenses */}
          <div className="space-y-1 pt-2">
            <div className="flex justify-between items-center font-bold text-slate-900 pb-1 border-b border-slate-200">
              <span className="font-sans text-sm">BEBAN USAHA OPERASIONAL &amp; KANTOR</span>
              <span className="text-rose-700 text-sm">(Rp {operatingExpenses.toLocaleString('id-ID')})</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pl-4 py-0.5">
              <span className="font-sans">Biaya Operasional Kantor &amp; ATK Faktur (Kas Kecil)</span>
              <span>(Rp {(operatingExpenses - 4500000).toLocaleString('id-ID')})</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pl-4 py-0.5">
              <span className="font-sans">Gaji Staf Administrasi &amp; Depresiasi Aset Terkait</span>
              <span>(Rp 4.500.000)</span>
            </div>
          </div>

          {/* Net Profit Row */}
          <div className="flex justify-between items-center font-bold text-indigo-900 bg-indigo-50/70 p-3 rounded-lg border border-indigo-200 text-base">
            <span className="font-sans">LABA BERSIH TAHUN BERJALAN (NET PROFIT)</span>
            <span>Rp {netProfit.toLocaleString('id-ID')} ({netMarginPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Delivery-by-Delivery Profitability Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Analisis Profitabilitas Per Pengiriman (Delivery-Level P&amp;L Breakdown)
            </h3>
            <p className="text-xs text-slate-500">
              Pelacakan margin riil tiap Surat Jalan berdasarkan biaya vendor dan klaim kas kecil supir
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Surat Jalan</th>
                <th className="py-3 px-4">Klien &amp; Rute</th>
                <th className="py-3 px-4">Armada</th>
                <th className="py-3 px-4 text-right">Pendapatan</th>
                <th className="py-3 px-4 text-right">Biaya Vendor</th>
                <th className="py-3 px-4 text-right">Kas Kecil Jalan</th>
                <th className="py-3 px-4 text-right">Laba Kotor Trip</th>
                <th className="py-3 px-4 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deliveryProfitList.map(item => (
                <tr key={item.doId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{item.doNumber}</div>
                    <span className="text-[10px] text-slate-500">{item.status}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.customerName}</div>
                    <div className="text-[11px] text-slate-500">{item.route}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {item.armadaPlate}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    Rp {item.revenue.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-700">
                    Rp {item.vendorCost.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700">
                    Rp {item.pettyCost.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-800">
                    Rp {item.grossProfit.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                      {item.marginPercent}%
                    </span>
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
