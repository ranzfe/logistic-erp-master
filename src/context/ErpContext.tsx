import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  UserProfile, 
  UserRole, 
  Armada, 
  Quotation, 
  DeliveryOrder, 
  Invoice, 
  VendorPayment, 
  PettyCashTransaction, 
  ProfitLossSummary, 
  AuditLog,
  DeliveryStatus,
  QuotationStatus,
  ArmadaStatus
} from '../types/erp';
import { 
  INITIAL_USERS, 
  INITIAL_ARMADA, 
  INITIAL_QUOTATIONS, 
  INITIAL_DELIVERIES, 
  INITIAL_INVOICES, 
  INITIAL_VENDOR_PAYMENTS, 
  INITIAL_PETTY_CASH, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ErpContextType {
  // Auth & Roles
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  hasPermission: (moduleKey: string) => boolean;

  // Armada (Fleet)
  armadaList: Armada[];
  addArmada: (data: Omit<Armada, 'id'>) => void;
  updateArmada: (id: string, updates: Partial<Armada>) => void;
  deleteArmada: (id: string) => void;

  // Quotation
  quotations: Quotation[];
  addQuotation: (data: Omit<Quotation, 'id' | 'quotationNumber' | 'subtotal' | 'ppnAmount' | 'totalAmount' | 'estimatedMarginPercent' | 'status'>) => void;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
  convertQuotationToDelivery: (quotationId: string, armadaId: string, driverName: string, driverPhone: string, departureDate: string) => void;

  // Delivery
  deliveries: DeliveryOrder[];
  addDelivery: (data: Omit<DeliveryOrder, 'id' | 'doNumber' | 'progressPercent' | 'milestones'>) => void;
  updateDelivery: (id: string, updates: Partial<DeliveryOrder>) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus, locationName?: string, notes?: string) => void;
  completeDeliveryPOD: (id: string, recipientName: string, recipientPhone: string, notes: string) => void;
  reportDeliveryDelay: (id: string, delayReason: string, delayHours: number) => void;

  // Invoices (AR)
  invoices: Invoice[];
  addInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'balanceDue' | 'status' | 'payments'>) => void;
  recordInvoicePayment: (invoiceId: string, amount: number, method: Invoice['payments'][0]['method'], referenceNumber: string, notes?: string) => void;

  // Vendor Payments (AP)
  vendorPayments: VendorPayment[];
  addVendorPayment: (data: Omit<VendorPayment, 'id' | 'billNumber' | 'paidAmount' | 'status'>) => void;
  approveVendorPayment: (id: string) => void;
  recordVendorPayment: (id: string, amount: number, method: string, transferProofRef: string) => void;

  // Petty Cash
  pettyCashTransactions: PettyCashTransaction[];
  pettyCashBalance: number;
  addPettyCashTransaction: (data: Omit<PettyCashTransaction, 'id' | 'voucherNumber' | 'status' | 'approvedBy'>) => void;
  approvePettyCash: (id: string) => void;
  reconcilePettyCash: (id: string) => void;

  // Profit and Loss
  profitLossSummary: ProfitLossSummary;
  getDeliveryProfitBreakdown: () => Array<{
    doId: string;
    doNumber: string;
    customerName: string;
    route: string;
    armadaPlate: string;
    revenue: number;
    vendorCost: number;
    pettyCost: number;
    totalCost: number;
    grossProfit: number;
    marginPercent: number;
    status: DeliveryStatus;
  }>;

  // Audit Logs & Notifications
  auditLogs: AuditLog[];
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  resetAllData: () => void;
  isSimulatingTelemetry: boolean;
  setIsSimulatingTelemetry: (val: boolean) => void;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'logistix_current_user_id',
  ARMADA: 'logistix_armada_v1',
  QUOTATIONS: 'logistix_quotations_v1',
  DELIVERIES: 'logistix_deliveries_v1',
  INVOICES: 'logistix_invoices_v1',
  VENDOR_PAYMENTS: 'logistix_vendor_payments_v1',
  PETTY_CASH: 'logistix_petty_cash_v1',
  AUDIT_LOGS: 'logistix_audit_logs_v1',
};

