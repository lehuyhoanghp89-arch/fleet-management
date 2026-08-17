import React from 'react';
import { Calendar, Gauge, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { OdoLog, Vehicle } from '../types';
import { calculateRollingDailyKm } from '../utils/maintenanceEngine';

interface OdoHistoryTableProps {
  vehicle: Vehicle;
  logs: OdoLog[];
  onOpenAddOdo: () => void;
  onDeleteLog?: (logId: string) => void;
}

export const OdoHistoryTable: React.FC<OdoHistoryTableProps> = ({
  vehicle,
  logs,
  onOpenAddOdo,
  onDeleteLog
}) => {
  const vehicleLogs = logs
    .filter(l => l.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rollingDailyRate = calculateRollingDailyKm(vehicleLogs, vehicle.averageKmPerDay || 45);

  return (
    <div className="space-y-4">
      {/* Dynamic Rate Banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Tốc độ chạy trung bình thực tế:</div>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mt-0.5">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span>{rollingDailyRate} km / ngày</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Tự động điều chỉnh dự phóng ngày bảo dưỡng theo thói quen chạy nhiều/ít của xe
          </p>
        </div>

        <button
          onClick={onOpenAddOdo}
          className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận ODO mới</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Ngày ghi nhận</th>
              <th className="py-3 px-4">Số ODO (km)</th>
              <th className="py-3 px-4 text-right">Tăng thêm (+km)</th>
              <th className="py-3 px-4">Ghi chú chuyến đi</th>
              {onDeleteLog && <th className="py-3 px-3 text-center">Xóa</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {vehicleLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Chưa có lịch sử cập nhật ODO nào. Hãy bấm "Ghi nhận ODO mới" để lưu thông số.
                </td>
              </tr>
            ) : (
              vehicleLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(log.date).toLocaleDateString('vi-VN')}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {log.odo.toLocaleString('vi-VN')} km
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {log.deltaKm > 0 ? `+${log.deltaKm.toLocaleString('vi-VN')}` : '-'} km
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                    {log.note || 'Cập nhật định kỳ'}
                  </td>
                  {onDeleteLog && (
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
