import React, { useState } from 'react';
import { DeliveryOrder, DeliveryStatus } from '../../types/erp';
import { useErp } from '../../context/ErpContext';
import { 
  X, 
  MapPin, 
  Truck, 
  User, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  AlertCircle 
} from 'lucide-react';

interface DeliveryDetailModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onOpenPrint: () => void;
}

export const DeliveryDetailModal: React.FC<DeliveryDetailModalProps> = ({ 
  delivery, 
  onClose,
  onOpenPrint
}) => {
  const { 
    vendorPayments, 
    pettyCashTransactions, 
    invoices, 
    updateDeliveryStatus,
    completeDeliveryPOD,
    reportDeliveryDelay,
    hasPermission 
  } = useErp();

  const [statusInput, setStatusInput] = useState<DeliveryStatus>(delivery?.status || 'In Transit');
  const [locationInput, setLocationInput] = useState(delivery?.currentLocationName || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [showPodForm, setShowPodForm] = useState(false);
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [delayHours, setDelayHours] = useState(2);

  if (!delivery) return null;

  // Integrated financial metrics for this specific delivery
  const linkedInvoice = invoices.find(inv => inv.doId === delivery.id || inv.doNumber === delivery.doNumber);
  const linkedVendorBills = vendorPayments.filter(vp => vp.linkedDoId === delivery.id || vp.linkedDoNumber === delivery.doNumber);
  const linkedPettyCash = pettyCashTransactions.filter(tx => tx.linkedDoId === delivery.id || tx.linkedDoNumber === delivery.doNumber);

  const totalVendorCost = linkedVendorBills.reduce((sum, vp) => sum + vp.amount, 0);
  const totalPettyCost = linkedPettyCash.filter(tx => tx.type === 'Cash_Out').reduce((sum, tx) => sum + tx.amount, 0);
  const revenue = delivery.revenueAmount || 0;
  const netMargin = revenue - totalVendorCost - totalPettyCost;
  const marginPct = revenue > 0 ? ((netMargin / revenue) * 100).toFixed(1) : '0';

  const handleUpdateStatus = () => {
    updateDeliveryStatus(delivery.id, statusInput, locationInput);
  };

  const handleConfirmPOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName) return;
    completeDeliveryPOD(delivery.id, recipientName, recipientPhone, podNotes);
    setShowPodForm(false);
  };

  const handleReportDelay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayReason) return;
    reportDeliveryDelay(delivery.id, delayReason, delayHours);
    setShowDelayForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 font-mono">{delivery.doNumber}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                delivery.status === 'Delivered' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : delivery.status === 'In Transit'
                  ? 'bg-blue-100 text-blue-800'
                  : delivery.status === 'Delayed'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {delivery.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Klien: <strong className="text-slate-800">{delivery.customerName}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPrint}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Cetak Surat Jalan
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Route & Transportation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Rute &amp; Perjalanan</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div><strong>Asal:</strong> {delivery.origin} ({delivery.originAddress})</div>
                <div><strong>Tujuan:</strong> {delivery.destination} ({delivery.destinationAddress})</div>
                <div><strong>Waktu Berangkat:</strong> {delivery.departureDate} {delivery.departureTime}</div>
                <div><strong>Estimasi Tiba (ETA):</strong> {delivery.estimatedArrival}</div>
                {delivery.actualArrival && (
                  <div className="text-emerald-700 font-semibold">
                    <strong>Tiba Aktual:</strong> {delivery.actualArrival}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Armada &amp; Personel</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div><strong>Nomor Polisi:</strong> <span className="font-mono font-bold text-slate-900">{delivery.plateNumber}</span> ({delivery.truckType})</div>
                <div><strong>Supir:</strong> {delivery.driverName} (<span className="font-mono">{delivery.driverPhone}</span>)</div>
                <div><strong>Muatan:</strong> {delivery.cargoDescription}</div>
                <div><strong>Berat &amp; Volume:</strong> {delivery.weightTon} Ton · {delivery.volumeCbm} CBM</div>
                <div><strong>Posisi Terakhir:</strong> <span className="text-slate-900 font-medium">{delivery.currentLocationName}</span></div>
              </div>
            </div>
          </div>

          {/* Section 2: Integrated Delivery Financial Health */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Integrasi Finansial Pengiriman (P&amp;L Delivery Level)</span>
              </div>
              <div className="text-xs font-semibold text-emerald-700 font-mono">
                Margin: {marginPct}%
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="text-slate-500 text-[11px]">Pendapatan Kargo</div>
                <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                  Rp {revenue.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Faktur: {linkedInvoice?.invoiceNumber || 'Tersedia'}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="text-slate-500 text-[11px]">Biaya Vendor (AP)</div>
                <div className="text-sm font-bold font-mono text-rose-700 mt-1">
                  Rp {totalVendorCost.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {linkedVendorBills.length} Tagihan
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="text-slate-500 text-[11px]">Kas Kecil (BBM/Tol)</div>
                <div className="text-sm font-bold font-mono text-amber-700 mt-1">
                  Rp {totalPettyCost.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {linkedPettyCash.length} Voucher
                </div>
              </div>

              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200">
                <div className="text-emerald-800 text-[11px] font-semibold">Laba Kotor Trip</div>
                <div className="text-sm font-bold font-mono text-emerald-800 mt-1">
                  Rp {netMargin.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">
                  Laba Bersih Langsung
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Milestones & Progress */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Riwayat Checkpoint &amp; Milestone Jalur</h4>
            <div className="space-y-2">
              {delivery.milestones?.map((m, idx) => (
                <div key={m.id || idx} className="flex items-center gap-3 p-2 rounded bg-slate-50 border border-slate-200/80">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    m.status === 'Passed' ? 'bg-emerald-500' : m.status === 'Current' ? 'bg-indigo-600' : 'bg-slate-300'
                  }`} />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{m.name}</div>
                    <div className="text-slate-500">{m.location} {m.passedAt && `· Selesai: ${m.passedAt}`}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    m.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : m.status === 'Current' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Operational Actions (Role Protected) */}
          {hasPermission('delivery') && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tindakan Lapangan &amp; Pembaruan Status</h4>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as DeliveryStatus)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Loading">Loading</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Checkpoint">Checkpoint</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Lokasi terbaru (e.g. Tol Cipali KM 102)"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs w-64"
                  />
                  <button
                    onClick={handleUpdateStatus}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                  >
                    Simpan Lokasi
                  </button>
                </div>

                {delivery.status !== 'Delivered' && (
                  <>
                    <button
                      onClick={() => setShowPodForm(!showPodForm)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 ml-auto"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Konfirmasi POD / Selesai</span>
                    </button>

                    <button
                      onClick={() => setShowDelayForm(!showDelayForm)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Lapor Kendala / Delay</span>
                    </button>
                  </>
                )}
              </div>

              {/* POD Sub-Form */}
              {showPodForm && (
                <form onSubmit={handleConfirmPOD} className="mt-4 p-4 rounded bg-white border border-emerald-300 space-y-3">
                  <div className="font-bold text-emerald-800 text-xs uppercase">
                    Formulir Serah Terima Kargo (Proof of Delivery - POD)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Nama Petugas Penerima:</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Bpk. Haryono (Kepala Gudang)"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Nomor Telepon Penerima:</label>
                      <input
                        type="text"
                        placeholder="0812-xxxx-xxxx"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Catatan Kondisi Barang / Segel:</label>
                    <input
                      type="text"
                      placeholder="Barang diterima lengkap 100%, segel SG-9921 utuh"
                      value={podNotes}
                      onChange={(e) => setPodNotes(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPodForm(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                    >
                      Tandatangani &amp; Selesaikan Delivery
                    </button>
                  </div>
                </form>
              )}

              {/* Delay Sub-Form */}
              {showDelayForm && (
                <form onSubmit={handleReportDelay} className="mt-4 p-4 rounded bg-white border border-amber-300 space-y-3">
                  <div className="font-bold text-amber-900 text-xs uppercase">
                    Laporan Kendala Jalan &amp; Estimasi Keterlambatan
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-600 mb-1">Penyebab Kendala:</label>
                      <input
                        type="text"
                        required
                        placeholder="Macet parah contraflow tol / kerusakan ban / antrian feri"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Estimasi Delay (Jam):</label>
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={delayHours}
                        onChange={(e) => setDelayHours(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDelayForm(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                    >
                      Kirim Laporan Delay
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
