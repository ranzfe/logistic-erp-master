import React from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Truck, 
  Package, 
  DollarSign, 
  Wallet, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  User, 
  Plus, 
  FileText 
} from 'lucide-react';

interface DashboardAnalyticsProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ setActiveTab }) => {
  const { 
    currentUser, 
    deliveries, 
    armadaList, 
    invoices, 
    vendorPayments, 
    pettyCashBalance, 
    profitLossSummary,
    quotations
  } = useErp();

  // Fleet calculations
  const totalArmada = armadaList.length;
  const inTransitArmada = armadaList.filter(a => a.status === 'In Transit').length;
  const availableArmada = armadaList.filter(a => a.status === 'Available').length;
  const maintenanceArmada = armadaList.filter(a => a.status === 'Maintenance').length;

  // Active deliveries in transit or checkpoint
  const activeDeliveries = deliveries.filter(d => ['In Transit', 'Checkpoint', 'Loading'].includes(d.status));

  // Outstanding AR & AP
  const totalArOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalApOutstanding = vendorPayments
    .filter(v => v.status !== 'Paid')
    .reduce((sum, v) => sum + (v.amount - v.paidAmount), 0);

  // Urgent alerts
  const urgentAlerts: Array<{ id: string; type: 'warning' | 'info'; title: string; desc: string; tab: string }> = [];

  // Check delayed deliveries
  const delayedDeliveries = deliveries.filter(d => d.status === 'Delayed');
  if (delayedDeliveries.length > 0) {
    urgentAlerts.push({
      id: 'alert-delay',
      type: 'warning',
      title: `${delayedDeliveries.length} Pengiriman Mengalami Kendala / Delay`,
      desc: delayedDeliveries.map(d => `${d.doNumber}: ${d.delayReason || 'Keterlambatan rute'}`).join('; '),
      tab: 'monitoring'
    });
  }

  // Check KIR / STNK expiring in near future (next 30 days)
  const expiringVehicles = armadaList.filter(a => {
    const kir = new Date(a.kirExpiry).getTime();
    const stnk = new Date(a.stnkExpiry).getTime();
    const now = new Date('2026-10-23').getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return (kir - now < thirtyDays && kir > now) || (stnk - now < thirtyDays && stnk > now);
  });

  if (expiringVehicles.length > 0) {
    urgentAlerts.push({
      id: 'alert-kir',
      type: 'warning',
      title: `${expiringVehicles.length} Armada Memerlukan Perpanjangan Uji KIR / STNK`,
      desc: expiringVehicles.map(a => `${a.plateNumber} (KIR: ${a.kirExpiry})`).join(', '),
      tab: 'armada'
    });
  }

