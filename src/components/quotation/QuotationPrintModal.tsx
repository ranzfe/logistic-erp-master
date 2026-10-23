import React from 'react';
import { Quotation } from '../../types/erp';
import { Printer, X } from 'lucide-react';

interface QuotationPrintModalProps {
  quotation: Quotation | null;
  onClose: () => void;
}

export const QuotationPrintModal: React.FC<QuotationPrintModalProps> = ({ quotation, onClose }) => {
  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print-overlay">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 no-print">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Format Cetak Resmi: Surat Penawaran Harga (Quotation)</h3>
            <p className="text-xs text-slate-500">Standar surat penawaran tarif freight logistik terstruktur</p>
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

        {/* Printable Quotation Document */}
        <div className="p-8 overflow-y-auto print:p-0 text-slate-900 print:text-black font-sans leading-relaxed text-xs">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-extrabold tracking-tight">PT LOGISTIX MULTI MODA NUSANTARA</div>
              <div className="text-xs text-slate-600 mt-1">
                Kawasan Logistik Marunda Center Blok B-08, Jakarta Utara<br />
                Divisi Komersial: sales@logistix-erp.co.id · Telepon: (021) 8892-1200
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold uppercase tracking-wider text-slate-900">SURAT PENAWARAN HARGA</div>
              <div className="text-sm font-bold font-mono text-indigo-700 print:text-black mt-1">
                {quotation.quotationNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Tanggal: {quotation.date}
              </div>
            </div>
          </div>

          {/* Recipient details */}
          <div className="my-5 p-3 rounded bg-slate-50 print:bg-transparent border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Kepada Yth:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{quotation.customerName}</div>
              <div className="text-slate-600">Up: {quotation.customerContact}</div>
              <div className="text-slate-500 font-mono">{quotation.customerEmail}</div>
            </div>
            <div className="space-y-1">
              <div><strong>Rute Pengiriman:</strong> {quotation.originCity} → {quotation.destinationCity}</div>
              <div><strong>Jenis Kebutuhan Armada:</strong> {quotation.truckTypeRequired}</div>
              <div><strong>Estimasi Muatan:</strong> {quotation.weightTon} Ton / {quotation.volumeCbm} CBM</div>
              <div><strong>Masa Berlaku Penawaran:</strong> <span className="font-semibold text-rose-700">s/d {quotation.validUntil}</span></div>
            </div>
          </div>

          <div className="mb-3 text-slate-700">
            Bersama ini kami mengajukan rincian penawaran tarif pengiriman kargo darat &amp; multimoda dengan spesifikasi sebagai berikut:
          </div>

          {/* Pricing Table */}
          <table className="w-full text-xs border border-slate-300 mb-6">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300 font-bold text-slate-700">
                <th className="p-2.5 text-left border-r border-slate-300 w-10">No.</th>
                <th className="p-2.5 text-left border-r border-slate-300">Deskripsi Layanan &amp; Rute</th>
                <th className="p-2.5 text-center border-r border-slate-300 w-16">Qty</th>
                <th className="p-2.5 text-center border-r border-slate-300 w-16">Satuan</th>
                <th className="p-2.5 text-right border-r border-slate-300 w-32">Tarif Satuan (Rp)</th>
                <th className="p-2.5 text-right w-36">Total (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="p-2.5 text-center border-r border-slate-300 font-mono">{idx + 1}</td>
                  <td className="p-2.5 border-r border-slate-300 font-medium">{item.description}</td>
                  <td className="p-2.5 text-center border-r border-slate-300 font-mono">{item.quantity}</td>
                  <td className="p-2.5 text-center border-r border-slate-300">{item.unit}</td>
                  <td className="p-2.5 text-right border-r border-slate-300 font-mono tabular-nums">
                    {item.unitPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold tabular-nums">
                    {item.totalPrice.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-300 font-semibold bg-slate-50 print:bg-transparent">
                <td colSpan={5} className="p-2 text-right border-r border-slate-300">Subtotal Freight:</td>
                <td className="p-2 text-right font-mono tabular-nums">Rp {quotation.subtotal.toLocaleString('id-ID')}</td>
              </tr>
              <tr className="font-semibold bg-slate-50 print:bg-transparent">
                <td colSpan={5} className="p-2 text-right border-r border-slate-300">PPN Jasa Logistik ({quotation.ppnPercent}%):</td>
                <td className="p-2 text-right font-mono tabular-nums">Rp {quotation.ppnAmount.toLocaleString('id-ID')}</td>
              </tr>
              <tr className="text-sm font-bold bg-slate-100 print:bg-slate-200 border-t-2 border-slate-400">
                <td colSpan={5} className="p-2.5 text-right border-r border-slate-300">TOTAL PENAWARAN (IDR):</td>
                <td className="p-2.5 text-right font-mono text-indigo-700 print:text-black tabular-nums">
                  Rp {quotation.totalAmount.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Terms & Conditions */}
          <div className="p-3 rounded bg-slate-50 print:bg-transparent border border-slate-200 mb-8 space-y-1">
            <div className="font-bold text-slate-800 uppercase text-[11px]">Syarat &amp; Ketentuan Operasional:</div>
            <p className="text-slate-600 leading-relaxed">{quotation.terms}</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t border-slate-300">
            <div>
              <div className="text-slate-500 mb-14">Hormat Kami,<br />PT LogistiX Multi Moda Nusantara</div>
              <div className="font-bold border-b border-slate-400 pb-1">
                {quotation.approvedBy || 'Maya Lestari, S.I.Kom.'}
              </div>
              <div className="text-[10px] text-slate-500">Divisi Komersial &amp; Pemasaran</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14">Menyetujui &amp; Konfirmasi Order,<br />{quotation.customerName}</div>
              <div className="font-bold border-b border-slate-400 pb-1">(............................................)</div>
              <div className="text-[10px] text-slate-500">Tanda Tangan &amp; Cap Perusahaan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
