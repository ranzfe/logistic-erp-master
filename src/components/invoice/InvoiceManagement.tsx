import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Invoice, InvoiceStatus } from '../../types/erp';
import { InvoicePrintModal } from './InvoicePrintModal';
import { 
  Receipt, 
  Search, 
  Printer, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X 
} from 'lucide-react';

export const InvoiceManagement: React.FC = () => {
  const { 
    invoices, 
    deliveries, 
    recordInvoicePayment, 
    addInvoice, 
    hasPermission 
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Payment Recording Modal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<Invoice['payments'][0]['method']>('Bank Transfer BCA');
  const [payRefNo, setPayRefNo] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Create Invoice Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDoId, setSelectedDoId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('01.325.991.2-054.000');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [subtotal, setSubtotal] = useState<number>(15000000);
  const [paymentTerms, setPaymentTerms] = useState('TOP 30 Hari');

  // Summary Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalBalanceDue = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

  const handleOpenPayment = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayAmount(inv.balanceDue);
    setPayRefNo(`TRF-BCA-${Date.now().toString().slice(-6)}`);
    setPayNotes('Pelunasan piutang transfer bank operasional');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || payAmount <= 0) return;

    recordInvoicePayment(
      payingInvoice.id,
      payAmount,
      payMethod,
      payRefNo,
      payNotes
    );

    setPayingInvoice(null);
  };

  const handleDoSelect = (doId: string) => {
    setSelectedDoId(doId);
    const del = deliveries.find(d => d.id === doId);
    if (del) {
      setCustomerName(del.customerName);
      setCustomerAddress(del.destinationAddress);
      setSubtotal(del.revenueAmount ? Math.round(del.revenueAmount / 1.11) : 10000000);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ppn = Math.round((subtotal * 11) / 100);
    const total = subtotal + ppn;
    const del = deliveries.find(d => d.id === selectedDoId);

    addInvoice({
      doId: del?.id,
      doNumber: del?.doNumber,
      customerName,
      customerAddress,
      customerTaxId,
      issueDate,
      dueDate,
      subtotal,
      ppnAmount: ppn,
      totalAmount: total,
      paymentTerms
    });

    setIsCreateModalOpen(false);
  };

  // Filter
  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.doNumber && inv.doNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['All', 'Sent', 'Partially_Paid', 'Paid', 'Overdue'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Invoice &amp; Piutang Usaha (AR)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan faktur tagihan, pencatatan pembayaran transfer bank, verifikasi faktur pajak, dan monitoring aging piutang.
          </p>
        </div>

        {hasPermission('invoice') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Invoice Baru</span>
          </button>
        )}
      </div>

      {/* AR Overview Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Nilai Tagihan Terbit</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            Rp {totalInvoiced.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {invoices.length} Faktur Keseluruhan
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Diterima (Paid AR)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            Rp {totalPaid.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Dana masuk ke rekening operasional
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Sisa Piutang Berjalan (Balance Due)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
            Rp {totalBalanceDue.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-indigo-600 mt-1">
            Belum tertagih penuh dari klien
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Tagihan Jatuh Tempo (Overdue)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-1">
            {overdueCount} <span className="text-xs font-normal text-slate-500">Faktur</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            Perlu surat penagihan / follow-up
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
              {st === 'All' ? 'Semua Faktur' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. Faktur, Klien, No. SJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Klien &amp; Ref DO</th>
                <th className="py-3 px-4">Tgl Terbit &amp; Jatuh Tempo</th>
                <th className="py-3 px-4 text-right">Total Faktur</th>
                <th className="py-3 px-4 text-right">Telah Dibayar</th>
                <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data invoice dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.paymentTerms}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        DO: {inv.doNumber || 'Manual Tagihan'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800">{inv.issueDate}</div>
                      <div className={`text-[11px] font-medium ${inv.status === 'Overdue' ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>
                        Jatuh Tempo: {inv.dueDate}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      Rp {inv.totalAmount.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700">
                      Rp {inv.paidAmount.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-rose-700">
                      Rp {inv.balanceDue.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'Partially_Paid'
                          ? 'bg-blue-100 text-blue-800'
                          : inv.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        title="Cetak Faktur Penjualan"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors inline-flex items-center"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.balanceDue > 0 && hasPermission('invoice') && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          title="Catat Pembayaran Masuk"
                          className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold rounded transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Catat Bayar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Payment */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Catat Penerimaan Pembayaran Invoice</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Faktur: <strong className="text-slate-800 font-mono">{payingInvoice.invoiceNumber}</strong> ({payingInvoice.customerName})
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Faktur:</span>
                  <span className="font-mono font-bold">Rp {payingInvoice.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sisa Tagihan Sekarang:</span>
                  <span className="font-mono font-bold text-rose-700">Rp {payingInvoice.balanceDue.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jumlah Pembayaran Diterima (Rp):</label>
                <input
                  type="number"
                  min="1"
                  max={payingInvoice.balanceDue}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-emerald-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Metode &amp; Rekening Tujuan:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                >
                  <option value="Bank Transfer BCA">Bank Transfer BCA (Rek: 542-099-8812)</option>
                  <option value="Bank Transfer Mandiri">Bank Transfer Mandiri (Rek: 120-00-9988771-5)</option>
                  <option value="Bank Transfer BNI">Bank Transfer BNI Operasional</option>
                  <option value="Giro / Cek">Giro / Bilyet Cek Kliring</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Referensi Transaksi Bank:</label>
                <input
                  type="text"
                  required
                  value={payRefNo}
                  onChange={(e) => setPayRefNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Catatan Tambahan:</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Invoice */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Terbitkan Faktur Tagihan (Invoice) Baru</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Surat Jalan Terkait (Opsional):</label>
                <select
                  value={selectedDoId}
                  onChange={(e) => handleDoSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                >
                  <option value="">-- Tanpa Surat Jalan (Manual Invoice) --</option>
                  {deliveries.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.doNumber} - {d.customerName} ({d.origin} → {d.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Perusahaan Klien:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alamat Tagihan Klien:</label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Terbit:</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nilai DPP (Subtotal Rp):</label>
                  <input
                    type="number"
                    required
                    value={subtotal}
                    onChange={(e) => setSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Termin Pembayaran:</label>
                  <input
                    type="text"
                    required
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span>PPN 11%:</span>
                  <span>Rp {Math.round((subtotal * 11) / 100).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-900 border-t border-slate-200 pt-1">
                  <span>Total Faktur:</span>
                  <span>Rp {(subtotal + Math.round((subtotal * 11) / 100)).toLocaleString('id-ID')}</span>
                </div>
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
                  Terbitkan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
