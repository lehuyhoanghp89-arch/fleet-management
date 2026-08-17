import React, { useState } from 'react';
import { 
  Calendar, 
  Wrench, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { MaintenanceMilestone, Vehicle } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface FutureMilestonesTableProps {
  vehicle: Vehicle;
  milestones: MaintenanceMilestone[];
  onSelectMilestone?: (milestone: MaintenanceMilestone) => void;
  onCompleteMilestone?: (milestone: MaintenanceMilestone) => void;
}

export const FutureMilestonesTable: React.FC<FutureMilestonesTableProps> = ({
  vehicle,
  milestones,
  onSelectMilestone,
  onCompleteMilestone
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getTierColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 3:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 2:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  const totalFutureCost = milestones.reduce((sum, m) => sum + m.estimatedCost, 0);

  return (
    <div className="space-y-4">
      {/* Intro & Summary Box */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 rounded-xl border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Lộ Trình Cấp Bảo Dưỡng Tương Lai ({milestones.length} mốc tiếp theo)
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Tính toán tự động theo sổ tay kỹ thuật <strong className="text-slate-800 dark:text-slate-200">{vehicle.brand}</strong> với mức chạy bình quân <strong className="text-blue-600 dark:text-blue-400 font-mono">{vehicle.averageKmPerDay} km/ngày</strong>.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg border border-blue-200 dark:border-slate-700 text-right min-w-[170px]">
          <div className="text-[11px] text-slate-500">Tổng dự toán {milestones.length} lần tới</div>
          <div className="text-base font-extrabold text-blue-700 dark:text-blue-400 font-mono">
            {formatVND(totalFutureCost)}
          </div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-2.5">
        {milestones.map((m, idx) => {
          const isExpanded = expandedIndex === idx;
          const isNext = m.isCurrentNext;

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${
                isNext
                  ? 'border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 shadow-md ring-1 ring-blue-400/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Milestone Summary Header Row */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer gap-2 select-none"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Step index badge */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isNext ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Target ODO & Tier Info */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base font-mono text-slate-900 dark:text-white">
                        {m.targetOdo.toLocaleString('vi-VN')} km
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getTierColor(m.tierLevel)}`}>
                        {m.shortTier}
                      </span>
                      {isNext && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 animate-pulse">
                          Đợt Kế Tiếp
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-2">
                      <span>{m.tierName}</span>
                    </div>
                  </div>
                </div>

                {/* Right columns: Remaining Km, Estimated Date & Cost */}
                <div className="flex items-center space-x-3 sm:space-x-6 text-right shrink-0">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {m.kmRemaining > 0 ? (
                        <>Còn {m.kmRemaining.toLocaleString('vi-VN')} km</>
                      ) : (
                        <span className="text-red-600">Đã tới hạn</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(m.estimatedDate).toLocaleDateString('vi-VN')}</span>
                      <span className="hidden sm:inline">({m.daysRemaining} ngày)</span>
                    </div>
                  </div>

                  <div className="min-w-[100px] text-right">
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                      {formatVND(m.estimatedCost)}
                    </div>
                    <div className="text-[10px] text-slate-400">Dự toán chuẩn hãng</div>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Itemized Checklist for this specific milestone tier */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 rounded-b-xl space-y-3">
                  
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-blue-500" />
                      Hạng mục phụ tùng & nhân công bắt buộc cho cấp này:
                    </span>
                    <span className="text-[11px] text-slate-400 italic">
                      {m.brandNotes}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.items.map((item, iIndex) => (
                      <div
                        key={iIndex}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start justify-between text-xs gap-2 shadow-2xs"
                      >
                        <div className="flex items-start space-x-2">
                          <span className={`p-1 rounded-md mt-0.5 ${
                            item.action === 'replace' 
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' 
                              : item.action === 'clean'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.action === 'replace' ? 'Thay mới định kỳ' : item.action === 'clean' ? 'Vệ sinh / súc rửa' : 'Kiểm tra kỹ thuật'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {item.unitPrice + item.laborPrice > 0 ? formatVND(item.unitPrice + item.laborPrice) : 'Theo gói'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions strip for this milestone */}
                  {onCompleteMilestone && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] text-slate-500">
                        Đã cho xe vào gara thực hiện xong mốc này?
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteMilestone(m);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Xác nhận đã bảo dưỡng xong (Nhập hóa đơn & ODO)</span>
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
