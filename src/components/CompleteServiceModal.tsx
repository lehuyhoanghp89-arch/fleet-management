import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Wrench, 
  Calendar, 
  DollarSign, 
  FileText, 
  Building2, 
  Layers, 
  Plus, 
  Trash2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Vehicle, MaintenanceMilestone, ServiceRecord } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface CompleteServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  milestone?: MaintenanceMilestone | null;
  onSaveServiceRecord: (record: Omit<ServiceRecord, 'id'>, newOdo?: number) => void;
}

export const CompleteServiceModal: React.FC<CompleteServiceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  milestone,
  onSaveServiceRecord
}) => {
  if (!isOpen || !vehicle) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Default values
  const defaultTierCode = milestone?.tierCode || 'TIER_1';
  const defaultTierName = milestone?.tierName || 'Cấp 1 - Bảo dưỡng nhỏ định kỳ';
  const defaultCost = milestone?.estimatedCost || 2500000;
  const defaultOdo = milestone?.targetOdo || vehicle.currentOdo;

  const [date, setDate] = useState<string>(todayStr);
  const [odo, setOdo] = useState<number>(defaultOdo);
  const [tierCode, setTierCode] = useState<string>(defaultTierCode);
  const [tierName, setTierName] = useState<string>(defaultTierName);
  const [actualCost, setActualCost] = useState<number>(defaultCost);
  const [garageName, setGarageName] = useState<string>('Trung tâm Dịch vụ Chính hãng');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Replaced items list (defaulted to milestone items if present)
  const [replacedItems, setReplacedItems] = useState<string[]>(() => {
    if (milestone && milestone.items && milestone.items.length > 0) {
      return milestone.items.map(it => `${it.name} (${it.action === 'replace' ? 'Thay mới' : it.action === 'clean' ? 'Vệ sinh' : 'Kiểm tra'})`);
    }
    return [
      'Thay dầu nhớt động cơ chuẩn hãng',
      'Thay lọc nhớt động cơ chính hãng',
      'Kiểm tra hệ thống phanh và gầm xe',
      'Vệ sinh lọc gió động cơ và cabin'
    ];
  });

  const [newItemText, setNewItemText] = useState<string>('');
  const [updateVehicleCurrentOdo, setUpdateVehicleCurrentOdo] = useState<boolean>(odo >= vehicle.currentOdo);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setReplacedItems(prev => [...prev, newItemText.trim()]);
    setNewItemText('');
  };

  const handleRemoveItem = (index: number) => {
    setReplacedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || odo <= 0 || actualCost < 0) {
      alert('Vui lòng nhập đầy đủ ngày thực hiện, số ODO và chi phí thực tế.');
      return;
    }

    const recordData: Omit<ServiceRecord, 'id'> = {
      vehicleId: vehicle.id,
      date,
      odo: Number(odo),
      tierCode,
      tierName,
      actualCost: Number(actualCost),
      garageName: garageName.trim() || 'Xưởng Dịch Vụ Ủy Quyền',
      invoiceNumber: invoiceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      replacedItems: replacedItems.filter(it => it.trim().length > 0),
      isCompleted: true
    };

    onSaveServiceRecord(
      recordData,
      updateVehicleCurrentOdo ? Number(odo) : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Xác Nhận Đã Hoàn Thành Bảo Dưỡng Thực Tế
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                  {vehicle.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.name} ({vehicle.licensePlate}) • Cập nhật lịch sử và hóa đơn thực chi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Quick Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Ghi nhận lịch sử thực tế:</strong> Báo giá và phụ tùng khi vào xưởng có thể thay đổi theo tình trạng xe. Sau khi lưu, hệ thống sẽ đưa mốc này vào <strong>Lịch Sử Bảo Dưỡng</strong>, cập nhật ODO mốc bảo dưỡng gần nhất và tự động tính toán các mốc tiếp theo.
            </div>
          </div>

          {/* Grid 1: Date & ODO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Ngày hoàn thành bảo dưỡng *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Số ODO thực tế khi vào xưởng (km) *</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={odo}
                onChange={e => setOdo(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncCurrentOdo"
                  checked={updateVehicleCurrentOdo}
                  onChange={e => setUpdateVehicleCurrentOdo(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="syncCurrentOdo" className="text-[11px] text-slate-600 cursor-pointer">
                  Đồng thời cập nhật ODO hiện tại của xe lên {odo.toLocaleString('vi-VN')} km
                </label>
              </div>
            </div>
          </div>

          {/* Grid 2: Cấp bảo dưỡng & Chi phí thực tế */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Tên Cấp Bảo Dưỡng Đã Thực Hiện *</span>
              </label>
              <input
                type="text"
                required
                value={tierName}
                onChange={e => setTierName(e.target.value)}
                placeholder="VD: Cấp 1 (Service A), Cấp 2, Cấp 3..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tổng chi phí thực tế trên hóa đơn (VNĐ) *</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={actualCost}
                onChange={e => setActualCost(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-black text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="text-[11px] text-slate-500 font-mono mt-0.5 text-right">
                = {formatVND(actualCost)}
              </div>
            </div>
          </div>

          {/* Grid 3: Xưởng & Số Hóa đơn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Tên Đại lý / Gara thực hiện</span>
              </label>
              <input
                type="text"
                value={garageName}
                onChange={e => setGarageName(e.target.value)}
                placeholder="VD: Mercedes-Benz An Du, Ford Hà Thành..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Số Hóa Đơn / Phiếu Quyết Toán (Nếu có)</span>
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="VD: HD-2026/08892"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Replaced & Serviced Items List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Chi tiết các hạng mục phụ tùng / công việc thực tế ({replacedItems.length})</span>
              </label>
              <span className="text-[10px] text-slate-400">Có thể xóa hoặc thêm mới theo phiếu báo giá</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {replacedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-800 font-medium truncate max-w-md">• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {replacedItems.length === 0 && (
                <div className="py-2 text-center text-slate-400 text-[11px]">
                  Chưa có hạng mục nào trong danh sách.
                </div>
              )}
            </div>

            {/* Add New Item Input */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                placeholder="Nhập tên phụ tùng hoặc công việc phát sinh..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Ghi chú thêm về tình trạng kỹ thuật sau bảo dưỡng
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Cố vấn kỹ thuật báo má phanh trước còn 60%, rotuyn lái tốt, điều hòa làm mát sâu..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Đã Hoàn Thành & Lưu Lịch Sử</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
