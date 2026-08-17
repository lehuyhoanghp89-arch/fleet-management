import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle,
  Car,
  PieChart,
  ArrowUpRight,
  Filter,
  ChevronRight,
  History,
  Plus,
  Wrench,
  Building2,
  FileCheck,
  Receipt
} from 'lucide-react';
import { Vehicle, MaintenanceMilestone, OdoLog, ServiceRecord } from '../types';
import { formatVND, calculateVehicleMilestones } from '../utils/maintenanceEngine';

interface FleetBudgetViewProps {
  vehicles: Vehicle[];
  logs: OdoLog[];
  serviceRecords: ServiceRecord[];
  onOpenVehicleDetail: (vehicle: Vehicle, initialTab?: string) => void;
  onOpenExportReport: () => void;
  onOpenCompleteModal: (vehicle: Vehicle, milestone?: MaintenanceMilestone) => void;
  onDeleteServiceRecord?: (recordId: string) => void;
}

export const FleetBudgetView: React.FC<FleetBudgetViewProps> = ({
  vehicles,
  logs,
  serviceRecords,
  onOpenVehicleDetail,
  onOpenExportReport,
  onOpenCompleteModal,
  onDeleteServiceRecord
}) => {
  // Mode toggle: Future Budget Forecast vs Actual Maintenance History
  const [activeViewMode, setActiveViewMode] = useState<'future_forecast' | 'actual_history' | 'cost_comparison'>('actual_history');
  const [forecastHorizonMonths, setForecastHorizonMonths] = useState<number>(12);
  const [historyVehicleFilter, setHistoryVehicleFilter] = useState<string>('all');

  // Calculate all future milestones for all vehicles
  const vehicleMilestonesMap: Record<string, MaintenanceMilestone[]> = {};
  const allUpcomingEvents: {
    vehicle: Vehicle;
    milestone: MaintenanceMilestone;
    date: Date;
    monthKey: string;
    quarterKey: string;
  }[] = [];

  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setMonth(now.getMonth() + forecastHorizonMonths);

  let grandTotalBudget = 0;
  const monthlyCostMap: Record<string, { total: number; events: typeof allUpcomingEvents }> = {};
  const quarterlyCostMap: Record<string, number> = {};
  const vehicleCostMap: Record<string, { total: number; vehicle: Vehicle; eventCount: number }> = {};
  const tierCostMap: Record<string, { total: number; count: number; name: string }> = {
    'TIER_1': { total: 0, count: 0, name: 'Cấp 1 (Bảo dưỡng nhỏ)' },
    'TIER_2': { total: 0, count: 0, name: 'Cấp 2 (Bảo dưỡng trung bình)' },
    'TIER_3': { total: 0, count: 0, name: 'Cấp 3 (Trung bình lớn / Service B)' },
    'TIER_4': { total: 0, count: 0, name: 'Cấp 4 (Bảo dưỡng lớn / Đại tu)' },
  };

  vehicles.forEach(v => {
    const milestones = calculateVehicleMilestones(v, logs, 12);
    vehicleMilestonesMap[v.id] = milestones;
    vehicleCostMap[v.id] = { total: 0, vehicle: v, eventCount: 0 };

    milestones.forEach(m => {
      const mDate = new Date(m.estimatedDate);
      if (mDate <= cutoffDate) {
        const monthKey = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}`;
        const quarterKey = `Q${Math.floor(mDate.getMonth() / 3) + 1}/${mDate.getFullYear()}`;

        const eventItem = {
          vehicle: v,
          milestone: m,
          date: mDate,
          monthKey,
          quarterKey,
        };

        allUpcomingEvents.push(eventItem);
        grandTotalBudget += m.estimatedCost;

        // Monthly
        if (!monthlyCostMap[monthKey]) {
          monthlyCostMap[monthKey] = { total: 0, events: [] };
        }
        monthlyCostMap[monthKey].total += m.estimatedCost;
        monthlyCostMap[monthKey].events.push(eventItem);

        // Quarterly
        quarterlyCostMap[quarterKey] = (quarterlyCostMap[quarterKey] || 0) + m.estimatedCost;

        // Vehicle
        vehicleCostMap[v.id].total += m.estimatedCost;
        vehicleCostMap[v.id].eventCount += 1;

        // Tier
        if (tierCostMap[m.tierCode]) {
          tierCostMap[m.tierCode].total += m.estimatedCost;
          tierCostMap[m.tierCode].count += 1;
        }
      }
    });
  });

  // Sort upcoming events chronologically
  allUpcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Actual history metrics
  const sortedServiceRecords = useMemo(() => {
    return [...serviceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serviceRecords]);

  const filteredHistoryRecords = useMemo(() => {
    if (historyVehicleFilter === 'all') return sortedServiceRecords;
    return sortedServiceRecords.filter(r => r.vehicleId === historyVehicleFilter);
  }, [sortedServiceRecords, historyVehicleFilter]);

  const totalActualSpent = useMemo(() => {
    return serviceRecords.reduce((sum, r) => sum + r.actualCost, 0);
  }, [serviceRecords]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Professional Polished Design */}
      <div className="p-6 bg-[#0F172A] text-white rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Quản Lý Chi Phí Thực Tế & Dự Toán Bảo Dưỡng Đội Xe
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Theo dõi lịch sử hóa đơn thực tế sau mỗi lần xe vào hãng làm dịch vụ, đối chiếu với dự toán kỹ thuật và lập kế hoạch ngân sách bảo dưỡng chu kỳ tiếp theo.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap">
            <div className="bg-slate-800 rounded-xl px-4 py-2.5 border border-slate-700 text-right">
              <span className="text-[11px] text-slate-400 block">
                {activeViewMode === 'actual_history' ? 'Tổng chi phí thực tế đã quyết toán' : `Dự toán kế hoạch (${forecastHorizonMonths} tháng)`}
              </span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {formatVND(activeViewMode === 'actual_history' ? totalActualSpent : grandTotalBudget)}
              </span>
            </div>

            <button
              onClick={() => onOpenCompleteModal(vehicles[0])}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhận Hoàn Thành</span>
            </button>

            <button
              onClick={onOpenExportReport}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
            
            <button
              onClick={() => setActiveViewMode('actual_history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeViewMode === 'actual_history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <History className="w-4 h-4 text-emerald-300" />
              <span>Lịch Sử Thực Tế Đã Bảo Dưỡng ({serviceRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveViewMode('future_forecast')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeViewMode === 'future_forecast'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-300" />
              <span>Dự Toán Ngân Sách Tương Lai</span>
            </button>

            <button
              onClick={() => setActiveViewMode('cost_comparison')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeViewMode === 'cost_comparison'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Receipt className="w-4 h-4 text-purple-300" />
              <span>Bảng Tổng Hợp Chi Phí Từng Xe</span>
            </button>

          </div>

          {activeViewMode === 'future_forecast' && (
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <span className="text-slate-400 px-2 font-medium">Khung thời gian:</span>
              <button
                onClick={() => setForecastHorizonMonths(6)}
                className={`px-3 py-1 rounded-md transition-colors font-medium ${
                  forecastHorizonMonths === 6
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                6 Tháng tới
              </button>
              <button
                onClick={() => setForecastHorizonMonths(12)}
                className={`px-3 py-1 rounded-md transition-colors font-medium ${
                  forecastHorizonMonths === 12
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                12 Tháng (1 Năm)
              </button>
            </div>
          )}

          {activeViewMode === 'actual_history' && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Lọc theo xe:</span>
              <select
                value={historyVehicleFilter}
                onChange={e => setHistoryVehicleFilter(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Tất cả {vehicles.length} xe</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.code} - {v.licensePlate} ({v.name})
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* VIEW 1: ACTUAL HISTORY TABLE (MAIN REQUEST) */}
      {activeViewMode === 'actual_history' && (
        <div className="space-y-4">
          
          {/* Quick Guidance Alert */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-emerald-900 block mb-0.5">
                  Lịch Sử Hóa Đơn & Phiếu Quyết Toán Thực Tế Sau Khi Hoàn Thành
                </strong>
                <span>
                  Bảng này lưu trữ toàn bộ các lần bảo dưỡng đã thực hiện ngoài thực tế kèm số tiền quyết toán, số hóa đơn, gara thực hiện và danh mục phụ tùng đã thay. Nhấp vào <strong>"Ghi Nhận Hoàn Thành"</strong> để cập nhật thêm phiếu bảo dưỡng mới nhất khi xe về xưởng.
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenCompleteModal(vehicles[0])}
              className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Phiếu Mới</span>
            </button>
          </div>

          {/* Service Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Danh Sách Các Đợt Bảo Dưỡng Đã Hoàn Thành Thực Tế ({filteredHistoryRecords.length} phiếu)</span>
              </h3>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">Tổng thực chi danh sách lọc:</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">
                  {formatVND(filteredHistoryRecords.reduce((sum, r) => sum + r.actualCost, 0))}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-400 font-bold tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã & Biển số xe</th>
                    <th className="py-3 px-4">Ngày làm dịch vụ</th>
                    <th className="py-3 px-4">Số ODO lúc BD</th>
                    <th className="py-3 px-4">Cấp bảo dưỡng</th>
                    <th className="py-3 px-4">Đại lý / Gara thực hiện</th>
                    <th className="py-3 px-4">Hạng mục phụ tùng đã thay</th>
                    <th className="py-3 px-4 text-right">Chi phí thực tế</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredHistoryRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span>Chưa có phiếu bảo dưỡng nào phù hợp với bộ lọc hiện tại.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryRecords.map(rec => {
                      const veh = vehicles.find(v => v.id === rec.vehicleId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {veh?.code || 'CAR'}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900">{veh?.licensePlate}</div>
                                <div className="text-[10px] text-slate-500">{veh?.name}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono font-medium text-slate-800">
                            {new Date(rec.date).toLocaleDateString('vi-VN')}
                          </td>

                          <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                            {rec.odo.toLocaleString('vi-VN')} km
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-block">
                              {rec.tierName}
                            </span>
                            {rec.invoiceNumber && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                HĐ: {rec.invoiceNumber}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{rec.garageName}</span>
                            </div>
                            {rec.notes && (
                              <div className="text-[10px] text-slate-500 italic truncate max-w-[180px]" title={rec.notes}>
                                {rec.notes}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            {rec.replacedItems && rec.replacedItems.length > 0 ? (
                              <div className="space-y-0.5">
                                {rec.replacedItems.slice(0, 2).map((item, idx) => (
                                  <div key={idx} className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    <span className="truncate">{item}</span>
                                  </div>
                                ))}
                                {rec.replacedItems.length > 2 && (
                                  <div className="text-[10px] text-blue-600 font-semibold">
                                    +{rec.replacedItems.length - 2} hạng mục khác...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Bảo dưỡng gói hãng</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                            {formatVND(rec.actualCost)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {veh && (
                                <button
                                  onClick={() => onOpenVehicleDetail(veh, 'service_history')}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                                  title="Xem toàn bộ lịch sử xe này"
                                >
                                  Chi tiết xe
                                </button>
                              )}
                              {onDeleteServiceRecord && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi bảo dưỡng này?')) {
                                      onDeleteServiceRecord(rec.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                  title="Xóa phiếu"
                                >
                                  <span className="text-xs">✕</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: FUTURE FORECAST BUDGET (PREVIOUS VIEW) */}
      {activeViewMode === 'future_forecast' && (
        <div className="space-y-6">
          
          {/* Grid: Quarterly Breakdown & Tier Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Quarterly Cost Summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Dự Toán Ngân Sách Theo Quý
                </h3>
                <span className="text-xs text-slate-500">Toàn bộ {vehicles.length} xe</span>
              </div>

              <div className="space-y-2.5">
                {Object.keys(quarterlyCostMap).length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">Không có mốc bảo dưỡng trong kỳ</div>
                ) : (
                  Object.entries(quarterlyCostMap).map(([qKey, cost]) => {
                    const percentage = grandTotalBudget > 0 ? Math.round((cost / grandTotalBudget) * 100) : 0;
                    return (
                      <div key={qKey} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{qKey}</span>
                          <span className="font-bold font-mono text-xs text-blue-600">
                            {formatVND(cost)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">
                          Chiếm {percentage}% tổng ngân sách kỳ
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cost by Maintenance Tier */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Cơ Cấu Chi Phí Theo Cấp Bảo Dưỡng
                </h3>
                <span className="text-xs text-slate-500">Phân bổ cấp độ</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(tierCostMap).map(([tCode, tData]) => {
                  const percentage = grandTotalBudget > 0 ? Math.round((tData.total / grandTotalBudget) * 100) : 0;
                  return (
                    <div key={tCode} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900">{tData.name}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({tData.count} lần bảo dưỡng)</span>
                        </div>
                        <span className="font-bold font-mono text-xs text-purple-600">
                          {formatVND(tData.total)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        {percentage}% ngân sách
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Chronological Timeline Table of All Maintenance Events */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-2">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Lịch Trình Chi Tiết Các Lần Bảo Dưỡng Trong Tương Lai (Xếp Theo Thứ Tự Thời Gian)
              </h3>
              <span className="text-xs text-slate-500 font-medium">Tổng cộng {allUpcomingEvents.length} sự kiện</span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-400 font-bold tracking-widest border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Ngày dự kiến</th>
                    <th className="py-2.5 px-4">Mã & Tên xe</th>
                    <th className="py-2.5 px-4">Mốc ODO mục tiêu</th>
                    <th className="py-2.5 px-4">Cấp bảo dưỡng</th>
                    <th className="py-2.5 px-4">Số km còn lại</th>
                    <th className="py-2.5 px-4 text-right">Dự toán chi phí</th>
                    <th className="py-2.5 px-4 text-center">Xác nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allUpcomingEvents.map((evt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.date.toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono font-bold mr-1.5 text-slate-900">{evt.vehicle.code}</span>
                        <span className="text-slate-600">{evt.vehicle.name}</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {evt.milestone.targetOdo.toLocaleString('vi-VN')} km
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          evt.milestone.tierLevel === 4
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : evt.milestone.tierLevel === 3
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : evt.milestone.tierLevel === 2
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {evt.milestone.shortTier}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {evt.milestone.kmRemaining.toLocaleString('vi-VN')} km
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatVND(evt.milestone.estimatedCost)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => onOpenCompleteModal(evt.vehicle, evt.milestone)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded text-xs font-bold transition-all"
                          title="Đã thực hiện xong? Bấm để lưu hóa đơn thực chi"
                        >
                          Xong & Lưu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: VEHICLE COST COMPARISON (ACTUAL VS FORECAST) */}
      {activeViewMode === 'cost_comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              Tổng Hợp Chi Phí Thực Tế & Dự Báo Toàn Bộ {vehicles.length} Xe
            </h3>
            <span className="text-xs text-slate-500 font-medium">Bảng phân tích toàn diện</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-400 font-bold tracking-widest border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã xe</th>
                  <th className="py-3 px-4">Tên xe & Biển số</th>
                  <th className="py-3 px-4">Hãng</th>
                  <th className="py-3 px-4 text-right">ODO Hiện tại</th>
                  <th className="py-3 px-4 text-center">Đã BD (Lần)</th>
                  <th className="py-3 px-4 text-right">Đã thực chi (VNĐ)</th>
                  <th className="py-3 px-4 text-right">Dự toán {forecastHorizonMonths}T tới</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vehicles.map(vehicle => {
                  const vehRecords = serviceRecords.filter(r => r.vehicleId === vehicle.id);
                  const vehSpent = vehRecords.reduce((sum, r) => sum + r.actualCost, 0);
                  const vehForecast = vehicleCostMap[vehicle.id]?.total || 0;

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {vehicle.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{vehicle.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{vehicle.licensePlate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                          {vehicle.brand}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {(vehicle.currentOdo || 0).toLocaleString('vi-VN')} km
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {vehRecords.length} lần
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600">
                        {formatVND(vehSpent)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-600">
                        {formatVND(vehForecast)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onOpenCompleteModal(vehicle)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded text-xs font-bold transition-all"
                            title="Thêm hóa đơn bảo dưỡng"
                          >
                            + Hóa đơn
                          </button>
                          <button
                            onClick={() => onOpenVehicleDetail(vehicle, 'service_history')}
                            className="px-2 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            Lịch sử
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
