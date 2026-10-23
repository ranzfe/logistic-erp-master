import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';
import { UserCheck, RotateCcw, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, resetAllData, isSimulatingTelemetry, setIsSimulatingTelemetry } = useErp();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-8 sticky top-0 z-30">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white text-base tracking-wider shadow-xs">
            LX
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            LogistiX ERP
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400 border-l border-slate-200 pl-3">
            v3.4 Enterprise
          </span>
        </div>

        {/* Zone 2: Contextual Operational Status (Quiet unboxed text) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap shrink-0">
          <span className="font-medium text-slate-700">Hub Marunda &amp; Koridor Trans-Jawa</span>
          <span aria-hidden="true">·</span>
          <button 
            onClick={() => setIsSimulatingTelemetry(!isSimulatingTelemetry)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
            title="Klik untuk pause/resume simulasi telemetri GPS armada"
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulatingTelemetry ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span>GPS Tracker {isSimulatingTelemetry ? 'Live Stream (Aktif)' : 'Paused'}</span>
          </button>
          <span aria-hidden="true">·</span>
          <span>WIB (UTC+7)</span>
        </div>

        {/* Zone 3: Primary Actions - RBAC Switcher & Demo Control */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={resetAllData}
            title="Reset data ke kondisi awal"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Reset Data</span>
          </button>

          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold leading-tight whitespace-nowrap">{currentUser.name}</div>
              <div className="text-[10px] text-slate-300 leading-tight whitespace-nowrap">{currentUser.roleTitle}</div>
            </div>
            <span className="text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700 whitespace-nowrap ml-1">
              Ganti Role
            </span>
          </button>
        </div>
      </header>

      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
};
