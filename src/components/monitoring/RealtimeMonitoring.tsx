import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { DeliveryOrder } from '../../types/erp';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Gauge, 
  Thermometer, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  RefreshCw, 
  PhoneCall, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Truck
} from 'lucide-react';

export const RealtimeMonitoring: React.FC = () => {
  const { 
    deliveries, 
    updateDeliveryStatus, 
    completeDeliveryPOD, 
    reportDeliveryDelay,
    isSimulatingTelemetry, 
    setIsSimulatingTelemetry,
    hasPermission 
  } = useErp();

  // Find all deliveries in transit, checkpoint, or scheduled
  const activeDeliveries = deliveries.filter(d => ['In Transit', 'Checkpoint', 'Loading', 'Scheduled', 'Delayed'].includes(d.status));
  const [selectedId, setSelectedId] = useState<string>(activeDeliveries[0]?.id || deliveries[0]?.id || '');

  const activeDelivery = deliveries.find(d => d.id === selectedId) || deliveries[0];

  // Modals for delay or POD
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [delayHours, setDelayHours] = useState(2);

  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [podNotes, setPodNotes] = useState('');

  const handleAdvanceCheckpoint = () => {
    if (!activeDelivery) return;
    const checkpoints = [
      'Rest Area KM 207A Cirebon',
      'Gerbang Tol Kalikangkung Semarang KM 414',
      'Tol Solo - Ngawi KM 580',
      'Gerbang Tol Waru Gunung Surabaya KM 741',
      'Pelabuhan Tanjung Perak Surabaya',
      'Depo Distribusi Rungkut'
    ];

    const currentIdx = checkpoints.findIndex(c => c === activeDelivery.currentLocationName);
    const nextLocation = checkpoints[currentIdx + 1] || 'Mendekati Lokasi Bongkar Tujuan';
    const nextProgress = Math.min(96, activeDelivery.progressPercent + 15);

    updateDeliveryStatus(activeDelivery.id, 'In Transit', nextLocation, `Checkpoint terverifikasi di ${nextLocation}`);
  };

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery || !delayReason) return;
    reportDeliveryDelay(activeDelivery.id, delayReason, delayHours);
    setIsDelayModalOpen(false);
  };

  const handlePodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery || !recipientName) return;
    completeDeliveryPOD(activeDelivery.id, recipientName, recipientPhone, podNotes);
    setIsPodModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <span>Monitoring Delivery &amp; Telemetri Armada Real-Time</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan GPS langsung, pemantauan kecepatan, suhu kargo, progres checkpoint rute Trans-Jawa &amp; Antar-Pulau.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSimulatingTelemetry(!isSimulatingTelemetry)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border shadow-xs ${
              isSimulatingTelemetry
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSimulatingTelemetry ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulasi GPS: Berjalan</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulasi GPS: Jeda</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Fleet List Selector, Right Live Corridor Map & Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Active Fleets in Motion */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Armada Sedang Dalam Tugas ({activeDeliveries.length})
          </div>

          <div className="space-y-2.5">
            {activeDeliveries.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Tidak ada armada yang sedang berjalan saat ini.
              </div>
            ) : (
              activeDeliveries.map(del => {
                const isSelected = del.id === selectedId;
                return (
                  <div
                    key={del.id}
                    onClick={() => setSelectedId(del.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-xs ${isSelected ? 'text-indigo-300' : 'text-slate-900'}`}>
                            {del.plateNumber}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            del.status === 'In Transit'
                              ? 'bg-blue-500/20 text-blue-300'
                              : del.status === 'Checkpoint'
                              ? 'bg-amber-500/20 text-amber-300'
                              : del.status === 'Delayed'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-500/20 text-slate-300'
                          }`}>
                            {del.status}
                          </span>
                        </div>
                        <div className={`text-xs font-semibold mt-1 truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {del.customerName}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {del.liveSpeedKmh} km/h
                        </div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                          {del.progressPercent}%
                        </div>
                      </div>
                    </div>

                    <div className={`text-[11px] mt-2 flex items-center gap-1 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{del.currentLocationName}</span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-full bg-slate-700/40 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSelected ? 'bg-indigo-400' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${del.progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (8 cols): Interactive Visual Telemetry & Corridor Map */}
        <div className="lg:col-span-8 space-y-4">
          {activeDelivery ? (
            <>
              {/* Telemetry HUD Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Kecepatan Armada</span>
                    <Gauge className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {activeDelivery.liveSpeedKmh} <span className="text-xs font-normal text-slate-500">km/jam</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Status: {activeDelivery.liveSpeedKmh > 0 ? 'Bergerak Stabil' : 'Berhenti di Rest Area'}
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Suhu Boks Kargo</span>
                    <Thermometer className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {activeDelivery.cargoTemperatureC ?? 24}°C
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    Kondisi Aman Terkendali
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Estimasi Tiba (ETA)</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1 truncate">
                    {activeDelivery.estimatedArrival}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Progres: {activeDelivery.progressPercent}%
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Surat Jalan &amp; Plat</span>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-1 truncate">
                    {activeDelivery.plateNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">
                    {activeDelivery.doNumber}
                  </div>
                </div>
              </div>

              {/* Interactive Visual Map Canvas (Java-Trans Corridor) */}
              <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300">
                      Rute Koridor: {activeDelivery.origin} → {activeDelivery.destination}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>GPS FIX (Satelit 12/12)</span>
                  </div>
                </div>

                {/* Graphical Highway Route Simulator */}
                <div className="relative z-10 py-8 px-4">
                  {/* Highway Line */}
                  <div className="relative h-2 bg-slate-800 rounded-full my-6">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${activeDelivery.progressPercent}%` }}
                    />

                    {/* Key Waypoint Pins along the line */}
                    <div className="absolute left-0 -top-3 transform -translate-x-1/2 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-xs" />
                      <span className="text-[10px] font-mono text-slate-400 mt-1 whitespace-nowrap">Asal: {activeDelivery.origin}</span>
                    </div>

                    <div className="absolute left-1/3 -top-3 transform -translate-x-1/2 flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 border-white ${activeDelivery.progressPercent >= 33 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                      <span className="text-[10px] font-mono text-slate-400 mt-1 whitespace-nowrap">Rest Area KM 166</span>
                    </div>

                    <div className="absolute left-2/3 -top-3 transform -translate-x-1/2 flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 border-white ${activeDelivery.progressPercent >= 66 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                      <span className="text-[10px] font-mono text-slate-400 mt-1 whitespace-nowrap">GT Kalikangkung KM 414</span>
                    </div>

                    <div className="absolute right-0 -top-3 transform translate-x-1/2 flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 border-white ${activeDelivery.progressPercent >= 100 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                      <span className="text-[10px] font-mono text-slate-400 mt-1 whitespace-nowrap">Tujuan: {activeDelivery.destination}</span>
                    </div>

                    {/* Moving Truck Icon */}
                    <div 
                      className="absolute -top-7 transform -translate-x-1/2 transition-all duration-700"
                      style={{ left: `${activeDelivery.progressPercent}%` }}
                    >
                      <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-xl border border-indigo-400 flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        <span className="text-[10px] font-mono font-bold">{activeDelivery.plateNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Current Coordinates & Info Bar */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Posisi Checkpoint:</span>
                    <strong className="text-white">{activeDelivery.currentLocationName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pengemudi:</span>
                    <span className="text-white font-medium">{activeDelivery.driverName}</span>
                    <span className="text-slate-400 block text-[11px] font-mono">{activeDelivery.driverPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Muatan &amp; Tonase:</span>
                    <span className="text-slate-200">{activeDelivery.cargoDescription} ({activeDelivery.weightTon} Ton)</span>
                  </div>
                </div>
              </div>

              {/* Action Controls for Field Supervisor & Ops Manager */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  Aksi Operasional untuk <strong>{activeDelivery.doNumber}</strong>:
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {hasPermission('monitoring') && (
                    <>
                      <button
                        onClick={handleAdvanceCheckpoint}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Update Checkpoint Rute</span>
                      </button>

                      <button
                        onClick={() => setIsDelayModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Lapor Kendala / Delay</span>
                      </button>

                      {activeDelivery.status !== 'Delivered' && (
                        <button
                          onClick={() => setIsPodModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Konfirmasi Tiba &amp; POD</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              Pilih armada di sebelah kiri untuk melihat telemetri.
            </div>
          )}
        </div>
      </div>

      {/* Delay Modal */}
      {isDelayModalOpen && activeDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="font-bold text-sm text-slate-900">Laporkan Kendala / Delay Armada {activeDelivery.plateNumber}</div>
            <form onSubmit={handleDelaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Penyebab Kendala di Rute:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Macet perbaikan jalan jembatan / kerusakan ban"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Estimasi Keterlambatan (Jam):</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={delayHours}
                  onChange={(e) => setDelayHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDelayModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                >
                  Kirim Peringatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POD Modal */}
      {isPodModalOpen && activeDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="font-bold text-sm text-slate-900">Konfirmasi Bukti Penerimaan Kargo (POD)</div>
            <p className="text-xs text-slate-500">Menyelesaikan Surat Jalan {activeDelivery.doNumber} dan mengembalikan status armada ke standby.</p>
            <form onSubmit={handlePodSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Nama Petugas Penerima Gudang:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Haryono (Staff Gudang)"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">No. Kontak Penerima:</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Catatan Serah Terima:</label>
                <input
                  type="text"
                  placeholder="Barang diterima komplit tanpa cacat"
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPodModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                >
                  Konfirmasi POD Selesai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