  // Pending quotations
  const pendingQuotes = quotations.filter(q => q.status === 'Sent');
  if (pendingQuotes.length > 0) {
    urgentAlerts.push({
      id: 'alert-quote',
      type: 'info',
      title: `${pendingQuotes.length} Quotation Menunggu Persetujuan Klien`,
      desc: pendingQuotes.map(q => `${q.quotationNumber} - ${q.customerName}`).join('; '),
      tab: 'quotation'
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            Ikhtisar Operasional &amp; Finansial Terpadu
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Selamat Datang, {currentUser.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Peran: <strong className="text-slate-800">{currentUser.roleTitle}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Update Real-time Terakhir: Hari ini, 08:30 WIB</span>
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {['super_admin', 'ops_manager'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('delivery')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Surat Jalan</span>
            </button>
          )}

          {['super_admin', 'sales_executive'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('quotation')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quotation Baru</span>
            </button>
          )}

          {['super_admin', 'finance_officer', 'fleet_supervisor'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('pettycash')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-600" />
              <span>Klaim Kas Kecil</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid (60-30-10, single elevation depth, tabular numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pendapatan & Omset */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Pendapatan (Bulan Ini)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            Rp {profitLossSummary.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Margin Kotor {profitLossSummary.grossMarginPercent}%</span>
            <span className="text-slate-400 font-normal">· {invoices.length} Faktur</span>
          </div>
        </div>

        {/* KPI 2: Kesiapan Armada */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Kesiapan Armada</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {availableArmada} <span className="text-sm font-normal text-slate-500">/ {totalArmada} Unit Siap</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
            <span className="text-blue-700 font-semibold">{inTransitArmada} di Jalan</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700">{maintenanceArmada} Servis</span>
          </div>
        </div>

        {/* KPI 3: Status Pengiriman Berjalan */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Delivery Aktif di Rute</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {activeDeliveries.length} <span className="text-sm font-normal text-slate-500">Surat Jalan</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{profitLossSummary.completedDeliveriesCount} Terkirim Bulan Ini</span>
          </div>
        </div>

        {/* KPI 4: Kas Kecil & Likuiditas Jalan */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Saldo Kas Kecil Operasional</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            Rp {pettyCashBalance.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Uang Jalan &amp; BBM Supir</span>
            <button 
              onClick={() => setActiveTab('pettycash')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
            >
              Rincian <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Operational Alerts if any */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-2">
          {urgentAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 ${
                alert.type === 'warning' 
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <ShieldAlert className={`w-4 h-4 mt-0.5 shrink-0 ${alert.type === 'warning' ? 'text-amber-600' : 'text-indigo-600'}`} />
                <div>
                  <div className="text-xs font-bold">{alert.title}</div>
                  <div className="text-xs text-slate-700 mt-0.5">{alert.desc}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab(alert.tab)}
                className="text-xs font-semibold px-2.5 py-1 bg-white rounded border border-slate-200 hover:bg-slate-50 shrink-0 text-slate-800 transition-colors"
              >
                Tindak Lanjuti
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Integrated Operations & Finance 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Active Delivery Radar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Delivery Tracking Radar</h2>
              <p className="text-xs text-slate-500 mt-0.5">Armada aktif bergerak di rute Trans-Jawa &amp; Antar-Kota</p>
            </div>
            <button
              onClick={() => setActiveTab('monitoring')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Buka Peta Monitoring Penuh <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeDeliveries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Tidak ada delivery yang sedang di jalan saat ini. Seluruh armada berada di pool atau terjadwal.
              </div>
            ) : (
              activeDeliveries.map(del => (
                <div 
                  key={del.id}
                  className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{del.doNumber}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-medium text-slate-700">{del.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-semibold">{del.origin}</span>
                        <span>→</span>
                        <span className="font-semibold">{del.destination}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                          {del.liveSpeedKmh > 0 ? `${del.liveSpeedKmh} km/jam` : 'Berhenti di Rest Area'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ETA: {del.estimatedArrival}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        del.status === 'In Transit' 
                          ? 'bg-blue-100 text-blue-800' 
                          : del.status === 'Checkpoint' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {del.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Posisi: <strong className="text-slate-800">{del.currentLocationName}</strong></span>
                      <span className="font-mono tabular-nums font-semibold text-slate-700">{del.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          del.status === 'Delayed' ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${del.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Driver and Truck Info */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{del.driverName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono font-medium">{del.driverPhone}</span>
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-800">
                      {del.plateNumber} ({del.truckType})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Integrated Financial Health (AR vs AP vs P&L) */}
        <div className="space-y-6">
          {/* Financial Balance Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Arus Kas &amp; Piutang</h3>
              <button
                onClick={() => setActiveTab('profitloss')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Lihat P&amp;L
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500">Piutang Dagang (AR Belum Lunas)</div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                  Rp {totalArOutstanding.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Tagihan resmi dari Surat Jalan terkirim
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500">Hutang Vendor Berjalan (AP)</div>
                <div className="text-lg font-bold font-mono tabular-nums text-rose-700 mt-1">
                  Rp {totalApOutstanding.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Kapal Ferry, Bahan Bakar Pertamina &amp; Bengkel
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <div className="text-xs text-indigo-900 font-semibold">Estimasi Laba Bersih Bulan Ini</div>
                <div className="text-xl font-bold font-mono tabular-nums text-indigo-900 mt-1">
                  Rp {profitLossSummary.netProfit.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-indigo-700 mt-1">
                  Net Margin: {profitLossSummary.netMarginPercent}% setelah HPP dan operasional
                </div>
              </div>
            </div>
          </div>

          {/* Quick Module Navigation Cards */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Pintasan Modul Manajemen
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('delivery')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left font-medium text-slate-800 transition-colors"
              >
                Data Delivery ({deliveries.length})
              </button>
              <button
                onClick={() => setActiveTab('quotation')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left font-medium text-slate-800 transition-colors"
              >
                Quotation ({quotations.length})
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left font-medium text-slate-800 transition-colors"
              >
                Faktur Invoice ({invoices.length})
              </button>
              <button
                onClick={() => setActiveTab('armada')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left font-medium text-slate-800 transition-colors"
              >
                Data Armada ({armadaList.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
