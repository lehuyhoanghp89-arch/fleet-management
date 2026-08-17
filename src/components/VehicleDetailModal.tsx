import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Wrench, 
  History, 
  Sparkles, 
  FileCheck2, 
  Gauge, 
  Calendar, 
  Fuel, 
  ShieldCheck, 
  DollarSign,
  Edit3,
  Shield,
  FileText,
  User,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { Vehicle, MaintenanceMilestone, OdoLog, ServiceRecord } from '../types';
import { FutureMilestonesTable } from './FutureMilestonesTable';
import { ChecklistViewer } from './ChecklistViewer';
import { OdoHistoryTable } from './OdoHistoryTable';
import { ServiceHistoryTable } from './ServiceHistoryTable';
import { AiVehicleConsultant } from './AiVehicleConsultant';
import { formatVND } from '../utils/maintenanceEngine';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  milestones: MaintenanceMilestone[];
  logs: OdoLog[];
  serviceRecords: ServiceRecord[];
  initialTab?: string;
  onOpenOdoModal: (vehicle: Vehicle) => void;
  onDeleteLog?: (logId: string) => void;
  onOpenComplianceModal?: (vehicle: Vehicle) => void;
  onOpenEditVehicle?: (vehicle: Vehicle) => void;
  onOpenCompleteServiceModal: (vehicle: Vehicle, milestone?: MaintenanceMilestone) => void;
  onDeleteServiceRecord?: (recordId: string) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  milestones,
  logs,
  serviceRecords,
  initialTab = 'milestones',
  onOpenOdoModal,
  onDeleteLog,
  onOpenComplianceModal,
  onOpenEditVehicle,
  onOpenCompleteServiceModal,
  onDeleteServiceRecord
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen || !vehicle) return null;

  const nextMilestone = milestones[0];
  const vehicleServiceRecords = serviceRecords.filter(r => r.vehicleId === vehicle.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {vehicle.code}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {vehicle.name}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-bold border border-slate-700">
                  {vehicle.licensePlate}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-900/60 text-blue-300 border border-blue-700">
                  {vehicle.brand}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.model} ({vehicle.year}) • Động cơ: {vehicle.engine} • Hộp số: {vehicle.transmission}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenEditVehicle && (
              <button
                onClick={() => onOpenEditVehicle(vehicle)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Sửa thông tin</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 block text-[11px]">ODO Hiện Tại</span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
              {(vehicle.currentOdo || 0).toLocaleString('vi-VN')} km
            </div>
            <span className="text-[10px] text-slate-400">~{vehicle.averageKmPerDay || 45} km/ngày</span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 block text-[11px]">Bảo Dưỡng Gần Nhất</span>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5">
              {(vehicle.lastServiceOdo || 0).toLocaleString('vi-VN')} km
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {vehicle.lastServiceTier || 'Bảo dưỡng định kỳ'}
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 block text-[11px]">Đợt Tiếp Theo (Dự Kiến)</span>
            <div className="text-xs sm:text-sm font-bold text-blue-600 truncate mt-0.5">
              {nextMilestone ? `${nextMilestone.targetOdo.toLocaleString('vi-VN')} km` : 'Đang cập nhật'}
            </div>
            <span className="text-[10px] text-slate-500">
              {nextMilestone ? `~${new Date(nextMilestone.estimatedDate).toLocaleDateString('vi-VN')}` : ''}
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 block text-[11px]">Chu kỳ bảo dưỡng hãng</span>
            <div className="text-xs sm:text-sm font-bold text-purple-600 font-mono mt-0.5">
              {(vehicle.baseCycleKm || 10000).toLocaleString('vi-VN')} km / lần
            </div>
            <span className="text-[10px] text-slate-400">Chuẩn kỹ thuật</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'milestones'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Lộ Trình Cấp Tương Lai</span>
          </button>

          <button
            onClick={() => setActiveTab('service_history')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'service_history'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>Lịch Sử Đã Bảo Dưỡng ({vehicleServiceRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'compliance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Đăng Kiểm & Bảo Hiểm</span>
          </button>

          <button
            onClick={() => setActiveTab('checklists')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'checklists'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Hạng Mục Phụ Tùng Từng Cấp</span>
          </button>

          <button
            onClick={() => setActiveTab('odo_history')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'odo_history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gauge className="w-4 h-4 text-blue-500" />
            <span>Nhật Ký ODO ({logs.filter(l => l.vehicleId === vehicle.id).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_consult')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'ai_consult'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Cố Vấn Kỹ Thuật (AI)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'milestones' && (
            <FutureMilestonesTable
              vehicle={vehicle}
              milestones={milestones}
              onCompleteMilestone={(m) => onOpenCompleteServiceModal(vehicle, m)}
            />
          )}

          {activeTab === 'service_history' && (
            <ServiceHistoryTable
              vehicle={vehicle}
              serviceRecords={serviceRecords}
              onOpenCompleteModal={() => onOpenCompleteServiceModal(vehicle, nextMilestone)}
              onDeleteRecord={onDeleteServiceRecord}
            />
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">
                  Hồ Sơ Đăng Kiểm & Hợp Đồng Bảo Hiểm Xe
                </h4>
                {onOpenComplianceModal && (
                  <button
                    onClick={() => onOpenComplianceModal(vehicle)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                  >
                    Gia Hạn / Chỉnh Sửa
                  </button>
                )}
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1: Đăng kiểm */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-blue-600" />
                      Đăng Kiểm & Phí Đường Bộ
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {vehicle.inspectionExpiryDate ? new Date(vehicle.inspectionExpiryDate).toLocaleDateString('vi-VN') : 'Chưa nhập'}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] pt-1">
                    <div>Trạm ĐK: <span className="font-semibold text-slate-800">{vehicle.inspectionStation || 'Chưa lưu'}</span></div>
                    <div className="mt-1">Dự toán phí ĐK + đường bộ: <span className="font-mono font-bold text-slate-800">{formatVND(vehicle.inspectionCost || 2500000)}</span></div>
                  </div>
                </div>

                {/* Card 2: Bảo hiểm TNDS */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      BH Bắt Buộc (TNDS)
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      {vehicle.tndsInsuranceExpiryDate ? new Date(vehicle.tndsInsuranceExpiryDate).toLocaleDateString('vi-VN') : 'Chưa nhập'}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] pt-1">
                    <div>Nhà cung cấp: <span className="font-semibold text-slate-800">{vehicle.tndsInsuranceProvider || 'Bảo Việt'}</span></div>
                    <div className="mt-1">Phí thường niên: <span className="font-mono font-bold text-slate-800">{formatVND(vehicle.tndsInsuranceCost || 873000)}</span></div>
                  </div>
                </div>

                {/* Card 3: Bảo hiểm Thân vỏ */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-purple-600" />
                      BH Thân Vỏ
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                      {vehicle.bodyInsuranceExpiryDate ? new Date(vehicle.bodyInsuranceExpiryDate).toLocaleDateString('vi-VN') : 'Chưa nhập'}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] pt-1">
                    <div>Nhà cung cấp: <span className="font-semibold text-slate-800">{vehicle.bodyInsuranceProvider || 'Bảo Việt'}</span></div>
                    <div className="mt-1">Phí thân vỏ / năm: <span className="font-mono font-bold text-purple-700">{formatVND(vehicle.bodyInsuranceCost || 25000000)}</span></div>
                  </div>
                </div>

              </div>

              {/* Technical Specs Summary */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 mt-4">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Thông Số Kỹ Thuật & Tài Xế Quản Lý
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Số Khung (VIN)</span>
                    <span className="font-mono font-bold text-slate-800">{vehicle.vinNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Số Máy</span>
                    <span className="font-mono font-bold text-slate-800">{vehicle.engineNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Dung Tích Nhớt Máy</span>
                    <span className="font-semibold text-blue-700">{vehicle.oilCapacityLiters || 'Theo hướng dẫn hãng'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Tài Xế Phụ Trách</span>
                    <span className="font-bold text-slate-900">{vehicle.driverName || 'Chưa phân công'} {vehicle.driverPhone ? `(${vehicle.driverPhone})` : ''}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'checklists' && (
            <ChecklistViewer vehicle={vehicle} />
          )}

          {activeTab === 'odo_history' && (
            <OdoHistoryTable
              vehicle={vehicle}
              logs={logs}
              onOpenAddOdo={() => onOpenOdoModal(vehicle)}
              onDeleteLog={onDeleteLog}
            />
          )}

          {activeTab === 'ai_consult' && nextMilestone && (
            <AiVehicleConsultant
              vehicle={vehicle}
              nextMilestone={nextMilestone}
            />
          )}
        </div>

      </div>
    </div>
  );
};
