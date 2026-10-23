import React from 'react';
import { Invoice } from '../../types/erp';
import { Printer, X } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print-overlay">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 no-print">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Format Cetak Resmi: Faktur Penjualan &amp; Tagihan (Invoice)</h3>
            <p className="text-xs text-slate-500">Faktur penagihan resmi standar akuntansi perpajakan Indonesia</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Page */}
        <div className="p-8 overflow-y-auto print:p-0 text-slate-900 print:text-black font-sans leading-relaxed text-xs">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-extrabold tracking-tight">PT LOGISTIX MULTI MODA NUSANTARA</div>
              <div className="text-xs text-slate-600 mt-1">
                Kawasan Logistik Pergudangan Marunda Center Blok B-08, Jakarta Utara<br />
                NPWP: 01.442.890.1-045.000 · Telp: (021) 8892-1200 · finance@logistix-erp.co.id
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold uppercase tracking-wider text-slate-900">FAKTUR TAGIHAN (INVOICE)</div>
              <div className="text-sm font-bold font-mono text-indigo-700 print:text-black mt-1">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Tanggal Terbit: {invoice.issueDate}
              </div>
              <div className="text-xs font-semibold text-rose-700 mt-0.5">
                Jatuh Tempo: {invoice.dueDate}
              </div>
            </div>
          </div>

          {/* Customer / Billed To */}
          <div className="my-5 p-3 rounded bg-slate-50 print:bg-transparent border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Ditagihkan Kepada:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{invoice.customerName}</div>
              <div className="text-slate-600">{invoice.customerAddress}</div>
              <div className="text-slate-600 mt-1"><strong>NPWP:</strong> {invoice.customerTaxId || '-'}</div>
            </div>
            <div className="space-y-1">
              <div><strong>Referensi Surat Jalan:</strong> <span className="font-mono">{invoice.doNumber || '-'}</span></div>
              <div><strong>Termin Pembayaran:</strong> {invoice.paymentTerms}</div>
              <div><strong>Status Pelunasan:</strong> <span className="font-bold text-indigo-700">{invoice.status}</span></div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-xs border border-slate-300 mb-6">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300 font-bold text-slate-700">
                <th className="p-2.5 text-left border-r border-slate-300 w-12">No.</th>
                <th className="p-2.5 text-left border-r border-slate-300">Deskripsi Layanan &amp; Pengiriman Kargo</th>
                <th className="p-2.5 text-right w-44">Jumlah Tagihan (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 text-center border-r border-slate-300 font-mono">1</td>
                <td className="p-2.5 border-r border-slate-300">
                  <div className="font-medium">Jasa Pengiriman Logistik Darat Multimoda</div>
                  <div className="text-slate-500 text-[11px]">Sesuai Surat Jalan resmi {invoice.doNumber || invoice.invoiceNumber}</div>
                </td>
                <td className="p-2.5 text-right font-mono font-semibold tabular-nums">
                  {invoice.subtotal.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-300 font-semibold bg-slate-50 print:bg-transparent">
                <td colSpan={2} className="p-2 text-right border-r border-slate-300">Dasar Pengenaan Pajak (DPP):</td>
                <td className="p-2 text-right font-mono tabular-nums">Rp {invoice.subtotal.toLocaleString('id-ID')}</td>
              </tr>
              <tr className="font-semibold bg-slate-50 print:bg-transparent">
                <td colSpan={2} className="p-2 text-right border-r border-slate-300">PPN Jasa Kena Pajak (11%):</td>
                <td className="p-2 text-right font-mono tabular-nums">Rp {invoice.ppnAmount.toLocaleString('id-ID')}</td>
              </tr>
              <tr className="text-sm font-bold bg-slate-100 print:bg-slate-200 border-t-2 border-slate-400">
                <td colSpan={2} className="p-2.5 text-right border-r border-slate-300">TOTAL FAKTUR:</td>
                <td className="p-2.5 text-right font-mono text-indigo-700 print:text-black tabular-nums">
                  Rp {invoice.totalAmount.toLocaleString('id-ID')}
                </td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={2} className="p-2 text-right border-r border-slate-300 text-emerald-700">Telah Dibayar (Paid):</td>
                <td className="p-2 text-right font-mono text-emerald-700 tabular-nums">Rp {invoice.paidAmount.toLocaleString('id-ID')}</td>
              </tr>
              <tr className="font-bold bg-indigo-50/50 print:bg-transparent">
                <td colSpan={2} className="p-2 text-right border-r border-slate-300 text-rose-700">Sisa Tagihan (Balance Due):</td>
                <td className="p-2 text-right font-mono text-rose-700 tabular-nums">Rp {invoice.balanceDue.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>

          {/* Payment Bank Details (Standard Indonesian Corporate Transfer) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded bg-slate-50 print:bg-transparent border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 uppercase text-[11px]">Instruksi Pembayaran Bank:</div>
              <div className="text-slate-700 leading-relaxed">
                Pembayaran harap ditransfer secara penuh (full amount) ke:<br />
                <strong>Bank Central Asia (BCA) KCP Kelapa Gading</strong><br />
                No. Rekening: <span className="font-mono font-bold text-indigo-700 print:text-black">542-099-8812</span><br />
                Atas Nama: <strong>PT LOGISTIX MULTI MODA NUSANTARA</strong>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-50 print:bg-transparent border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 uppercase text-[11px]">Rekening Alternatif:</div>
              <div className="text-slate-700 leading-relaxed">
                <strong>Bank Mandiri Cabang Tanjung Priok</strong><br />
                No. Rekening: <span className="font-mono font-bold text-slate-900">120-00-9988771-5</span><br />
                A.N. <strong>PT LOGISTIX MULTI MODA NUSANTARA</strong>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t border-slate-300">
            <div>
              <div className="text-slate-400 text-[10px] mb-2">[Materai Tempel Rp 10.000 jika &gt; Rp 5 Jt]</div>
              <div className="w-24 h-16 border border-dashed border-slate-300 mx-auto rounded flex items-center justify-center text-[10px] text-slate-400">
                Materai 10.000
              </div>
            </div>

            <div>
              <div className="text-slate-500 mb-14">Hormat Kami,<br />PT LogistiX Multi Moda Nusantara</div>
              <div className="font-bold border-b border-slate-400 pb-1">
                Ratna Dewi, Ak., CA
              </div>
              <div className="text-[10px] text-slate-500">Finance &amp; Accounting Officer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
