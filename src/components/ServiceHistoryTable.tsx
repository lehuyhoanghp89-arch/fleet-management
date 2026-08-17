import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  Wrench, 
  DollarSign, 
  Building2, 
  FileText, 
  Plus, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Car
} from 'lucide-react';
import { Vehicle, ServiceRecord } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface ServiceHistoryTableProps {
  vehicle: Vehicle;
  serviceRecords: ServiceRecord[];
  onOpenCompleteModal: () => void;
  onDeleteRecord?: (recordId: string) => void;
}

export const ServiceHistoryTable: React.FC<ServiceHistoryTableProps> = ({
  vehicle,
  serviceRecords,
  onOpenCompleteModal,
  onDeleteRecord
}) => {
  const records = serviceRecords
    .filter(r => r.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = records.reduce((sum, r) => sum + r.actualCost, 0);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(records[0]?.id || null);

  return (
    <div className="space-y-4">
      {/* Top Banner KPI */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Lịch sử bảo dưỡng thực tế của xe {vehicle.code}:</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Đã hoàn thành {records.length} đợt bảo dưỡng</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Tổng thực chi: {formatVND(totalSpent)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCompleteModal}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Phiếu / Hóa Đơn Bảo Dưỡng</span>
        </button>
      </div>

      {/* Records Timeline List */}
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              Chưa có lịch sử bảo dưỡng nào được lưu cho xe <strong>{vehicle.name}</strong>. Khi xe vừa đi xưởng về, hãy bấm nút "Thêm Phiếu / Hóa Đơn Bảo Dưỡng" ở trên để ghi nhận hóa đơn thực tế và danh sách phụ tùng.
            </div>
            <button
              onClick={onOpenCompleteModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi nhận lần bảo dưỡng đầu tiên</span>
            </button>
          </div>
        ) : (
          records.map((rec, index) => {
            const isExpanded = expandedRecordId === rec.id;
            return (
              <div 
                key={rec.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header Strip */}
                <div
                  onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                  className="p-4 flex items-center justify-between cursor-pointer gap-2 select-none hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      #{records.length - index}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-extrabold text-sm sm:text-base font-mono text-slate-900">
                          {rec.odo.toLocaleString('vi-VN')} km
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {rec.tierName}
                        </span>
                        {rec.invoiceNumber && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            HĐ: {rec.invoiceNumber}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(rec.date).toLocaleDateString('vi-VN')}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{rec.garageName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actual Cost */}
                  <div className="flex items-center space-x-3 sm:space-x-5 text-right shrink-0">
                    <div>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono">
                        {formatVND(rec.actualCost)}
                      </div>
                      <div className="text-[10px] text-slate-400">Hóa đơn thực chi</div>
                    </div>

                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details: Replaced Items & Technician Notes */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/70 space-y-3 text-xs">
                    
                    {/* Replaced items */}
                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mb-2">
                        <Wrench className="w-3.5 h-3.5 text-blue-600" />
                        <span>Danh mục phụ tùng thay mới & công việc đã làm ({rec.replacedItems?.length || 0}):</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {rec.replacedItems && rec.replacedItems.length > 0 ? (
                          rec.replacedItems.map((item, idx) => (
                            <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 italic">Theo gói tiêu chuẩn của hãng</div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {rec.notes && (
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 text-xs">
                        <strong>Ghi chú kỹ thuật:</strong> {rec.notes}
                      </div>
                    )}

                    {/* Delete button if provided */}
                    {onDeleteRecord && (
                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi lịch sử bảo dưỡng này?')) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa phiếu này</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
