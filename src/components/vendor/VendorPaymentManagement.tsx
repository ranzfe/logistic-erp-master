import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { VendorPayment, VendorCategory, VendorPaymentStatus } from '../../types/erp';
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  FileText, 
  X, 
  Building 
} from 'lucide-react';

export const VendorPaymentManagement: React.FC = () => {
  const { 
    vendorPayments, 
    deliveries, 
    armadaList, 
    addVendorPayment, 
    approveVendorPayment, 
    recordVendorPayment, 
    hasPermission 
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Payment Execution Modal
  const [payingBill, setPayingBill] = useState<VendorPayment | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('Bank Transfer Mandiri Operasional');
  const [transferProofRef, setTransferProofRef] = useState('');

  // Create Bill Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState<VendorCategory>('Pelayaran & Kapal Ro-Ro');
  const [selectedDoId, setSelectedDoId] = useState('');
  const [selectedArmadaId, setSelectedArmadaId] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [amount, setAmount] = useState<number>(3500000);
  const [notes, setNotes] = useState('');

  // Summary KPIs
  const totalBills = vendorPayments.reduce((sum, v) => sum + v.amount, 0);
  const totalPaid = vendorPayments.reduce((sum, v) => sum + v.paidAmount, 0);
  const totalOutstanding = vendorPayments.reduce((sum, v) => sum + (v.amount - v.paidAmount), 0);
  const pendingApprovalCount = vendorPayments.filter(v => v.status === 'Pending_Approval').length;

  const handleOpenPay = (vp: VendorPayment) => {
    setPayingBill(vp);
    setPayAmount(vp.amount - vp.paidAmount);
    setTransferProofRef(`TRF-MDR-${Date.now().toString().slice(-6)}`);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBill || payAmount <= 0) return;

    recordVendorPayment(
      payingBill.id,
      payAmount,
      payMethod,
      transferProofRef
    );

    setPayingBill(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedDo = deliveries.find(d => d.id === selectedDoId);
    const linkedArm = armadaList.find(a => a.id === selectedArmadaId);

    addVendorPayment({
      vendorName,
      vendorCategory,
      linkedDoId: linkedDo?.id,
      linkedDoNumber: linkedDo?.doNumber,
      linkedArmadaId: linkedArm?.id,
      plateNumber: linkedArm?.plateNumber,
      billDate,
      dueDate,
      amount,
      notes
    });

    setIsCreateModalOpen(false);
  };

  // Filter
  const filteredPayments = vendorPayments.filter(vp => {
    const matchSearch = 
      vp.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vp.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vp.linkedDoNumber && vp.linkedDoNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vp.plateNumber && vp.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = categoryFilter === 'All' || vp.vendorCategory === categoryFilter;
    const matchStatus = statusFilter === 'All' || vp.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const categories: string[] = [
    'All',
    'Pelayaran & Kapal Ro-Ro',
    'BBM & Bahan Bakar',
    'Bengkel & Karoseri',
    'Subkontraktor Armada',
    'Depo & Pergudangan'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Pembayaran Vendor &amp; Hutang (AP)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tagihan mitra feri ASDP, distributor BBM Pertamina, bengkel karoseri, dan termin pembayaran subkontraktor.
          </p>
        </div>

        {hasPermission('vendor') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Tagihan Vendor Baru</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Tagihan Vendor (AP)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            Rp {totalBills.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {vendorPayments.length} Tagihan Mitra
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Telah Dibayar (Paid)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            Rp {totalPaid.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Ditransfer dari kas perusahaan
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Sisa Hutang Berjalan (Outstanding)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-1">
            Rp {totalOutstanding.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            Kewajiban bayar yang belum lunas
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Menunggu Otorisasi (Approval)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-700 mt-1">
            {pendingApprovalCount} <span className="text-xs font-normal text-slate-500">Tagihan</span>
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">
            Memerlukan persetujuan Finance / Direksi
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'All' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari Tagihan, Vendor, Plat, DO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Vendor Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Tagihan Vendor</th>
                <th className="py-3 px-4">Nama Mitra Vendor &amp; Kategori</th>
                <th className="py-3 px-4">Alokasi DO / Armada</th>
                <th className="py-3 px-4">Tgl &amp; Jatuh Tempo</th>
                <th className="py-3 px-4 text-right">Nilai Tagihan</th>
                <th className="py-3 px-4 text-right">Sisa Hutang</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data tagihan vendor dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(vp => {
                  const remaining = vp.amount - vp.paidAmount;
                  return (
                    <tr key={vp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{vp.billNumber}</div>
                        {vp.transferProofRef && (
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {vp.transferProofRef}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{vp.vendorName}</div>
                        <div className="text-[11px] text-slate-500">{vp.vendorCategory}</div>
                      </td>

                      <td className="py-3 px-4">
                        {vp.linkedDoNumber && (
                          <div className="font-mono font-medium text-slate-800">
                            DO: {vp.linkedDoNumber}
                          </div>
                        )}
                        {vp.plateNumber && (
                          <div className="text-[11px] font-mono text-slate-600">
                            Armada: {vp.plateNumber}
                          </div>
                        )}
                        {!vp.linkedDoNumber && !vp.plateNumber && (
                          <span className="text-slate-400">Umum / Pool</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800">{vp.billDate}</div>
                        <div className="text-[11px] text-slate-500">Tempo: {vp.dueDate}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        Rp {vp.amount.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-rose-700">
                        Rp {remaining.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          vp.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : vp.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : vp.status === 'Partially_Paid'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vp.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {vp.status === 'Pending_Approval' && hasPermission('vendor') && (
                          <button
                            onClick={() => approveVendorPayment(vp.id)}
                            title="Setujui Tagihan Vendor"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        )}

                        {vp.status !== 'Paid' && vp.status !== 'Pending_Approval' && hasPermission('vendor') && (
                          <button
                            onClick={() => handleOpenPay(vp)}
                            title="Proses Transfer Pembayaran Vendor"
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-[11px] inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Bayar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Vendor Payment */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Pembayaran Tagihan Vendor (AP)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vendor: <strong className="text-slate-800">{payingBill.vendorName}</strong> ({payingBill.billNumber})
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Tagihan:</span>
                  <span className="font-mono font-bold">Rp {payingBill.amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sisa Tagihan Belum Dibayar:</span>
                  <span className="font-mono font-bold text-rose-700">
                    Rp {(payingBill.amount - payingBill.paidAmount).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jumlah Ditransfer (Rp):</label>
                <input
                  type="number"
                  min="1"
                  max={payingBill.amount - payingBill.paidAmount}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Metode Transfer Bank Pengirim:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                >
                  <option value="Bank Transfer Mandiri Operasional">Bank Transfer Mandiri Operasional</option>
                  <option value="Bank Transfer BCA Operasional">Bank Transfer BCA Operasional</option>
                  <option value="Pertamina Corporate Fuel Card">Pertamina Corporate Fuel Card</option>
                  <option value="Biro Kliring Giro Bank">Biro Kliring Giro Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Referensi Bukti Transfer / Resi:</label>
                <input
                  type="text"
                  required
                  value={transferProofRef}
                  onChange={(e) => setTransferProofRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold"
                >
                  Eksekusi Pembayaran Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Vendor Bill */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Catat Tagihan Vendor Baru</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Perusahaan Mitra Vendor:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT ASDP Ferry Merak-Bakauheni"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kategori Layanan Vendor:</label>
                <select
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value as VendorCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                >
                  <option value="Pelayaran & Kapal Ro-Ro">Pelayaran & Kapal Ro-Ro</option>
                  <option value="BBM & Bahan Bakar">BBM & Bahan Bakar</option>
                  <option value="Bengkel & Karoseri">Bengkel & Karoseri</option>
                  <option value="Subkontraktor Armada">Subkontraktor Armada</option>
                  <option value="Depo & Pergudangan">Depo & Pergudangan</option>
                  <option value="Asuransi Kargo">Asuransi Kargo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Terkait Surat Jalan (DO):</label>
                  <select
                    value={selectedDoId}
                    onChange={(e) => setSelectedDoId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  >
                    <option value="">-- Tidak Terkait DO --</option>
                    {deliveries.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.doNumber} ({d.customerName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Terkait Armada:</label>
                  <select
                    value={selectedArmadaId}
                    onChange={(e) => setSelectedArmadaId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  >
                    <option value="">-- Tidak Terkait Truk --</option>
                    {armadaList.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.plateNumber} ({a.truckType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Tagihan:</label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Jatuh Tempo:</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nominal Tagihan Vendor (Rp):</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Keterangan / Nomor Invoice Vendor:</label>
                <input
                  type="text"
                  placeholder="Invoice fisik nomor #ASDP-99201"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
                >
                  Simpan Tagihan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
