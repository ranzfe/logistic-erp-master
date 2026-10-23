import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { PettyCashTransaction, PettyCashCategory, PettyCashType } from '../../types/erp';
import { 
  Wallet, 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  ShieldCheck, 
  FileCheck, 
  X, 
  DollarSign,
  Fuel,
  CreditCard
} from 'lucide-react';

export const PettyCashManagement: React.FC = () => {
  const { 
    pettyCashTransactions, 
    pettyCashBalance, 
    deliveries, 
    armadaList, 
    addPettyCashTransaction, 
    approvePettyCash, 
    reconcilePettyCash, 
    currentUser, 
    hasPermission 
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal: Claim Expense (Cash Out)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimCategory, setClaimCategory] = useState<PettyCashCategory>('Tol & E-Toll');
  const [claimAmount, setClaimAmount] = useState<number>(500000);
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoId, setSelectedDoId] = useState('');
  const [selectedArmadaId, setSelectedArmadaId] = useState('');
  const [claimantName, setClaimantName] = useState(currentUser.name);
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Modal: Top-up Fund (Cash In)
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(10000000);
  const [topupDate, setTopupDate] = useState(new Date().toISOString().split('T')[0]);
  const [topupSource, setTopupSource] = useState('Tarik Tunai Giro Bank BCA Operasional');
  const [topupReceipt, setTopupReceipt] = useState(`CHQ-BCA-${Date.now().toString().slice(-4)}`);

  // Summaries
  const totalIn = pettyCashTransactions
    .filter(t => t.type === 'Cash_In' && t.status !== 'Rejected')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = pettyCashTransactions
    .filter(t => t.type === 'Cash_Out' && (t.status === 'Approved' || t.status === 'Reconciled'))
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingClaims = pettyCashTransactions.filter(t => t.status === 'Submitted');

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedDo = deliveries.find(d => d.id === selectedDoId);
    const linkedArm = armadaList.find(a => a.id === selectedArmadaId);

    addPettyCashTransaction({
      type: 'Cash_Out',
      category: claimCategory,
      amount: claimAmount,
      date: claimDate,
      linkedDoId: linkedDo?.id,
      linkedDoNumber: linkedDo?.doNumber,
      linkedArmadaId: linkedArm?.id,
      plateNumber: linkedArm?.plateNumber,
      claimantName: claimantName || currentUser.name,
      claimantRole: currentUser.roleTitle,
      description,
      receiptNumber
    });

    setIsClaimModalOpen(false);
    setDescription('');
    setReceiptNumber('');
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPettyCashTransaction({
      type: 'Cash_In',
      category: 'Top-up Saldo Kas',
      amount: topupAmount,
      date: topupDate,
      claimantName: currentUser.name,
      claimantRole: currentUser.roleTitle,
      description: topupSource,
      receiptNumber: topupReceipt
    });

    setIsTopupModalOpen(false);
  };

  // Filter
  const filteredTransactions = pettyCashTransactions.filter(t => {
    const matchSearch = 
      t.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.linkedDoNumber && t.linkedDoNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.plateNumber && t.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const categories: string[] = [
    'All',
    'Tol & E-Toll',
    'BBM & Solar',
    'Uang Saku Supir',
    'Perbaikan Ringan / Tambal Ban',
    'Parkir & Retribusi',
    'Operasional Kantor',
    'Top-up Saldo Kas'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Petty Cash (Kas Kecil &amp; Uang Jalan)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan pengeluaran riil supir (BBM, E-Toll, uang makan), klaim nota perbaikan darurat, dan top-up kas operasional.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {hasPermission('pettycash') && (
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Klaim Pengeluaran Jalan</span>
            </button>
          )}

          {['super_admin', 'finance_officer'].includes(currentUser.role) && (
            <button
              onClick={() => setIsTopupModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Top-up Saldo Kas</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Saldo Kas Kecil Tersedia (On Hand)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            Rp {pettyCashBalance.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Siap untuk uang jalan supir &amp; kebutuhan darurat
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Kas Masuk (Pencairan Bank)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            Rp {totalIn.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Akumulasi penarikan giro operasional
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Pengeluaran Kas (Disbursement)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-1">
            Rp {totalOut.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            BBM, E-toll, perbaikan, &amp; uang saku supir
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Menunggu Approval Finance</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-700 mt-1">
            {pendingClaims.length} <span className="text-xs font-normal text-slate-500">Voucher</span>
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">
            Klaim supir yang perlu diverifikasi nota
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
            placeholder="Cari Voucher, Supir, Uraian, DO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Petty Cash Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Voucher &amp; Tgl</th>
                <th className="py-3 px-4">Tipe &amp; Kategori</th>
                <th className="py-3 px-4">Uraian &amp; No. Bukti Nota</th>
                <th className="py-3 px-4">Terkait DO / Armada</th>
                <th className="py-3 px-4">Pemohon (Claimant)</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Otorisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan mutasi kas kecil dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{tx.voucherNumber}</div>
                      <div className="text-[11px] text-slate-500">{tx.date}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-semibold">
                        {tx.type === 'Cash_In' ? (
                          <span className="text-emerald-700 flex items-center">
                            <ArrowDownLeft className="w-3.5 h-3.5 mr-0.5" /> Masuk
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center">
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Keluar
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600">{tx.category}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 leading-snug">{tx.description}</div>
                      {tx.receiptNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">Nota: {tx.receiptNumber}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {tx.linkedDoNumber && (
                        <div className="font-mono text-slate-800 font-medium">DO: {tx.linkedDoNumber}</div>
                      )}
                      {tx.plateNumber && (
                        <div className="font-mono text-slate-600 text-[11px]">{tx.plateNumber}</div>
                      )}
                      {!tx.linkedDoNumber && !tx.plateNumber && (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{tx.claimantName}</div>
                      <div className="text-[10px] text-slate-500">{tx.claimantRole}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={tx.type === 'Cash_In' ? 'text-emerald-700' : 'text-slate-900'}>
                        {tx.type === 'Cash_In' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        tx.status === 'Reconciled'
                          ? 'bg-purple-100 text-purple-800'
                          : tx.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.status === 'Submitted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {tx.status === 'Submitted' && ['super_admin', 'finance_officer', 'ops_manager'].includes(currentUser.role) && (
                        <button
                          onClick={() => approvePettyCash(tx.id)}
                          title="Setujui Pengeluaran Kas Kecil"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                      )}

                      {tx.status === 'Approved' && ['super_admin', 'finance_officer'].includes(currentUser.role) && (
                        <button
                          onClick={() => reconcilePettyCash(tx.id)}
                          title="Verifikasi Bukti Fisik / Rekonsiliasi"
                          className="px-2 py-1 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-800 font-bold rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Rekon</span>
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

      {/* Modal: Claim Expense (Cash Out) */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Formulir Klaim Kas Kecil / Biaya Jalan</h3>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kategori Pengeluaran:</label>
                <select
                  value={claimCategory}
                  onChange={(e) => setClaimCategory(e.target.value as PettyCashCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                >
                  <option value="Tol & E-Toll">Tol &amp; E-Toll Trans-Jawa / Tol Kota</option>
                  <option value="BBM & Solar">BBM &amp; Biosolar / Dexlite</option>
                  <option value="Uang Saku Supir">Uang Saku &amp; Uang Makan Supir/Kernet</option>
                  <option value="Perbaikan Ringan / Tambal Ban">Perbaikan Ringan / Tambal Ban Darurat</option>
                  <option value="Parkir & Retribusi">Parkir &amp; Retribusi Timbangan / Jembatan</option>
                  <option value="Konsumsi & Lembur Lapangan">Konsumsi &amp; Lembur Bongkar Muat</option>
                  <option value="Operasional Kantor">Operasional Kantor (ATK / Materai / Toner)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nominal Biaya (Rp):</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-sm"
                />
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
                        {d.doNumber} ({d.plateNumber})
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

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Pemohon (Supir/Staff):</label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Resi / Nota Fisik:</label>
                <input
                  type="text"
                  placeholder="Contoh: STRUK-SPBU-88190 / ALFA-ET-221"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi / Uraian Lengkap:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Penjelasan kebutuhan operasional rute..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
                >
                  Ajukan Voucher Kas Kecil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Top-up Petty Cash (Cash In) */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Top-up Penambahan Saldo Kas Kecil</h3>
              <button onClick={() => setIsTopupModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jumlah Dana Masuk (Rp):</label>
                <input
                  type="number"
                  required
                  min="100000"
                  step="100000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-base text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tanggal Masuk Kas:</label>
                <input
                  type="date"
                  required
                  value={topupDate}
                  onChange={(e) => setTopupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sumber Penarikan Dana:</label>
                <input
                  type="text"
                  required
                  value={topupSource}
                  onChange={(e) => setTopupSource(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Cek / Referensi Penarikan:</label>
                <input
                  type="text"
                  required
                  value={topupReceipt}
                  onChange={(e) => setTopupReceipt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTopupModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                >
                  Konfirmasi Dana Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
