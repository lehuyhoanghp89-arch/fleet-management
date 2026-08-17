export interface ServiceItem {
  name: string;
  category: 'engine' | 'transmission' | 'brake' | 'chassis' | 'filter' | 'fluid' | 'electrical' | 'general';
  action: 'replace' | 'inspect' | 'clean' | 'topup';
  unitPrice: number; // VNĐ
  laborPrice: number; // VNĐ
  notes?: string;
}

export interface ServiceTier {
  tierCode: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | 'TIER_5_SPECIAL';
  name: string; // e.g. "Cấp 1 (Bảo dưỡng nhỏ / Service A)", "Cấp 2 (Bảo dưỡng trung bình)", "Cấp 3 (Bảo dưỡng trung bình lớn / Service B)", "Cấp 4 (Bảo dưỡng lớn / Major)"
  shortName: string; // "Cấp 1", "Cấp 2", "Cấp 3", "Cấp 4"
  description: string;
  intervalKm: number; // interval cycle, e.g. 5000, 10000, 20000, 40000, 80000
  applicableKmMod: number; // e.g. every 10000km, or every 40000km
  estimatedCostMin: number;
  estimatedCostMax: number;
  items: ServiceItem[];
  brandManualRef: string;
}

export interface Vehicle {
  id: string;
  code: string; // e.g. "CAR01"
  name: string; // e.g. "Mercedes-Benz V250"
  brand: 'Mercedes-Benz' | 'Ford' | 'Kia' | 'Hyundai' | 'Khác';
  model: string;
  year: number;
  licensePlate: string; // Biển số
  engine: string; // e.g. "2.0L Turbo Xăng (M274)", "3.0L Turbo Mild-Hybrid EQ Boost (M256)", "2.0L Bi-Turbo Diesel", "2.2L Smartstream CRDi"
  transmission: string; // e.g. "9G-TRONIC", "10R80 10-AT", "8-AT", "6-MT"
  fuelType: 'Xăng' | 'Dầu Diesel' | 'Hybrid';
  currentOdo: number; // Current km
  initialOdo: number; // Starting reference km
  averageKmPerDay: number; // Calculated daily average km from logs
  lastServiceOdo: number;
  lastServiceDate: string; // YYYY-MM-DD
  lastServiceTier?: string;
  baseCycleKm: number; // 5000 or 8000 or 10000
  imageKey?: string;
  status: 'active' | 'in_service' | 'maintenance_due' | 'overdue';
  driverName?: string;
  driverPhone?: string;
  notes?: string;

  // Specs & Identification
  vinNumber?: string; // Số khung VIN
  engineNumber?: string; // Số máy
  seatCount?: number; // Số chỗ ngồi (e.g. 7, 16)
  oilCapacityLiters?: string; // Dung tích nhớt máy e.g. "6.5 Lít"
  registrationDate?: string; // Ngày đăng ký lần đầu YYYY-MM-DD

  // Đăng kiểm (Vehicle Inspection)
  inspectionExpiryDate?: string; // Hạn đăng kiểm YYYY-MM-DD
  inspectionStation?: string; // Trạm đăng kiểm
  inspectionCost?: number; // Phí kiểm định + phí đường bộ dự kiến

  // Bảo hiểm bắt buộc TNDS
  tndsInsuranceExpiryDate?: string; // Hạn bảo hiểm TNDS YYYY-MM-DD
  tndsInsuranceProvider?: string; // e.g. Bảo Việt, PVI, PJICO, PTI, BIC
  tndsInsuranceCost?: number; // Phí bảo hiểm TNDS

  // Bảo hiểm tự nguyện Vật chất / Thân vỏ
  bodyInsuranceExpiryDate?: string; // Hạn bảo hiểm thân vỏ YYYY-MM-DD
  bodyInsuranceProvider?: string;
  bodyInsuranceCost?: number;
}

export interface OdoLog {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  odo: number;
  deltaKm: number; // km driven since previous log
  note?: string;
  recordedBy?: string;
  createdAt?: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  odo: number;
  tierCode: string;
  tierName: string;
  actualCost: number;
  garageName: string;
  invoiceNumber?: string;
  notes?: string;
  replacedItems: string[];
  isCompleted: boolean;
}

export interface MaintenanceMilestone {
  milestoneIndex: number;
  targetOdo: number;
  tierCode: string;
  tierName: string;
  shortTier: string;
  tierLevel: 1 | 2 | 3 | 4 | 5;
  colorClass: string;
  kmRemaining: number;
  daysRemaining: number;
  estimatedDate: string;
  estimatedCost: number;
  items: ServiceItem[];
  brandNotes: string;
  isCurrentNext: boolean;
  isOverdue: boolean;
  urgencyLevel: 'normal' | 'due_soon' | 'urgent' | 'overdue';
}

export interface BrandConfig {
  brand: string;
  displayName: string;
  standardIntervalKm: number;
  severeIntervalKm?: number;
  tiers: ServiceTier[];
  officialManualOverview: string;
  recommendedFluids: {
    engineOil: string;
    transmissionOil: string;
    brakeFluid: string;
    coolant: string;
  };
}

export interface AIAdviceMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export type UserRole = 'admin' | 'technician' | 'driver' | 'viewer';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  email: string;
  fullName: string;
  role: UserRole;
  roleTitle: string;
  avatar?: string;
  assignedVehicleId?: string;
  phoneNumber?: string;
}

export interface UserPermissions {
  canAddVehicle: boolean;
  canEditVehicle: boolean;
  canDeleteVehicle: boolean;
  canInputOdo: boolean;
  canCompleteService: boolean;
  canUpdateCompliance: boolean;
  canExportReports: boolean;
  canManageDatabase: boolean;
  canResetData: boolean;
  isReadOnly: boolean;
}
