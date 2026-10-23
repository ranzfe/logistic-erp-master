import React from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  LayoutDashboard, 
  Package, 
  Compass, 
  FileSpreadsheet, 
  Receipt, 
  CreditCard, 
  PieChart, 
  Wallet, 
  Truck, 
  History,
  Lock,
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  category: 'Utama' | 'Operasional' | 'Komersial & Keuangan' | 'Sistem';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    hasPermission, 
    deliveries, 
    quotations, 
    vendorPayments, 
    pettyCashTransactions 
  } = useErp();

  // Dynamic counter badges
  const activeDeliveriesCount = deliveries.filter(d => ['In Transit', 'Checkpoint', 'Loading'].includes(d.status)).length;
  const pendingQuotationsCount = quotations.filter(q => q.status === 'Sent').length;
  const pendingVendorBillsCount = vendorPayments.filter(v => v.status === 'Pending_Approval').length;
  const pendingPettyCashCount = pettyCashTransactions.filter(p => p.status === 'Submitted').length;

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard Analitik', icon: LayoutDashboard, category: 'Utama' },
    { id: 'delivery', label: 'Data Delivery', icon: Package, badge: activeDeliveriesCount, category: 'Operasional' },
    { id: 'monitoring', label: 'Monitoring Delivery', icon: Compass, category: 'Operasional' },
    { id: 'armada', label: 'Data Armada & Truk', icon: Truck, category: 'Operasional' },
    { id: 'quotation', label: 'Quotation Kargo', icon: FileSpreadsheet, badge: pendingQuotationsCount, category: 'Komersial & Keuangan' },
    { id: 'invoice', label: 'Invoice & Piutang (AR)', icon: Receipt, category: 'Komersial & Keuangan' },
    { id: 'vendor', label: 'Pembayaran Vendor (AP)', icon: CreditCard, badge: pendingVendorBillsCount, category: 'Komersial & Keuangan' },
    { id: 'pettycash', label: 'Petty Cash (Kas Kecil)', icon: Wallet, badge: pendingPettyCashCount, category: 'Komersial & Keuangan' },
    { id: 'profitloss', label: 'Profit and Loss (L/R)', icon: PieChart, category: 'Komersial & Keuangan' },
    { id: 'audit', label: 'Audit Trail Aktivitas', icon: History, category: 'Sistem' }
  ];

  // Group by category
  const categories: Array<MenuItem['category']> = ['Utama', 'Operasional', 'Komersial & Keuangan', 'Sistem'];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 flex-1 space-y-6 overflow-y-auto">
        {categories.map(cat => {
          const items = menuItems.filter(item => item.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                {cat}
              </div>
              <div className="space-y-0.5 mt-1.5">
                {items.map(item => {
                  const allowed = hasPermission(item.id);
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  if (!allowed) {
                    return (
                      <div
                        key={item.id}
                        title="Akses dibatasi sesuai Role pengguna saat ini"
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed opacity-60"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 shrink-0 text-slate-600" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                          isActive ? 'bg-white text-indigo-700' : 'bg-indigo-500/30 text-indigo-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between font-mono">
          <span>Database ERP:</span>
          <span className="text-emerald-400 font-semibold">Tersinkronisasi</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          PT LogistiX Multi Moda Nusantara
        </div>
      </div>
    </aside>
  );
};
