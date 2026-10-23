/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationToast } from './components/common/NotificationToast';
import { DashboardAnalytics } from './components/dashboard/DashboardAnalytics';
import { DeliveryManagement } from './components/delivery/DeliveryManagement';
import { RealtimeMonitoring } from './components/monitoring/RealtimeMonitoring';
import { QuotationManagement } from './components/quotation/QuotationManagement';
import { InvoiceManagement } from './components/invoice/InvoiceManagement';
import { VendorPaymentManagement } from './components/vendor/VendorPaymentManagement';
import { ProfitLossView } from './components/profitloss/ProfitLossView';
import { PettyCashManagement } from './components/pettycash/PettyCashManagement';
import { ArmadaManagement } from './components/armada/ArmadaManagement';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { ShieldAlert } from 'lucide-react';

const ErpMainContent: React.FC = () => {
  const { hasPermission, currentUser } = useErp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // If role does not have access to current tab, fallback to dashboard
  useEffect(() => {
    if (!hasPermission(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab, hasPermission]);

  const renderContent = () => {
    if (!hasPermission(activeTab)) {
      return (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Akses Terbatas</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Role Anda saat ini (<strong className="text-slate-800">{currentUser.roleTitle}</strong>) tidak memiliki izin untuk membuka modul ini.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-xs"
          >
            Kembali ke Dashboard
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardAnalytics setActiveTab={setActiveTab} />;
      case 'delivery':
        return <DeliveryManagement />;
      case 'monitoring':
        return <RealtimeMonitoring />;
      case 'quotation':
        return <QuotationManagement />;
      case 'invoice':
        return <InvoiceManagement />;
      case 'vendor':
        return <VendorPaymentManagement />;
      case 'profitloss':
        return <ProfitLossView />;
      case 'pettycash':
        return <PettyCashManagement />;
      case 'armada':
        return <ArmadaManagement />;
      case 'audit':
        return <AuditTrailView />;
      default:
        return <DashboardAnalytics setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <ErpMainContent />
    </ErpProvider>
  );
}
