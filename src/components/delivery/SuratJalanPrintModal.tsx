import React from 'react';
import { DeliveryOrder } from '../../types/erp';
import { Printer, X } from 'lucide-react';

interface SuratJalanPrintModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
}

export const SuratJalanPrintModal: React.FC<SuratJalanPrintModalProps> = ({ delivery, onClose }) => {
  if (!delivery) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print-overlay">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 no-print">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Format Cetak Resmi: Surat Jalan Pengiriman (DO)</h3>
            <p className="text-xs text-slate-500">Standar dokumen fisik operasional logistik darat &amp; kargo</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (Standard Indonesian Surat Jalan) */}
        <div className="p-8 overflow-y-auto print:p-0 text-slate-900 print:text-black font-sans leading-relaxed">
          {/* Header Company */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-extrabold tracking-tight">PT LOGISTIX MULTI MODA NUSANTARA</div>
              <div className="text-xs text-slate-600 mt-1">
                Kawasan Logistik Pergudangan Marunda Center Blok B-08, Jl. Marunda Makmur, Jakarta Utara<br />
                Telp: (021) 8892-1200 · Fax: (021) 8892-1201 · Email: ops@logistix-erp.co.id
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold uppercase tracking-wider text-slate-900">SURAT JALAN (DO)</div>
              <div className="text-sm font-bold font-mono text-indigo-700 print:text-black mt-1">
                {delivery.doNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Tanggal: {delivery.departureDate}
              </div>
            </div>
          </div>

          {/* Meta Route & Customer */}
          <div className="grid grid-cols-2 gap-6 my-5 text-xs">
            <div className="space-y-1.5 p-3 rounded bg-slate-50 print:bg-transparent border border-slate-200">
              <div className="font-bold text-slate-700 uppercase">Pengirim / Asal Muat:</div>
              <div className="font-semibold text-slate-900">{delivery.origin}</div>
              <div className="text-slate-600">{delivery.originAddress}</div>
            </div>

            <div className="space-y-1.5 p-3 rounded bg-slate-50 print:bg-transparent border border-slate-200">
              <div className="font-bold text-slate-700 uppercase">Penerima / Tujuan Bongkar:</div>
              <div className="font-semibold text-slate-900">{delivery.customerName}</div>
              <div className="text-slate-600">{delivery.destinationAddress}</div>
            </div>
          </div>

          {/* Transport & Vehicle Details */}
          <div className="grid grid-cols-4 gap-4 p-3 bg-slate-100 print:bg-transparent border border-slate-300 rounded text-xs mb-5">
            <div>
              <span className="text-slate-500 block">Nomor Polisi:</span>
              <strong className="font-mono text-sm">{delivery.plateNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Tipe Armada:</span>
              <strong>{delivery.truckType}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Supir Bertugas:</span>
              <strong>{delivery.driverName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">No. Kontak Supir:</span>
              <span className="font-mono">{delivery.driverPhone}</span>
            </div>
          </div>

          {/* Cargo Table */}
          <table className="w-full text-xs border border-slate-300 mb-6">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300 font-bold text-slate-700">
                <th className="p-2.5 text-left border-r border-slate-300 w-12">No.</th>
                <th className="p-2.5 text-left border-r border-slate-300">Deskripsi Barang / Muatan</th>
                <th className="p-2.5 text-center border-r border-slate-300 w-24">Tonase</th>
                <th className="p-2.5 text-center border-r border-slate-300 w-24">Volume</th>
                <th className="p-2.5 text-left">Keterangan / Segel</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 text-center border-r border-slate-300 font-mono">1</td>
                <td className="p-2.5 border-r border-slate-300 font-medium">
                  {delivery.cargoDescription}
                </td>
                <td className="p-2.5 text-center border-r border-slate-300 font-mono">
                  {delivery.weightTon} Ton
                </td>
                <td className="p-2.5 text-center border-r border-slate-300 font-mono">
                  {delivery.volumeCbm} CBM
                </td>
                <td className="p-2.5 text-slate-600">
                  {delivery.notes || 'Kondisi kemasan utuh bersegel'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures Area (Standard Indonesian 4-box verification) */}
          <div className="grid grid-cols-4 gap-4 text-center text-xs mt-8 pt-4 border-t border-slate-300">
            <div>
              <div className="text-slate-500 mb-14">Disiapkan Oleh (Dispatcher):</div>
              <div className="font-bold border-b border-slate-400 pb-1">Budi Santoso</div>
              <div className="text-[10px] text-slate-500">Ops &amp; Dispatch Mgr</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14">Supir Pembawa Kargo:</div>
              <div className="font-bold border-b border-slate-400 pb-1">{delivery.driverName}</div>
              <div className="text-[10px] text-slate-500">{delivery.plateNumber}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14">Pengirim / Gudang Asal:</div>
              <div className="font-bold border-b border-slate-400 pb-1">(....................................)</div>
              <div className="text-[10px] text-slate-500">Tanda Tangan &amp; Cap</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14">Diterima Dengan Baik Oleh:</div>
              <div className="font-bold border-b border-slate-400 pb-1">
                {delivery.podSignerName || '(....................................)'}
              </div>
              <div className="text-[10px] text-slate-500">Penerima &amp; Cap Gudang</div>
            </div>
          </div>

          <div className="mt-8 text-[10px] text-slate-400 text-center border-t border-slate-200 pt-3">
            * Putih: Untuk Penagihan Finance &nbsp;|&nbsp; Merah: Arsip Pengirim &nbsp;|&nbsp; Kuning: Penerima &nbsp;|&nbsp; Hijau: Supir / Lapangan
          </div>
        </div>
      </div>
    </div>
  );
};
