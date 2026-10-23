export type UserRole = 
  | 'super_admin'       // Direktur Operasional / Super Admin: Akses Penuh ke seluruh modul & laporan P&L
  | 'ops_manager'       // Manajer Operasional & Dispatch: Kelola Delivery, Monitoring, Armada & Surat Jalan
  | 'sales_executive'   // Sales & Marketing: Kelola Quotation, Tarif, CRM Klien, Invoice (read-only)
  | 'finance_officer'   // Finance & Accounting: Kelola Invoice (AR), Vendor AP, Kas Kecil & Laporan P&L
  | 'fleet_supervisor'; // Supervisor Armada & Supir: Update status checkpoint, inspeksi armada & klaim kas kecil jalan

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatar: string;
  phone: string;
}

export type ArmadaStatus = 'Available' | 'In Transit' | 'Maintenance' | 'Scheduled';

export type TruckType = 
  | 'Tronton Wingbox' 
  | 'Fuso Heavy Cargo' 
  | 'CDD Box (Colt Diesel)' 
  | 'CDE Engkel Box' 
  | 'Trailer 40ft' 
  | 'Blind Van High Roof';

export interface Armada {
  id: string;
  plateNumber: string;
  truckType: TruckType;
  brandModel: string;
  year: number;
  capacityTon: number;
  capacityCbm: number;
  odometerKm: number;
  fuelEfficiencyKmL: number;
  stnkExpiry: string;
  kirExpiry: string;
  status: ArmadaStatus;
  currentDriverId?: string;
  currentDriverName?: string;
  currentDriverPhone?: string;
  lastServiceDate: string;
  nextServiceKm: number;
  notes?: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Converted';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  date: string;
  validUntil: string;
  originCity: string;
  destinationCity: string;
  cargoDescription: string;
  weightTon: number;
  volumeCbm: number;
  truckTypeRequired: TruckType;
  items: QuotationItem[];
  subtotal: number;
  ppnPercent: number;
  ppnAmount: number;
  totalAmount: number;
  estimatedVendorCost: number;
  estimatedPettyCost: number;
  estimatedMarginPercent: number;
  status: QuotationStatus;
  terms: string;
  approvedBy?: string;
  convertedDoId?: string;
}

export type DeliveryStatus = 
  | 'Scheduled' 
  | 'Loading' 
  | 'In Transit' 
  | 'Checkpoint' 
  | 'Arrived' 
  | 'Delivered' 
  | 'Delayed' 
  | 'Cancelled';

export interface RouteMilestone {
  id: string;
  name: string;
  location: string;
  status: 'Pending' | 'Passed' | 'Current';
  passedAt?: string;
  notes?: string;
}

export interface DeliveryOrder {
  id: string;
  doNumber: string;
  quotationId?: string;
  customerName: string;
  origin: string;
  originAddress: string;
  destination: string;
  destinationAddress: string;
  cargoDescription: string;
  weightTon: number;
  volumeCbm: number;
  armadaId: string;
  plateNumber: string;
  truckType: TruckType;
  driverId: string;
  driverName: string;
  driverPhone: string;
  status: DeliveryStatus;
  departureDate: string;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  currentLocationName: string;
  progressPercent: number;
  liveSpeedKmh: number;
  cargoTemperatureC?: number;
  milestones: RouteMilestone[];
  delayReason?: string;
  delayHours?: number;
  recipientName?: string;
  recipientPhone?: string;
  podSignedAt?: string;
  podSignerName?: string;
  podNotes?: string;
  revenueAmount: number;
  notes?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially_Paid' | 'Paid' | 'Overdue';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Bank Transfer BCA' | 'Bank Transfer Mandiri' | 'Bank Transfer BNI' | 'Giro / Cek';
  referenceNumber: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  doId?: string;
  doNumber?: string;
  quotationId?: string;
  customerName: string;
  customerAddress: string;
  customerTaxId: string; // NPWP
  issueDate: string;
  dueDate: string;
  subtotal: number;
  ppnAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentTerms: string;
  payments: PaymentRecord[];
  notes?: string;
}

export type VendorCategory = 
  | 'Pelayaran & Kapal Ro-Ro' 
  | 'Subkontraktor Armada' 
  | 'BBM & Bahan Bakar' 
  | 'Bengkel & Karoseri' 
  | 'Depo & Pergudangan'
  | 'Asuransi Kargo';

export type VendorPaymentStatus = 'Pending_Approval' | 'Approved' | 'Partially_Paid' | 'Paid' | 'Overdue';

export interface VendorPayment {
  id: string;
  billNumber: string;
  vendorName: string;
  vendorCategory: VendorCategory;
  linkedDoId?: string;
  linkedDoNumber?: string;
  linkedArmadaId?: string;
  plateNumber?: string;
  billDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: VendorPaymentStatus;
  paymentMethod?: string;
  paidDate?: string;
  transferProofRef?: string;
  approvedBy?: string;
  notes?: string;
}

export type PettyCashType = 'Cash_In' | 'Cash_Out';

export type PettyCashCategory = 
  | 'BBM & Solar' 
  | 'Tol & E-Toll' 
  | 'Uang Saku Supir' 
  | 'Parkir & Retribusi' 
  | 'Perbaikan Ringan / Tambal Ban' 
  | 'Konsumsi & Lembur Lapangan' 
  | 'Operasional Kantor' 
  | 'Top-up Saldo Kas';

export type PettyCashStatus = 'Submitted' | 'Approved' | 'Reconciled' | 'Rejected';

export interface PettyCashTransaction {
  id: string;
  voucherNumber: string;
  type: PettyCashType;
  category: PettyCashCategory;
  amount: number;
  date: string;
  linkedDoId?: string;
  linkedDoNumber?: string;
  linkedArmadaId?: string;
  plateNumber?: string;
  claimantName: string;
  claimantRole: string;
  approvedBy?: string;
  status: PettyCashStatus;
  description: string;
  receiptNumber?: string;
}

export interface ProfitLossSummary {
  period: string;
  totalRevenue: number;
  directCostVendor: number;
  directCostPettyCash: number;
  directCostFleetMaintenance: number;
  totalCostOfSales: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPercent: number;
  completedDeliveriesCount: number;
  activeDeliveriesCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: 'Delivery' | 'Monitoring' | 'Quotation' | 'Invoice' | 'Vendor' | 'PettyCash' | 'Armada' | 'Auth';
  targetId: string;
  details: string;
}
