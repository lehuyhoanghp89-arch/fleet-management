import React from 'react';
import { X, Printer, Download, FileSpreadsheet, CheckCircle2, Car } from 'lucide-react';
import { Vehicle, MaintenanceMilestone, OdoLog } from '../types';
import { formatVND, calculateVehicleMilestones } from '../utils/maintenanceEngine';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  logs: OdoLog[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  logs
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Mã xe,Tên xe,Hãng xe,Biển số,Động cơ,Số ODO hiện tại (km),Mức chạy (km/ngày),Mốc tiếp theo (km),Cấp bảo dưỡng,Số km còn lại,Ngày dự kiến,Dự toán chi phí (VNĐ),Ghi chú kỹ thuật\n';

    vehicles.forEach(v => {
      const milestones = calculateVehicleMilestones(v, logs, 1);
      const next = milestones[0];
      if (next) {
        const row = [
          `"${v.code}"`,
          `"${v.name}"`,
          `"${v.brand}"`,
          `"${v.licensePlate}"`,
          `"${v.engine}"`,
          v.currentOdo,
          v.averageKmPerDay,
          next.targetOdo,
          `"${next.shortTier}"`,
          next.kmRemaining,
          next.estimatedDate,
          next.estimatedCost,
          `"${v.notes || ''}"`
        ].join(',');
        csvContent += row + '\n';
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_Du_Toan_Bao_Duong_Doi_Xe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  let totalFleetEstimatedCost = 0;
  const vehicleMilestones = vehicles.map(v => {
    const milestones = calculateVehicleMilestones(v, logs, 3);
    const next = milestones[0];
    if (next) totalFleetEstimatedCost += next.estimatedCost;
    return { vehicle: v, nextMilestone: next, futureMilestones: milestones };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Báo Cáo Kế Hoạch & Dự Toán Ngân Sách Bảo Dưỡng
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Xuất File Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo Cáo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 print:p-0">
          
          {/* Report Header Title */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              BẢNG TỔNG HỢP KẾ HOẠCH & DỰ TOÁN BẢO DƯỠNG ĐỘI XE
            </h1>
            <p className="text-xs text-slate-500">
              Ngày lập báo cáo: {new Date().toLocaleDateString('vi-VN')} • Chu kỳ phân tích: Mercedes-Benz, Ford, Kia, Hyundai
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 block">Tổng số xe kiểm tra:</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{vehicles.length} Xe</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 block">Tổng ngân sách đợt kế tiếp:</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{formatVND(totalFleetEstimatedCost)}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 block">Tiêu chuẩn kỹ thuật:</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Chính hãng (Sổ tay đại lý)</span>
            </div>
          </div>

          {/* Main Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Mã xe</th>
                  <th className="py-3 px-3">Phương tiện & Biển số</th>
                  <th className="py-3 px-3 text-right">ODO Hiện tại</th>
                  <th className="py-3 px-3 text-right">Tốc độ (km/ngày)</th>
                  <th className="py-3 px-3 text-center">Cấp kế tiếp</th>
                  <th className="py-3 px-3 text-right">Mốc ODO</th>
                  <th className="py-3 px-3">Dự kiến ngày</th>
                  <th className="py-3 px-3 text-right">Dự toán kinh phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {vehicleMilestones.map(({ vehicle, nextMilestone }) => {
                  if (!nextMilestone) return null;
                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {vehicle.code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{vehicle.name}</div>
                        <div className="text-[10px] text-slate-500">{vehicle.licensePlate} • {vehicle.brand}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {vehicle.currentOdo.toLocaleString('vi-VN')} km
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {vehicle.averageKmPerDay} km
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                          {nextMilestone.shortTier}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {nextMilestone.targetOdo.toLocaleString('vi-VN')} km
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {new Date(nextMilestone.estimatedDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatVND(nextMilestone.estimatedCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={7} className="py-3 px-3 text-right text-slate-800 dark:text-slate-200">
                    TỔNG CỘNG KINH PHÍ ĐỢT KẾ TIẾP TOÀN ĐỘI XE:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-blue-700 dark:text-blue-400 font-extrabold">
                    {formatVND(totalFleetEstimatedCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-8 text-center text-xs text-slate-600 dark:text-slate-400">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">NGƯỜI LẬP KẾ HOẠCH</p>
              <p className="text-[11px] italic mt-1">(Ký & ghi rõ họ tên)</p>
              <div className="h-16"></div>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">BAN GIÁM ĐỐC / PHỤ TRÁCH ĐỘI XE DUYỆT</p>
              <p className="text-[11px] italic mt-1">(Ký & đóng dấu)</p>
              <div className="h-16"></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
