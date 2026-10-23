import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { DeliveryOrder, DeliveryStatus, TruckType } from '../../types/erp';
import { SuratJalanPrintModal } from './SuratJalanPrintModal';
import { DeliveryDetailModal } from './DeliveryDetailModal';
import { 
  Package, 
  Plus, 
  Search, 
  Printer, 
  Eye, 
  Truck, 
  MapPin, 
  X 
} from 'lucide-react';

export const DeliveryManagement: React.FC = () => {
  const { deliveries, armadaList, addDelivery, hasPermission } = useErp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDeliveryForDetail, setSelectedDeliveryForDetail] = useState<DeliveryOrder | null>(null);
  const [selectedDeliveryForPrint, setSelectedDeliveryForPrint] = useState<DeliveryOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for creating a new delivery
  const [customerName, setCustomerName] = useState('');
  const [origin, setOrigin] = useState('Jakarta (Pool Marunda)');
  const [originAddress, setOriginAddress] = useState('Marunda Center Blok B-08, Cilincing, Jakarta Utara');
  const [destination, setDestination] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [weightTon, setWeightTon] = useState<number>(10);
  const [volumeCbm, setVolumeCbm] = useState<number>(25);
  const [selectedArmadaId, setSelectedArmadaId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('08:00 WIB');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [revenueAmount, setRevenueAmount] = useState<number>(12000000);
  const [notes, setNotes] = useState('');

  // When armada changes, auto-fill driver if assigned
  const handleArmadaChange = (armadaId: string) => {
    setSelectedArmadaId(armadaId);
    const arm = armadaList.find(a => a.id === armadaId);
    if (arm) {
      if (arm.currentDriverName) setDriverName(arm.currentDriverName);
      if (arm.currentDriverPhone) setDriverPhone(arm.currentDriverPhone);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const arm = armadaList.find(a => a.id === selectedArmadaId);
    if (!arm) return;

    addDelivery({
      customerName,
      origin,
      originAddress,
      destination,
      destinationAddress,
      cargoDescription,
      weightTon,
      volumeCbm,
      armadaId: arm.id,
      plateNumber: arm.plateNumber,
      truckType: arm.truckType,
      driverId: arm.currentDriverId || `drv-${Date.now()}`,
      driverName: driverName || arm.currentDriverName || 'Supir Pengganti',
      driverPhone: driverPhone || arm.currentDriverPhone || '+62 812-0000-0000',
      status: 'Scheduled',
      departureDate,
      departureTime,
      estimatedArrival: estimatedArrival || `${departureDate} 22:00 WIB`,
      currentLocationName: `${origin} (Persiapan Muat)`,
      liveSpeedKmh: 0,
      cargoTemperatureC: 25,
      revenueAmount,
      notes
    });

    setIsCreateModalOpen(false);
    // Reset form
    setCustomerName('');
    setDestination('');
    setDestinationAddress('');
    setCargoDescription('');
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(d => {
    const matchSearch = 
      d.doNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driverName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['All', 'In Transit', 'Checkpoint', 'Scheduled', 'Delivered', 'Delayed'];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Manajemen Data Delivery (Surat Jalan)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola penerbitan Surat Jalan, penugasan armada, pengiriman kargo, dan validasi tanda terima (POD).
          </p>
        </div>

        {hasPermission('delivery') && (
          <button
            onClick={() => {
              if (armadaList.length > 0 && !selectedArmadaId) {
                handleArmadaChange(armadaList[0].id);
              }
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Surat Jalan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'All' ? 'Semua Delivery' : st}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari DO, Klien, Plat, Supir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Delivery Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Surat Jalan</th>
                <th className="py-3 px-4">Klien &amp; Muatan</th>
                <th className="py-3 px-4">Rute Asal → Tujuan</th>
                <th className="py-3 px-4">Armada &amp; Supir</th>
                <th className="py-3 px-4 text-right">Nilai Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data delivery dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map(del => (
                  <tr key={del.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{del.doNumber}</div>
                      <div className="text-[11px] text-slate-500">{del.departureDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{del.customerName}</div>
                      <div className="text-slate-500 truncate max-w-xs">{del.cargoDescription}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {del.weightTon} Ton · {del.volumeCbm} CBM
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <span>{del.origin}</span>
                        <span className="text-slate-400">→</span>
                        <span>{del.destination}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Posisi: <strong className="text-slate-700">{del.currentLocationName}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{del.plateNumber}</div>
                      <div className="text-slate-600">{del.driverName}</div>
                      <div className="text-[11px] text-slate-400">{del.truckType}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      Rp {del.revenueAmount.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        del.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : del.status === 'In Transit'
                          ? 'bg-blue-100 text-blue-800'
                          : del.status === 'Checkpoint'
                          ? 'bg-amber-100 text-amber-800'
                          : del.status === 'Delayed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {del.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDeliveryForDetail(del)}
                        title="Lihat Detail & Lacak"
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors inline-flex items-center"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedDeliveryForPrint(del)}
                        title="Cetak Surat Jalan Resmi"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors inline-flex items-center"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Delivery Order */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Penerbitan Surat Jalan (Delivery Order) Baru</h3>
                <p className="text-xs text-slate-500">Alokasikan armada, pengemudi, dan rute pengiriman kargo</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nama Perusahaan Klien:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Nestle Indonesia"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota / Titik Asal Muat:</label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota / Titik Tujuan Bongkar:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Surabaya, Jawa Timur"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Alamat Lengkap Tujuan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kawasan Industri Rungkut Blok H-10, Surabaya"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Deskripsi Muatan Kargo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 800 Dus Susu Bubuk Kemasan Kaleng"
                    value={cargoDescription}
                    onChange={(e) => setCargoDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Berat Muatan (Ton):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightTon}
                    onChange={(e) => setWeightTon(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Volume Muatan (CBM):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={volumeCbm}
                    onChange={(e) => setVolumeCbm(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Pilih Unit Armada Tersedia:</label>
                  <select
                    value={selectedArmadaId}
                    onChange={(e) => handleArmadaChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                    required
                  >
                    <option value="">-- Pilih Armada --</option>
                    {armadaList.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.plateNumber} - {a.truckType} ({a.brandModel}) [Status: {a.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Supir Penugasan:</label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Telepon Supir:</label>
                  <input
                    type="text"
                    required
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Keberangkatan:</label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nilai Tagihan Freight (Rp):</label>
                  <input
                    type="number"
                    required
                    value={revenueAmount}
                    onChange={(e) => setRevenueAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Instruksi Khusus / No. Segel:</label>
                  <input
                    type="text"
                    placeholder="Wajib pasang lashing muatan, segel kontainer nomor SG-xxxx"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-colors"
                >
                  Terbitkan &amp; Simpan Surat Jalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDeliveryForDetail && (
        <DeliveryDetailModal
          delivery={selectedDeliveryForDetail}
          onClose={() => setSelectedDeliveryForDetail(null)}
          onOpenPrint={() => {
            setSelectedDeliveryForPrint(selectedDeliveryForDetail);
            setSelectedDeliveryForDetail(null);
          }}
        />
      )}

      {/* Print Modal */}
      {selectedDeliveryForPrint && (
        <SuratJalanPrintModal
          delivery={selectedDeliveryForPrint}
          onClose={() => setSelectedDeliveryForPrint(null)}
        />
      )}
    </div>
  );
};
