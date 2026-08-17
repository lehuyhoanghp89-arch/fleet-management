import React from 'react';
import { 
  Wrench, 
  Sparkles, 
  ChevronRight, 
  Edit3, 
  ShieldAlert, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { Vehicle, MaintenanceMilestone } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface FleetTableViewProps {
  vehicles: Vehicle[];
  vehicleMilestonesMap: Record<string, MaintenanceMilestone[]>;
  onOpenDetail: (vehicle: Vehicle, initialTab?: string) => void;
  onOpenOdoUpdate: (vehicle: Vehicle) => void;
  onOpenAiConsult: (vehicle: Vehicle) => void;
  onOpenEditVehicle?: (vehicle: Vehicle) => void;
}

export const FleetTableView: React.FC<FleetTableViewProps> = ({
  vehicles,
  vehicleMilestonesMap,
  onOpenDetail,
  onOpenOdoUpdate,
  onOpenAiConsult,
  onOpenEditVehicle
}) => {
  const getTierBadge = (milestone: MaintenanceMilestone) => {
    const code = milestone.shortTier.toUpperCase();
    if (code.includes('SERVICE B') || code.includes('SERVICE A')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (code.includes('CẤP 4') || code.includes('ĐẠI TU')) {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (code.includes('CẤP 3')) {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (code.includes('CẤP 2')) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h2 className="font-bold text-slate-700 text-sm sm:text-base">
          Danh sách xe & Cấp bảo dưỡng dự báo
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            CHUẨN HÃNG THEO ODO
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-400 font-bold tracking-widest border-b border-slate-200 select-none">
            <tr>
              <th className="px-6 py-3.5">Mã Xe / Tên Dòng Xe</th>
              <th className="px-6 py-3.5 text-right">Số KM Hiện Tại</th>
              <th className="px-6 py-3.5 text-right">TB Ngày (km)</th>
              <th className="px-6 py-3.5">Cấp Bảo Dưỡng</th>
              <th className="px-6 py-3.5">Dự Kiến Mốc Tiếp Theo</th>
              <th className="px-6 py-3.5 text-right">Chi Phí Dự Tính</th>
              <th className="px-6 py-3.5 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-slate-700 text-base">Chưa có phương tiện nào trong danh sách</div>
                    <p className="text-xs text-slate-500">
                      Hãy bấm <strong>"+ Thêm Xe Mới"</strong> ở góc trên để tạo xe đầu tiên của bạn hoặc kết nối Supabase Database.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
              const milestones = vehicleMilestonesMap[vehicle.id] || [];
              const next = milestones[0];
              if (!next) return null;

              const isOverdue = next.urgencyLevel === 'overdue';
              const isUrgent = next.urgencyLevel === 'urgent';
              const isDueSoon = next.urgencyLevel === 'due_soon';

              return (
                <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Mã Xe / Tên Dòng Xe */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {vehicle.code}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{vehicle.name}</span>
                          <span className="font-mono text-[11px] text-slate-500 font-normal px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                            {vehicle.licensePlate}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {vehicle.brand} • {vehicle.engine}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Số KM Hiện Tại */}
                  <td className="px-6 py-4 text-right font-mono font-medium text-slate-900">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{vehicle.currentOdo.toLocaleString('vi-VN')}</span>
                      <button
                        onClick={() => onOpenOdoUpdate(vehicle)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100"
                        title="Cập nhật ODO"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* TB Ngày (km) */}
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {vehicle.averageKmPerDay}
                    </span>
                  </td>

                  {/* Cấp Bảo Dưỡng */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-block ${getTierBadge(next)}`}>
                      {next.shortTier}
                    </span>
                  </td>

                  {/* Dự Kiến Mốc Tiếp Theo */}
                  <td className="px-6 py-4">
                    {isOverdue ? (
                      <div>
                        <div className="font-bold text-red-600 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> ĐÃ QUÁ HẠN
                        </div>
                        <div className="text-[11px] text-red-500 font-mono">
                          {next.kmRemaining.toLocaleString('vi-VN')} km ({targetOdoFormat(next.targetOdo)} km)
                        </div>
                      </div>
                    ) : isUrgent ? (
                      <div>
                        <div className="font-bold text-amber-600 font-mono">
                          {next.targetOdo.toLocaleString('vi-VN')} km
                        </div>
                        <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Còn {next.kmRemaining.toLocaleString('vi-VN')} km (~ {next.daysRemaining} ngày)
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-slate-900 font-mono">
                          {next.targetOdo.toLocaleString('vi-VN')} km
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ~ {next.daysRemaining} ngày nữa ({new Date(next.estimatedDate).toLocaleDateString('vi-VN')})
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Chi Phí Dự Tính */}
                  <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono">
                    {formatVND(next.estimatedCost)}
                  </td>

                  {/* Hành Động */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onOpenEditVehicle && (
                        <button
                          onClick={() => onOpenEditVehicle(vehicle)}
                          title="Sửa thông tin xe, số khung, số máy, tài xế..."
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenAiConsult(vehicle)}
                        title="Tư vấn kỹ thuật AI"
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenDetail(vehicle, 'milestones')}
                        title="Xem toàn bộ lộ trình cấp tương lai"
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function targetOdoFormat(odo: number) {
  return odo.toLocaleString('vi-VN');
}