export const ErpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Current User
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || INITIAL_USERS[0].id;
  });

  const currentUser = useMemo(() => {
    return INITIAL_USERS.find(u => u.id === currentUserId) || INITIAL_USERS[0];
  }, [currentUserId]);

  const switchUser = (userId: string) => {
    const target = INITIAL_USERS.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, target.id);
      showToast('info', 'Sesi Berpindah', `Login sebagai ${target.name} (${target.roleTitle})`);
      logAction('Auth', target.id, 'LOGIN_SWITCH', `Beralih sesi login ke akun ${target.name} (${target.role})`);
    }
  };

  // RBAC Permission Checker
  const hasPermission = (moduleKey: string): boolean => {
    const role = currentUser.role;
    if (role === 'super_admin') return true;

    switch (moduleKey) {
      case 'dashboard':
        return true;
      case 'delivery':
        return ['super_admin', 'ops_manager', 'sales_executive', 'fleet_supervisor'].includes(role);
      case 'monitoring':
        return ['super_admin', 'ops_manager', 'fleet_supervisor', 'sales_executive'].includes(role);
      case 'quotation':
        return ['super_admin', 'sales_executive'].includes(role);
      case 'invoice':
        return ['super_admin', 'finance_officer', 'sales_executive'].includes(role);
      case 'vendor':
        return ['super_admin', 'finance_officer', 'ops_manager'].includes(role);
      case 'profitloss':
        return ['super_admin', 'finance_officer'].includes(role);
      case 'pettycash':
        return ['super_admin', 'finance_officer', 'fleet_supervisor', 'ops_manager'].includes(role);
      case 'armada':
        return ['super_admin', 'ops_manager', 'fleet_supervisor'].includes(role);
      case 'audit':
        return ['super_admin', 'ops_manager', 'finance_officer'].includes(role);
      default:
        return false;
    }
  };

  // 2. Data Stores with local storage sync
  const [armadaList, setArmadaList] = useState<Armada[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARMADA);
    return saved ? JSON.parse(saved) : INITIAL_ARMADA;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDOR_PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_VENDOR_PAYMENTS;
  });

  const [pettyCashTransactions, setPettyCashTransactions] = useState<PettyCashTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PETTY_CASH);
    return saved ? JSON.parse(saved) : INITIAL_PETTY_CASH;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ARMADA, JSON.stringify(armadaList)); }, [armadaList]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries)); }, [deliveries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VENDOR_PAYMENTS, JSON.stringify(vendorPayments)); }, [vendorPayments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PETTY_CASH, JSON.stringify(pettyCashTransactions)); }, [pettyCashTransactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs)); }, [auditLogs]);

  // Notifications
  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logAction = (module: AuditLog['module'], targetId: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) + ' WIB',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      targetId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // 3. Armada Methods
  const addArmada = (data: Omit<Armada, 'id'>) => {
    const id = `arm-${Date.now()}`;
    const newArmada: Armada = { ...data, id };
    setArmadaList(prev => [newArmada, ...prev]);
    showToast('success', 'Armada Ditambahkan', `Unit ${data.plateNumber} (${data.truckType}) berhasil didaftarkan`);
    logAction('Armada', id, 'ADD_ARMADA', `Mendaftarkan armada baru ${data.plateNumber}`);
  };

  const updateArmada = (id: string, updates: Partial<Armada>) => {
    setArmadaList(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    showToast('info', 'Armada Diperbarui', `Informasi unit telah tersimpan`);
    logAction('Armada', id, 'UPDATE_ARMADA', `Memperbarui data armada ${id}`);
  };

  const deleteArmada = (id: string) => {
    const target = armadaList.find(a => a.id === id);
    setArmadaList(prev => prev.filter(a => a.id !== id));
    showToast('warning', 'Armada Dihapus', `Unit ${target?.plateNumber || id} dihapus dari master`);
    logAction('Armada', id, 'DELETE_ARMADA', `Menghapus unit ${target?.plateNumber}`);
  };

  // 4. Quotation Methods
  const addQuotation = (data: Omit<Quotation, 'id' | 'quotationNumber' | 'subtotal' | 'ppnAmount' | 'totalAmount' | 'estimatedMarginPercent' | 'status'>) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const ppnAmount = Math.round((subtotal * data.ppnPercent) / 100);
    const totalAmount = subtotal + ppnAmount;
    const totalEstimatedCost = data.estimatedVendorCost + data.estimatedPettyCost;
    const estimatedMarginPercent = subtotal > 0 ? Number((((subtotal - totalEstimatedCost) / subtotal) * 100).toFixed(1)) : 0;

    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(quotations.length + 1).padStart(4, '0');
    const quotationNumber = `QT/${currentYear}/${currentMonth}/${seq}`;
    const id = `quot-${Date.now()}`;

    const newQuotation: Quotation = {
      ...data,
      id,
      quotationNumber,
      subtotal,
      ppnAmount,
      totalAmount,
      estimatedMarginPercent,
      status: 'Sent'
    };

    setQuotations(prev => [newQuotation, ...prev]);
    showToast('success', 'Quotation Dibuat', `Penawaran ${quotationNumber} untuk ${data.customerName} berhasil diterbitkan`);
    logAction('Quotation', id, 'CREATE_QUOTATION', `Menerbitkan penawaran harga ${quotationNumber} senilai Rp ${totalAmount.toLocaleString('id-ID')}`);
  };

  const updateQuotationStatus = (id: string, status: QuotationStatus) => {
    setQuotations(prev => prev.map(q => q.id === id ? { 
      ...q, 
      status, 
      approvedBy: status === 'Approved' ? currentUser.name : q.approvedBy 
    } : q));
    showToast('info', 'Status Quotation Diubah', `Status diubah menjadi: ${status}`);
    logAction('Quotation', id, 'STATUS_CHANGE', `Mengubah status quotation ${id} menjadi ${status}`);
  };

  // 5. Integrated Convert Quotation to Delivery & Invoice
  const convertQuotationToDelivery = (
    quotationId: string, 
    armadaId: string, 
    driverName: string, 
    driverPhone: string, 
    departureDate: string
  ) => {
    const quotation = quotations.find(q => q.id === quotationId);
    const armada = armadaList.find(a => a.id === armadaId);

    if (!quotation || !armada) {
      showToast('error', 'Gagal Konversi', 'Quotation atau Armada tidak ditemukan');
      return;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seqDo = String(deliveries.length + 1).padStart(4, '0');
    const doNumber = `SJ/${currentYear}/${currentMonth}/${seqDo}`;
    const doId = `do-${Date.now()}`;

    // Create Delivery Order
    const newDelivery: DeliveryOrder = {
      id: doId,
      doNumber,
      quotationId: quotation.id,
      customerName: quotation.customerName,
      origin: quotation.originCity,
      originAddress: `${quotation.originCity} Hub / Factory`,
      destination: quotation.destinationCity,
      destinationAddress: `${quotation.destinationCity} Gudang / Distribution Center`,
      cargoDescription: quotation.cargoDescription,
      weightTon: quotation.weightTon,
      volumeCbm: quotation.volumeCbm,
      armadaId: armada.id,
      plateNumber: armada.plateNumber,
      truckType: armada.truckType,
      driverId: armada.currentDriverId || `drv-${Date.now()}`,
      driverName,
      driverPhone,
      status: 'Scheduled',
      departureDate,
      departureTime: '08:00 WIB',
      estimatedArrival: `${departureDate} 20:00 WIB`,
      currentLocationName: `${quotation.originCity} (Pool/Loading Dock)`,
      progressPercent: 5,
      liveSpeedKmh: 0,
      cargoTemperatureC: 25,
      milestones: [
        { id: `m-${Date.now()}-1`, name: `Pemuatan & Verifikasi Segel`, location: quotation.originCity, status: 'Current' },
        { id: `m-${Date.now()}-2`, name: `Perjalanan Transit Koridor Antar Kota`, location: 'Jalur Tol Utama', status: 'Pending' },
        { id: `m-${Date.now()}-3`, name: `Bongkar & Serah Terima POD`, location: quotation.destinationCity, status: 'Pending' }
      ],
      revenueAmount: quotation.totalAmount,
      notes: `Diterbitkan otomatis dari Quotation ${quotation.quotationNumber}. Syarat: ${quotation.terms}`
    };

    // Update Quotation to Converted
    setQuotations(prev => prev.map(q => q.id === quotationId ? { 
      ...q, 
      status: 'Converted', 
      convertedDoId: doId 
    } : q));

    // Update Armada Status to Scheduled or In Transit
    setArmadaList(prev => prev.map(a => a.id === armadaId ? { 
      ...a, 
      status: 'Scheduled', 
      currentDriverName: driverName, 
      currentDriverPhone: driverPhone 
    } : a));

    // Add Delivery
    setDeliveries(prev => [newDelivery, ...prev]);

    // Automatically create linked Invoice (AR)
    const seqInv = String(invoices.length + 1).padStart(4, '0');
    const invoiceNumber = `INV/${currentYear}/${currentMonth}/${seqInv}`;
    const invId = `inv-${Date.now()}`;

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      doId,
      doNumber,
      quotationId: quotation.id,
      customerName: quotation.customerName,
      customerAddress: `${quotation.destinationCity}, Indonesia`,
      customerTaxId: '01.999.888.7-011.000',
      issueDate: departureDate,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: quotation.subtotal,
      ppnAmount: quotation.ppnAmount,
      totalAmount: quotation.totalAmount,
      paidAmount: 0,
      balanceDue: quotation.totalAmount,
      status: 'Sent',
      paymentTerms: 'TOP 30 Hari',
      payments: [],
      notes: `Faktur tagihan otomatis untuk Surat Jalan ${doNumber}`
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Automatically create estimated Vendor Bill (AP) if vendor cost exists
    if (quotation.estimatedVendorCost > 0) {
      const seqVp = String(vendorPayments.length + 1).padStart(3, '0');
      const billNumber = `BILL/VEND/${currentYear}/${currentMonth}/${seqVp}`;
      const newVp: VendorPayment = {
        id: `vp-${Date.now()}`,
        billNumber,
        vendorName: 'Mitra Transport & Penyeberangan Ferry Terpadu',
        vendorCategory: 'Pelayaran & Kapal Ro-Ro',
        linkedDoId: doId,
        linkedDoNumber: doNumber,
        linkedArmadaId: armada.id,
        plateNumber: armada.plateNumber,
        billDate: departureDate,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: quotation.estimatedVendorCost,
        paidAmount: 0,
        status: 'Pending_Approval',
        notes: `Estimasi biaya pihak ketiga penyeberangan / kargo trip ${doNumber}`
      };
      setVendorPayments(prev => [newVp, ...prev]);
    }

    showToast('success', 'Konversi Berhasil Terintegrasi', `Diterbitkan Surat Jalan ${doNumber} & Faktur ${invoiceNumber}`);
    logAction('Delivery', doId, 'CONVERT_QUOTATION_TO_DELIVERY', `Mengonversi penawaran ${quotation.quotationNumber} menjadi Delivery ${doNumber} dan Faktur ${invoiceNumber}`);
  };

  // 6. Delivery Operations
  const addDelivery = (data: Omit<DeliveryOrder, 'id' | 'doNumber' | 'progressPercent' | 'milestones'>) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(deliveries.length + 1).padStart(4, '0');
    const doNumber = `SJ/${currentYear}/${currentMonth}/${seq}`;
    const id = `do-${Date.now()}`;

    const newDelivery: DeliveryOrder = {
      ...data,
      id,
      doNumber,
      progressPercent: data.status === 'Delivered' ? 100 : (data.status === 'In Transit' ? 40 : 10),
      milestones: [
        { id: `m-${Date.now()}-1`, name: `Pemuatan Kargo`, location: data.origin, status: 'Passed', passedAt: `${data.departureDate} ${data.departureTime}` },
        { id: `m-${Date.now()}-2`, name: `Pemberangkatan Menuju Tujuan`, location: 'Lintas Wilayah', status: 'Current' },
        { id: `m-${Date.now()}-3`, name: `Bongkar Kargo & Penandatanganan Surat Jalan`, location: data.destination, status: 'Pending' }
      ]
    };

    setDeliveries(prev => [newDelivery, ...prev]);

    // Update fleet status
    if (data.armadaId) {
      setArmadaList(prev => prev.map(a => a.id === data.armadaId ? { 
        ...a, 
        status: data.status === 'Delivered' ? 'Available' : 'In Transit',
        currentDriverName: data.driverName,
        currentDriverPhone: data.driverPhone
      } : a));
    }

    showToast('success', 'Surat Jalan Dibuat', `Surat Jalan ${doNumber} siap diberangkatkan`);
    logAction('Delivery', id, 'CREATE_DELIVERY', `Menerbitkan Surat Jalan pengiriman ${doNumber} armada ${data.plateNumber}`);
  };

  const updateDelivery = (id: string, updates: Partial<DeliveryOrder>) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    showToast('info', 'Delivery Diperbarui', `Informasi pengiriman disimpan`);
    logAction('Delivery', id, 'UPDATE_DELIVERY', `Memperbarui rincian pengiriman ${id}`);
  };

  const updateDeliveryStatus = (id: string, status: DeliveryStatus, locationName?: string, notes?: string) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id !== id) return d;
      let newProgress = d.progressPercent;
      let liveSpeed = d.liveSpeedKmh;

      if (status === 'Scheduled') newProgress = 5;
      else if (status === 'Loading') newProgress = 15;
      else if (status === 'In Transit') {
        newProgress = Math.max(d.progressPercent, 50);
        liveSpeed = 68;
      } else if (status === 'Checkpoint') {
        newProgress = Math.max(d.progressPercent, 75);
        liveSpeed = 0;
      } else if (status === 'Arrived') {
        newProgress = 95;
        liveSpeed = 0;
      } else if (status === 'Delivered') {
        newProgress = 100;
        liveSpeed = 0;
      }

      return {
        ...d,
        status,
        currentLocationName: locationName || d.currentLocationName,
        progressPercent: newProgress,
        liveSpeedKmh: liveSpeed,
        notes: notes ? `${d.notes || ''} [Update: ${notes}]` : d.notes
      };
    }));

    showToast('info', 'Status Delivery Berubah', `Status kini: ${status} (${locationName || 'Lokasi terupdate'})`);
    logAction('Monitoring', id, 'UPDATE_STATUS', `Status pengiriman ${id} diubah ke ${status} di ${locationName || 'rute'}`);
  };

  const completeDeliveryPOD = (id: string, recipientName: string, recipientPhone: string, notes: string) => {
    const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) + ' WIB';
    const delivery = deliveries.find(d => d.id === id);

    setDeliveries(prev => prev.map(d => {
      if (d.id !== id) return d;
      return {
        ...d,
        status: 'Delivered',
        progressPercent: 100,
        liveSpeedKmh: 0,
        actualArrival: timestamp,
        currentLocationName: `Selesai Diterima di ${d.destination}`,
        recipientName,
        recipientPhone,
        podSignedAt: timestamp,
        podSignerName: recipientName,
        podNotes: notes
      };
    }));

    // Free up armada
    if (delivery?.armadaId) {
      setArmadaList(prev => prev.map(a => a.id === delivery.armadaId ? { ...a, status: 'Available' } : a));
    }

    showToast('success', 'POD Berhasil Dikonfirmasi', `Pengiriman ${delivery?.doNumber} dinyatakan selesai & armada kembali standby`);
    logAction('Delivery', id, 'SUBMIT_POD', `Penerimaan POD resmi oleh ${recipientName} untuk ${delivery?.doNumber}`);
  };

  const reportDeliveryDelay = (id: string, delayReason: string, delayHours: number) => {
    setDeliveries(prev => prev.map(d => d.id === id ? {
      ...d,
      status: 'Delayed',
      delayReason,
      delayHours
    } : d));
    showToast('warning', 'Peringatan Keterlambatan', `Keterlambatan tercatat: ${delayReason} (+${delayHours} jam)`);
    logAction('Monitoring', id, 'REPORT_DELAY', `Melaporkan kendala delivery ${id}: ${delayReason} estimasi +${delayHours} jam`);
  };

  // 7. Invoice Methods
  const addInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'balanceDue' | 'status' | 'payments'>) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(invoices.length + 1).padStart(4, '0');
    const invoiceNumber = `INV/${currentYear}/${currentMonth}/${seq}`;
    const id = `inv-${Date.now()}`;

    const newInvoice: Invoice = {
      ...data,
      id,
      invoiceNumber,
      paidAmount: 0,
      balanceDue: data.totalAmount,
      status: 'Sent',
      payments: []
    };

    setInvoices(prev => [newInvoice, ...prev]);
    showToast('success', 'Invoice Diterbitkan', `Faktur ${invoiceNumber} senilai Rp ${data.totalAmount.toLocaleString('id-ID')} dibuat`);
    logAction('Invoice', id, 'ISSUE_INVOICE', `Menerbitkan faktur tagihan ${invoiceNumber} ke ${data.customerName}`);
  };

  const recordInvoicePayment = (
    invoiceId: string, 
    amount: number, 
    method: Invoice['payments'][0]['method'], 
    referenceNumber: string, 
    notes?: string
  ) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaidAmount = inv.paidAmount + amount;
      const newBalanceDue = Math.max(0, inv.totalAmount - newPaidAmount);
      const newStatus = newBalanceDue === 0 ? 'Paid' : 'Partially_Paid';

      const paymentRecord = {
        id: `pay-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount,
        method,
        referenceNumber,
        notes
      };

      return {
        ...inv,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
        payments: [...inv.payments, paymentRecord]
      };
    }));

    showToast('success', 'Pembayaran Piutang Dicatat', `Penerimaan dana sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dibukukan`);
    logAction('Invoice', invoiceId, 'RECORD_PAYMENT', `Menerima pelunasan faktur ${invoiceId} senilai Rp ${amount.toLocaleString('id-ID')} via ${method}`);
  };

  // 8. Vendor Payment Methods
  const addVendorPayment = (data: Omit<VendorPayment, 'id' | 'billNumber' | 'paidAmount' | 'status'>) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(vendorPayments.length + 1).padStart(3, '0');
    const billNumber = `BILL/VEND/${currentYear}/${currentMonth}/${seq}`;
    const id = `vp-${Date.now()}`;

    const newVp: VendorPayment = {
      ...data,
      id,
      billNumber,
      paidAmount: 0,
      status: 'Pending_Approval'
    };

    setVendorPayments(prev => [newVp, ...prev]);
    showToast('success', 'Tagihan Vendor Didaftarkan', `Tagihan ${billNumber} dari ${data.vendorName} menunggu persetujuan`);
    logAction('Vendor', id, 'CREATE_VENDOR_BILL', `Mendaftarkan tagihan vendor ${billNumber} Rp ${data.amount.toLocaleString('id-ID')}`);
  };

  const approveVendorPayment = (id: string) => {
    setVendorPayments(prev => prev.map(vp => vp.id === id ? { 
      ...vp, 
      status: 'Approved', 
      approvedBy: currentUser.name 
    } : vp));
    showToast('success', 'Tagihan Disetujui', `Tagihan vendor telah disetujui untuk proses pembayaran`);
    logAction('Vendor', id, 'APPROVE_VENDOR_BILL', `Menyetujui tagihan vendor ${id}`);
  };

  const recordVendorPayment = (id: string, amount: number, method: string, transferProofRef: string) => {
    const today = new Date().toISOString().split('T')[0];
    setVendorPayments(prev => prev.map(vp => {
      if (vp.id !== id) return vp;
      const newPaid = vp.paidAmount + amount;
      const isFull = newPaid >= vp.amount;

      return {
        ...vp,
        paidAmount: newPaid,
        status: isFull ? 'Paid' : 'Partially_Paid',
        paidDate: today,
        paymentMethod: method,
        transferProofRef
      };
    }));

    showToast('success', 'Pembayaran Vendor Selesai', `Pembayaran Rp ${amount.toLocaleString('id-ID')} ke vendor telah tercatat`);
    logAction('Vendor', id, 'PAY_VENDOR_BILL', `Melunasi tagihan vendor ${id} sebesar Rp ${amount.toLocaleString('id-ID')} Ref: ${transferProofRef}`);
  };

  // 9. Petty Cash Methods
  const addPettyCashTransaction = (data: Omit<PettyCashTransaction, 'id' | 'voucherNumber' | 'status' | 'approvedBy'>) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(pettyCashTransactions.length + 1).padStart(3, '0');
    const voucherNumber = `PC/${currentYear}/${currentMonth}/${seq}`;
    const id = `pc-${Date.now()}`;

    const newTx: PettyCashTransaction = {
      ...data,
      id,
      voucherNumber,
      status: currentUser.role === 'super_admin' || currentUser.role === 'finance_officer' ? 'Approved' : 'Submitted',
      approvedBy: currentUser.role === 'super_admin' ? currentUser.name : undefined
    };

    setPettyCashTransactions(prev => [newTx, ...prev]);
    showToast('success', 'Voucher Kas Kecil Dibuat', `Voucher ${voucherNumber} senilai Rp ${data.amount.toLocaleString('id-ID')} diajukan`);
    logAction('PettyCash', id, 'SUBMIT_PETTY_CASH', `Mengajukan pengeluaran kas kecil ${voucherNumber} (${data.category})`);
  };

  const approvePettyCash = (id: string) => {
    setPettyCashTransactions(prev => prev.map(tx => tx.id === id ? { 
      ...tx, 
      status: 'Approved', 
      approvedBy: currentUser.name 
    } : tx));
    showToast('success', 'Kas Kecil Disetujui', `Pengeluaran kas kecil disetujui`);
    logAction('PettyCash', id, 'APPROVE_PETTY_CASH', `Menyetujui voucher kas kecil ${id}`);
  };

  const reconcilePettyCash = (id: string) => {
    setPettyCashTransactions(prev => prev.map(tx => tx.id === id ? { 
      ...tx, 
      status: 'Reconciled' 
    } : tx));
    showToast('info', 'Kas Direkonsiliasi', `Nota dan fisik kas telah diverifikasi akuntan`);
    logAction('PettyCash', id, 'RECONCILE_PETTY_CASH', `Rekonsiliasi transaksi kas kecil ${id}`);
  };

  const pettyCashBalance = useMemo(() => {
    return pettyCashTransactions.reduce((acc, tx) => {
      if (tx.status === 'Rejected') return acc;
      if (tx.type === 'Cash_In') {
        return acc + tx.amount;
      } else {
        // Only deduct approved or reconciled cash out
        if (tx.status === 'Approved' || tx.status === 'Reconciled') {
          return acc - tx.amount;
        }
        return acc;
      }
    }, 0);
  }, [pettyCashTransactions]);

  // 10. Integrated Profit and Loss calculation
  const profitLossSummary = useMemo<ProfitLossSummary>(() => {
    // Total Revenue from all Invoices or Deliveries
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Direct Cost: Vendor Bills
    const directCostVendor = vendorPayments.reduce((sum, vp) => {
      // Direct delivery costs: Ferry, BBM, Subcon, Asuransi
      if (vp.vendorCategory !== 'Bengkel & Karoseri') {
        return sum + vp.amount;
      }
      return sum;
    }, 0);

    // Fleet Maintenance from Vendor Bengkel
    const directCostFleetMaintenance = vendorPayments.reduce((sum, vp) => {
      if (vp.vendorCategory === 'Bengkel & Karoseri') {
        return sum + vp.amount;
      }
      return sum;
    }, 0);

    // Direct Cost: Petty Cash allocated to deliveries (BBM, Tol, Uang Saku, Retribusi, Ban)
    const directCostPettyCash = pettyCashTransactions.reduce((sum, tx) => {
      if (tx.type === 'Cash_Out' && (tx.status === 'Approved' || tx.status === 'Reconciled')) {
        if (['BBM & Solar', 'Tol & E-Toll', 'Uang Saku Supir', 'Parkir & Retribusi', 'Perbaikan Ringan / Tambal Ban'].includes(tx.category)) {
          return sum + tx.amount;
        }
      }
      return sum;
    }, 0);

    const totalCostOfSales = directCostVendor + directCostPettyCash + directCostFleetMaintenance;
    const grossProfit = totalRevenue - totalCostOfSales;
    const grossMarginPercent = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // Overhead / Operating Expenses (Kantor petty cash, dll)
    const operatingExpenses = pettyCashTransactions.reduce((sum, tx) => {
      if (tx.type === 'Cash_Out' && (tx.status === 'Approved' || tx.status === 'Reconciled')) {
        if (['Operasional Kantor', 'Konsumsi & Lembur Lapangan'].includes(tx.category)) {
          return sum + tx.amount;
        }
      }
      return sum;
    }, 0) + 4500000; // Depresiasi & Gaji administrasi standar bulanan

    const netProfit = grossProfit - operatingExpenses;
    const netMarginPercent = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

    const completedDeliveriesCount = deliveries.filter(d => d.status === 'Delivered').length;
    const activeDeliveriesCount = deliveries.filter(d => ['In Transit', 'Checkpoint', 'Loading', 'Scheduled'].includes(d.status)).length;

    return {
      period: 'Bulan Berjalan (Oktober 2026)',
      totalRevenue,
      directCostVendor,
      directCostPettyCash,
      directCostFleetMaintenance,
      totalCostOfSales,
      grossProfit,
      grossMarginPercent,
      operatingExpenses,
      netProfit,
      netMarginPercent,
      completedDeliveriesCount,
      activeDeliveriesCount
    };
  }, [invoices, vendorPayments, pettyCashTransactions, deliveries]);

  // Delivery-by-delivery Profitability Table
  const getDeliveryProfitBreakdown = () => {
    return deliveries.map(d => {
      const revenue = d.revenueAmount || 0;
      
      // Find linked vendor costs
      const vendorCost = vendorPayments
        .filter(vp => vp.linkedDoId === d.id)
        .reduce((sum, vp) => sum + vp.amount, 0);

      // Find linked petty cash
      const pettyCost = pettyCashTransactions
        .filter(tx => tx.linkedDoId === d.id && tx.type === 'Cash_Out')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalCost = vendorCost + pettyCost;
      const grossProfit = revenue - totalCost;
      const marginPercent = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(1)) : 0;

      return {
        doId: d.id,
        doNumber: d.doNumber,
        customerName: d.customerName,
        route: `${d.origin} → ${d.destination}`,
        armadaPlate: d.plateNumber,
        revenue,
        vendorCost,
        pettyCost,
        totalCost,
        grossProfit,
        marginPercent,
        status: d.status
      };
    });
  };

  // 11. Real-time Telemetry Simulator
  useEffect(() => {
    if (!isSimulatingTelemetry) return;

    const interval = setInterval(() => {
      setDeliveries(prevDeliveries => {
        return prevDeliveries.map(d => {
          if (d.status === 'In Transit') {
            const nextProgress = Math.min(94, d.progressPercent + 1);
            // Slight variation in speed between 60 - 82 km/h
            const speedJitter = Math.floor(65 + Math.random() * 15);
            return {
              ...d,
              progressPercent: nextProgress,
              liveSpeedKmh: speedJitter
            };
          }
          return d;
        });
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [isSimulatingTelemetry]);

  // Reset to initial demo data
  const resetAllData = () => {
    localStorage.clear();
    setArmadaList(INITIAL_ARMADA);
    setQuotations(INITIAL_QUOTATIONS);
    setDeliveries(INITIAL_DELIVERIES);
    setInvoices(INITIAL_INVOICES);
    setVendorPayments(INITIAL_VENDOR_PAYMENTS);
    setPettyCashTransactions(INITIAL_PETTY_CASH);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId(INITIAL_USERS[0].id);
    showToast('info', 'Data Direset', 'Seluruh basis data ERP dikembalikan ke konfigurasi demo awal.');
  };

  return (
    <ErpContext.Provider value={{
      currentUser,
      allUsers: INITIAL_USERS,
      switchUser,
      hasPermission,

      armadaList,
      addArmada,
      updateArmada,
      deleteArmada,

      quotations,
      addQuotation,
      updateQuotationStatus,
      convertQuotationToDelivery,

      deliveries,
      addDelivery,
      updateDelivery,
      updateDeliveryStatus,
      completeDeliveryPOD,
      reportDeliveryDelay,

      invoices,
      addInvoice,
      recordInvoicePayment,

      vendorPayments,
      addVendorPayment,
      approveVendorPayment,
      recordVendorPayment,

      pettyCashTransactions,
      pettyCashBalance,
      addPettyCashTransaction,
      approvePettyCash,
      reconcilePettyCash,

      profitLossSummary,
      getDeliveryProfitBreakdown,

      auditLogs,
      toasts,
      removeToast,
      showToast,
      resetAllData,
      isSimulatingTelemetry,
      setIsSimulatingTelemetry
    }}>
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
