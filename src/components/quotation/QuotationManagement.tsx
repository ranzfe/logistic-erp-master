import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Quotation, QuotationItem, QuotationStatus, TruckType } from '../../types/erp';
import { QuotationPrintModal } from './QuotationPrintModal';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle, 
  XCircle, 
  ArrowRightCircle, 
  Trash2, 
  TrendingUp, 
  X, 
  ShieldCheck 
} from 'lucide-react';

export const QuotationManagement: React.FC = () => {
  const { 
    quotations, 
    armadaList, 
    addQuotation, 
    updateQuotationStatus, 
    convertQuotationToDelivery, 
    currentUser, 
    hasPermission 
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quotation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Convert Modal State
  const [convertingQuote, setConvertingQuote] = useState<Quotation | null>(null);
  const [convertArmadaId, setConvertArmadaId] = useState('');
  const [convertDriverName, setConvertDriverName] = useState('');
  const [convertDriverPhone, setConvertDriverPhone] = useState('');
  const [convertDepartureDate, setConvertDepartureDate] = useState(new Date().toISOString().split('T')[0]);

  // Create Form State
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [originCity, setOriginCity] = useState('Jakarta');
  const [destinationCity, setDestinationCity] = useState('Surabaya');
  const [cargoDescription, setCargoDescription] = useState('');
  const [weightTon, setWeightTon] = useState<number>(15);
  const [volumeCbm, setVolumeCbm] = useState<number>(35);
  const [truckTypeRequired, setTruckTypeRequired] = useState<TruckType>('Tronton Wingbox');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [terms, setTerms] = useState('Termin pembayaran TOP 30 hari kalender setelah faktur dan Surat Jalan asli diterima.');
  const [ppnPercent, setPpnPercent] = useState<number>(11);

  // Line items
  const [items, setItems] = useState<QuotationItem[]>([
    { id: '1', description: 'Freight Charter Jakarta - Surabaya', quantity: 1, unit: 'Trip', unitPrice: 16000000, totalPrice: 16000000 },
    { id: '2', description: 'Jasa Muat & Bongkar (Loading/Unloading)', quantity: 1, unit: 'Lump sum', unitPrice: 1000000, totalPrice: 1000000 }
  ]);

  // Cost estimates for margin calculation
  const [estimatedVendorCost, setEstimatedVendorCost] = useState<number>(7500000);
  const [estimatedPettyCost, setEstimatedPettyCost] = useState<number>(2800000);

  // Calculations
  const calculatedSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const calculatedPpn = Math.round((calculatedSubtotal * ppnPercent) / 100);
  const calculatedTotal = calculatedSubtotal + calculatedPpn;
  const totalCost = estimatedVendorCost + estimatedPettyCost;
  const marginPercent = calculatedSubtotal > 0 ? (((calculatedSubtotal - totalCost) / calculatedSubtotal) * 100).toFixed(1) : '0';

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unit: 'Trip',
      unitPrice: 0,
      totalPrice: 0
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof QuotationItem, val: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0) return;

    addQuotation({
      customerId: `cust-${Date.now()}`,
      customerName,
      customerContact,
      customerEmail,
      date: new Date().toISOString().split('T')[0],
      validUntil,
      originCity,
      destinationCity,
      cargoDescription,
      weightTon,
      volumeCbm,
      truckTypeRequired,
      items,
      ppnPercent,
      estimatedVendorCost,
      estimatedPettyCost,
      terms
    });

    setIsCreateModalOpen(false);
  };

  const handleOpenConvert = (q: Quotation) => {
    setConvertingQuote(q);
    const available = armadaList.find(a => a.status === 'Available') || armadaList[0];
    if (available) {
      setConvertArmadaId(available.id);
      setConvertDriverName(available.currentDriverName || 'Supir Penugasan');
      setConvertDriverPhone(available.currentDriverPhone || '+62 812-0000-0000');
    }
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingQuote || !convertArmadaId) return;

    convertQuotationToDelivery(
      convertingQuote.id,
      convertArmadaId,
      convertDriverName,
      convertDriverPhone,
      convertDepartureDate
    );

    setConvertingQuote(null);
  };

  // Filter
  const filteredQuotations = quotations.filter(q => {
    const matchSearch = 
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['All', 'Sent', 'Approved', 'Converted', 'Draft', 'Rejected'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Quotation (Penawaran Kargo)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan surat penawaran tarif freight, simulasi estimasi margin kotor, dan konversi 1-klik ke Surat Jalan &amp; Faktur.
          </p>
        </div>

        {hasPermission('quotation') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Quotation Baru</span>
          </button>
        )}
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
              {st === 'All' ? 'Semua Penawaran' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. QT, Klien, Rute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Penawaran</th>
                <th className="py-3 px-4">Klien &amp; Kebutuhan</th>
                <th className="py-3 px-4">Rute Pengiriman</th>
                <th className="py-3 px-4 text-right">Nilai Total (IDR)</th>
                <th className="py-3 px-4 text-center">Estimasi Margin</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi &amp; Konversi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data quotation dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{q.quotationNumber}</div>
                      <div className="text-[11px] text-slate-500">Tgl: {q.date}</div>
                      <div className="text-[10px] text-slate-400">Berlaku s/d {q.validUntil}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{q.customerName}</div>
                      <div className="text-slate-500 truncate max-w-xs">{q.cargoDescription}</div>
                      <div className="text-[11px] text-slate-400">{q.truckTypeRequired}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {q.originCity} → {q.destinationCity}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {q.weightTon} Ton · {q.volumeCbm} CBM
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold tabular-nums text-slate-900">
                        Rp {q.totalAmount.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        DPP: Rp {q.subtotal.toLocaleString('id-ID')}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        {q.estimatedMarginPercent}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        q.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.status === 'Converted'
                          ? 'bg-purple-100 text-purple-800'
                          : q.status === 'Sent'
                          ? 'bg-blue-100 text-blue-800'
                          : q.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedQuoteForPrint(q)}
                        title="Cetak Surat Penawaran Resmi"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors inline-flex items-center"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Approval buttons for Super Admin or Sales */}
                      {q.status === 'Sent' && hasPermission('quotation') && (
                        <>
                          <button
                            onClick={() => updateQuotationStatus(q.id, 'Approved')}
                            title="Setujui Penawaran (Approve)"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors inline-flex items-center"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateQuotationStatus(q.id, 'Rejected')}
                            title="Tolak Penawaran"
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors inline-flex items-center"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Convert to Delivery Order & Invoice */}
                      {(q.status === 'Approved' || q.status === 'Sent') && (
                        <button
                          onClick={() => handleOpenConvert(q)}
                          title="Konversi ke Surat Jalan & Faktur Tagihan"
                          className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold rounded transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5" />
                          <span>Jadikan DO</span>
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

      {/* Modal: Create Quotation */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Buat Surat Penawaran Harga (Quotation) Kargo Baru</h3>
                <p className="text-xs text-slate-500">Rancang item tarif, estimasi biaya vendor/petty cash, dan simulasi margin</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Customer Details */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Perusahaan Klien:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Kalbe Farma Tbk"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama PIC / Kontak:</label>
                  <input
                    type="text"
                    placeholder="Bpk. Hendra (Procurement)"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Resmi Klien:</label>
                  <input
                    type="email"
                    placeholder="procurement@client.co.id"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Route & Cargo */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota Asal Muat:</label>
                  <input
                    type="text"
                    required
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota Tujuan:</label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kebutuhan Armada:</label>
                  <select
                    value={truckTypeRequired}
                    onChange={(e) => setTruckTypeRequired(e.target.value as TruckType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                  >
                    <option value="Tronton Wingbox">Tronton Wingbox (10 Roda)</option>
                    <option value="Fuso Heavy Cargo">Fuso Heavy Cargo</option>
                    <option value="CDD Box (Colt Diesel)">CDD Box (Colt Diesel)</option>
                    <option value="CDE Engkel Box">CDE Engkel Box</option>
                    <option value="Trailer 40ft">Trailer 40ft</option>
                    <option value="Blind Van High Roof">Blind Van High Roof</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Masa Berlaku:</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Deskripsi Muatan Kargo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Obat-obatan kemasan karton box steril (suhu 20-25C)"
                    value={cargoDescription}
                    onChange={(e) => setCargoDescription(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tonase (Ton):</label>
                    <input
                      type="number"
                      value={weightTon}
                      onChange={(e) => setWeightTon(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Volume (CBM):</label>
                    <input
                      type="number"
                      value={volumeCbm}
                      onChange={(e) => setVolumeCbm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Rincian Komponen Tarif (Line Items)</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={it.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Deskripsi layanan freight..."
                          value={it.description}
                          onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={it.quantity}
                          onChange={(e) => handleUpdateItem(it.id, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleUpdateItem(it.id, 'unit', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          value={it.unitPrice}
                          onChange={(e) => handleUpdateItem(it.id, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-right"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Margin & Cost Estimation Simulator */}
              <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-indigo-900 text-xs">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-700" />
                    Kalkulator Estimasi Biaya &amp; Laba Kotor (Live Margin Simulator)
                  </span>
                  <span className="text-emerald-700 font-mono text-sm font-bold">
                    Margin: {marginPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Estimasi Vendor AP (Kapal/BBM/Subcon):</label>
                    <input
                      type="number"
                      value={estimatedVendorCost}
                      onChange={(e) => setEstimatedVendorCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Estimasi Kas Kecil (Tol/Supir/BBM):</label>
                    <input
                      type="number"
                      value={estimatedPettyCost}
                      onChange={(e) => setEstimatedPettyCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Estimasi Laba Kotor Trip:</label>
                    <div className="px-3 py-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-emerald-700">
                      Rp {(calculatedSubtotal - totalCost).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between font-mono text-xs">
                <span>Subtotal: Rp {calculatedSubtotal.toLocaleString('id-ID')}</span>
                <span>PPN 11%: Rp {calculatedPpn.toLocaleString('id-ID')}</span>
                <strong className="text-sm font-bold text-indigo-900">
                  Total Final: Rp {calculatedTotal.toLocaleString('id-ID')}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
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
                  Terbitkan Surat Penawaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 1-Click Convert Quotation to Delivery & Invoice */}
      {convertingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Konversi Penawaran ke Surat Jalan &amp; Faktur
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengintegrasikan Quotation <strong className="text-slate-900">{convertingQuote.quotationNumber}</strong> langsung ke operasional &amp; keuangan.
              </p>
            </div>

            <form onSubmit={handleConfirmConvert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Armada untuk Surat Jalan ini:</label>
                <select
                  value={convertArmadaId}
                  onChange={(e) => {
                    setConvertArmadaId(e.target.value);
                    const arm = armadaList.find(a => a.id === e.target.value);
                    if (arm?.currentDriverName) setConvertDriverName(arm.currentDriverName);
                    if (arm?.currentDriverPhone) setConvertDriverPhone(arm.currentDriverPhone);
                  }}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                >
                  <option value="">-- Pilih Truk --</option>
                  {armadaList.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.plateNumber} - {a.truckType} ({a.brandModel}) [Status: {a.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Supir Bertugas:</label>
                <input
                  type="text"
                  required
                  value={convertDriverName}
                  onChange={(e) => setConvertDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">No. Kontak Supir:</label>
                <input
                  type="text"
                  required
                  value={convertDriverPhone}
                  onChange={(e) => setConvertDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tanggal Mulai Keberangkatan:</label>
                <input
                  type="date"
                  required
                  value={convertDepartureDate}
                  onChange={(e) => setConvertDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="p-3 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-1">
                <div className="font-bold text-[11px]">Sistem Akan Otomatis Membuat:</div>
                <ul className="list-disc list-inside text-[11px] text-indigo-800 space-y-0.5">
                  <li>Surat Jalan (DO) baru dengan nomor urut berikutnya</li>
                  <li>Faktur Tagihan (Invoice AR) senilai Rp {convertingQuote.totalAmount.toLocaleString('id-ID')}</li>
                  <li>Mengubah status truk menjadi Scheduled</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConvertingQuote(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
                >
                  Konfirmasi Konversi Terpadu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {selectedQuoteForPrint && (
        <QuotationPrintModal
          quotation={selectedQuoteForPrint}
          onClose={() => setSelectedQuoteForPrint(null)}
        />
      )}
    </div>
  );
};
