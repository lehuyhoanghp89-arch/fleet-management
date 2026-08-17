import React from 'react';
import { 
  Gauge, 
  Calendar, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3,
  ShieldAlert
} from 'lucide-react';
import { Vehicle, MaintenanceMilestone } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface VehicleCardProps {
  vehicle: Vehicle;
  milestones: MaintenanceMilestone[];
  onOpenDetail: (vehicle: Vehicle, initialTab?: string) => void;
  onOpenOdoUpdate: (vehicle: Vehicle) => void;
  onOpenAiConsult: (vehicle: Vehicle) => void;
  onOpenEditVehicle?: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  milestones,
  onOpenDetail,
  onOpenOdoUpdate,
  onOpenAiConsult,
  onOpenEditVehicle,
}) => {
  const nextMilestone = milestones[0];
  if (!nextMilestone) return null;

  const currentOdo = vehicle.currentOdo;
  const targetOdo = nextMilestone.targetOdo;
  const baseCycle = vehicle.baseCycleKm || 5000;
  
  const previousMilestoneOdo = Math.max(0, targetOdo - baseCycle);
  const cycleProgress = Math.min(
    100,
    Math.max(0, Math.round(((currentOdo - previousMilestoneOdo) / baseCycle) * 100))
  );

  const getTierBadgeStyle = (tierLevel: number, shortTier: string) => {
    const t = shortTier.toUpperCase();
    if (t.includes('SERVICE B') || t.includes('SERVICE A')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (t.includes('CẤP 4')) {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (t.includes('CẤP 3')) {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (t.includes('CẤP 2')) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const isOverdue = nextMilestone.urgencyLevel === 'overdue';
  const isUrgent = nextMilestone.urgencyLevel === 'urgent';
  const isDueSoon = nextMilestone.urgencyLevel === 'due_soon';

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
      isOverdue
        ? 'border-red-300 ring-1 ring-red-300/40'
        : isUrgent
        ? 'border-amber-300 ring-1 ring-amber-300/40'
        : isDueSoon
        ? 'border-blue-300'
        : 'border-slate-200'
    }`}>
      
      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
              {vehicle.code}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {vehicle.brand}
            </span>
          </div>

          {/* Urgency Badge */}
          {isOverdue && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              <ShieldAlert className="w-3 h-3" /> Quá hạn
            </span>
          )}
          {isUrgent && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3 h-3" /> Gấp
            </span>
          )}
          {isDueSoon && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Calendar className="w-3 h-3" /> Sắp tới hạn
            </span>
          )}
          {nextMilestone.urgencyLevel === 'normal' && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> An toàn
            </span>
          )}
        </div>

        {/* Car Name & License Plate */}
        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="font-bold text-base text-slate-900 truncate">
              {vehicle.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {vehicle.licensePlate}
              </span>
              {onOpenEditVehicle && (
                <button
                  onClick={() => onOpenEditVehicle(vehicle)}
                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                  title="Chỉnh sửa thông tin xe, số khung, số máy, tài xế..."
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {vehicle.engine} • {vehicle.transmission}
          </p>
        </div>

        {/* Current Odometer Section with Quick-Edit button */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-[11px] text-slate-500">Số ODO hiện tại</div>
              <div className="text-base font-extrabold text-slate-900 font-mono">
                {currentOdo.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenOdoUpdate(vehicle)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 shadow-2xs"
            title="Cập nhật số km chạy hôm nay"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Nhập km</span>
          </button>
        </div>

        {/* Next Maintenance Milestone Block */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-slate-400" /> Mốc kế tiếp:
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getTierBadgeStyle(nextMilestone.tierLevel, nextMilestone.shortTier)}`}>
              {nextMilestone.shortTier}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-extrabold font-mono text-slate-900">
                {targetOdo.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-slate-400 ml-1">km</span>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-700">
                {nextMilestone.kmRemaining > 0 ? (
                  <>Còn <span className="text-blue-600 font-bold font-mono">{nextMilestone.kmRemaining.toLocaleString('vi-VN')}</span> km</>
                ) : (
                  <span className="text-red-600 font-bold font-mono">Quá {Math.abs(nextMilestone.kmRemaining).toLocaleString('vi-VN')} km</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                <span>~ {nextMilestone.daysRemaining} ngày nữa ({new Date(nextMilestone.estimatedDate).toLocaleDateString('vi-VN')})</span>
              </div>
            </div>
          </div>

          {/* Cycle Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverdue ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${cycleProgress}%` }}
            />
          </div>

          {/* Cost Estimate Preview */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">Chi phí dự tính:</span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {formatVND(nextMilestone.estimatedCost)}
            </span>
          </div>
        </div>

      </div>

      {/* Card Action Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenAiConsult(vehicle)}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
          title="Tư vấn chuẩn hãng bằng AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Hỏi AI Hãng</span>
        </button>

        <button
          onClick={() => onOpenDetail(vehicle, 'milestones')}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
        >
          <span>Lộ Trình Cấp</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
