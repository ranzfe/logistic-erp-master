import React from 'react';
import { useErp } from '../../context/ErpContext';
import { ShieldCheck, Truck, TrendingUp, DollarSign, Wrench, X, Check } from 'lucide-react';
import { UserRole } from '../../types/erp';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser, switchUser } = useErp();

  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'ops_manager':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'sales_executive':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'finance_officer':
        return <DollarSign className="w-5 h-5 text-amber-600" />;
      case 'fleet_supervisor':
        return <Wrench className="w-5 h-5 text-purple-600" />;
    }
  };

  const getRolePermissionsDescription = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Hak Akses Penuh: Otorisasi quotation, seluruh modul operasional, monitoring, vendor AP, petty cash, dan laporan komprehensif Laba Rugi (P&L).';
      case 'ops_manager':
        return 'Hak Akses Operasional: Penerbitan Surat Jalan (DO), monitoring posisi armada, penugasan supir & truk, konfirmasi POD, cek kesiapan armada.';
      case 'sales_executive':
        return 'Hak Akses Komersial: Pembuatan & perhitungan Quotation kargo, kalkulasi estimasi margin, CRM klien, monitoring status tagihan invoice (read-only).';
      case 'finance_officer':
        return 'Hak Akses Finansial: Penerbitan Faktur (Invoice AR), pencatatan pelunasan, verifikasi tagihan Vendor AP, rekonsiliasi Kas Kecil, laporan P&L.';
      case 'fleet_supervisor':
        return 'Hak Akses Lapangan & Bengkel: Update checkpoint rute, pelaporan kendala/delay, inspeksi armada, pengajuan klaim kas kecil supir (BBM/Tol).';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pilih Profil Akses Pengguna (RBAC 5 Role)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Uji coba simulasi hak akses sesuai struktur organisasi operasional</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {allUsers.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  onClose();
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({user.department})</span>
                      </div>
                      <div className="text-xs font-semibold text-indigo-700 mt-0.5">
                        {user.roleTitle}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {getRolePermissionsDescription(user.role)}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>Aktif</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Sistem akan menyesuaikan menu navigasi & perizinan tombol secara real-time.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
