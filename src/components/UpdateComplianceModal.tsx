import React, { useState, useEffect } from 'react';
import { X, Shield, Calendar, Check, AlertTriangle, Building, DollarSign, Clock } from 'lucide-react';
import { Vehicle } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface UpdateComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSaveCompliance: (vehicleId: string, updates: Partial<Vehicle>) => void;
}

export const UpdateComplianceModal: React.FC<UpdateComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSaveCompliance,
}) => {
  const [inspectionExpiryDate, setInspectionExpiryDate] = useState('');
  const [inspectionStation, setInspectionStation] = useState('');
  const [inspectionCost, setInspectionCost] = useState<number>(2500000);

  const [tndsInsuranceExpiryDate, setTndsInsuranceExpiryDate] = useState('');
  const [tndsInsuranceProvider, setTndsInsuranceProvider] = useState('Bảo Việt');
  const [tndsInsuranceCost, setTndsInsuranceCost] = useState<number>(873000);

  const [bodyInsuranceExpiryDate, setBodyInsuranceExpiryDate] = useState('');
  const [bodyInsuranceProvider, setBodyInsuranceProvider] = useState('Bảo Việt');
  const [bodyInsuranceCost, setBodyInsuranceCost] = useState<number>(25000000);

  useEffect(() => {
    if (vehicle) {
      setInspectionExpiryDate(vehicle.inspectionExpiryDate || '');
      setInspectionStation(vehicle.inspectionStation || 'Trạm ĐK 29-03V Hà Nội');
      setInspectionCost(vehicle.inspectionCost || 2500000);

      setTndsInsuranceExpiryDate(vehicle.tndsInsuranceExpiryDate || '');
      setTndsInsuranceProvider(vehicle.tndsInsuranceProvider || 'Bảo Việt');
      setTndsInsuranceCost(vehicle.tndsInsuranceCost || (vehicle.seatCount === 16 ? 1397000 : 873000));

      setBodyInsuranceExpiryDate(vehicle.bodyInsuranceExpiryDate || '');
      setBodyInsuranceProvider(vehicle.bodyInsuranceProvider || 'Bảo Việt');
      setBodyInsuranceCost(vehicle.bodyInsuranceCost || 25000000);
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleAddYears = (currentDateStr: string, years: number) => {
    const base = currentDateStr ? new Date(currentDateStr) : new Date();
    base.setFullYear(base.getFullYear() + years);
    return base.toISOString().split('T')[0];
  };

  const handleAddMonths = (currentDateStr: string, months: number) => {
    const base = currentDateStr ? new Date(currentDateStr) : new Date();
    base.setMonth(base.getMonth() + months);
    return base.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompliance(vehicle.id, {
      inspectionExpiryDate: inspectionExpiryDate || undefined,
      inspectionStation: inspectionStation || undefined,
      inspectionCost: Number(inspectionCost) || 0,
      tndsInsuranceExpiryDate: tndsInsuranceExpiryDate || undefined,
      tndsInsuranceProvider: tndsInsuranceProvider || undefined,
      tndsInsuranceCost: Number(tndsInsuranceCost) || 0,
      bodyInsuranceExpiryDate: bodyInsuranceExpiryDate || undefined,
      bodyInsuranceProvider: bodyInsuranceProvider || undefined,
      bodyInsuranceCost: Number(bodyInsuranceCost) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                Gia Hạn & Cập Nhật Hồ Sơ Xe: {vehicle.code} - {vehicle.name}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Biển số: {vehicle.licensePlate} • {vehicle.seatCount || 7} chỗ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto text-xs flex-1">
          
          {/* Informational Guidance */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[11px]">Chế độ: Cập nhật & Gia hạn hồ sơ hiện có</div>
              <div className="text-[10px] text-blue-700 mt-0.5 leading-relaxed">
                Form này dùng để chỉnh sửa hoặc gia hạn các thông tin hiện tại của xe (ngày hết hạn, trạm đăng kiểm, đơn vị bảo hiểm và chi phí). Dữ liệu sau khi lưu sẽ cập nhật đè lên hồ sơ xe hiện tại và tính lại lịch trình tự động.
              </div>
            </div>
          </div>

          {/* Block 1: Đăng kiểm */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                1. Sổ Đăng Kiểm & Phí Sử Dụng Đường Bộ
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setInspectionExpiryDate(handleAddMonths(inspectionExpiryDate, 6))}
                  className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-semibold text-blue-700"
                >
                  +6 Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionExpiryDate(handleAddYears(inspectionExpiryDate, 1))}
                  className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-semibold text-blue-700"
                >
                  +1 Năm
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionExpiryDate(handleAddYears(inspectionExpiryDate, 2))}
                  className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-semibold text-blue-700"
                >
                  +2 Năm
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày hết hạn đăng kiểm mới</label>
                <input
                  type="date"
                  value={inspectionExpiryDate}
                  onChange={(e) => setInspectionExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Trạm đăng kiểm thực hiện</label>
                <input
                  type="text"
                  value={inspectionStation}
                  onChange={(e) => setInspectionStation(e.target.value)}
                  placeholder="Trạm ĐK 29-03V..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tổng phí kiểm định + Phí đường bộ (VNĐ)</label>
              <input
                type="number"
                value={inspectionCost}
                onChange={(e) => setInspectionCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
              />
            </div>
          </div>

          {/* Block 2: Bảo hiểm TNDS bắt buộc */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                <Shield className="w-4 h-4 text-emerald-600" />
                2. Bảo Hiểm Bắt Buộc Trách Nhiệm Dân Sự (TNDS)
              </span>
              <button
                type="button"
                onClick={() => setTndsInsuranceExpiryDate(handleAddYears(tndsInsuranceExpiryDate, 1))}
                className="px-2.5 py-0.5 bg-white hover:bg-emerald-100 border border-emerald-300 rounded text-[11px] font-semibold text-emerald-800"
              >
                +1 Năm Hạn Mới
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày hết hạn TNDS</label>
                <input
                  type="date"
                  value={tndsInsuranceExpiryDate}
                  onChange={(e) => setTndsInsuranceExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Công ty / Đơn vị bảo hiểm</label>
                <input
                  type="text"
                  value={tndsInsuranceProvider}
                  onChange={(e) => setTndsInsuranceProvider(e.target.value)}
                  placeholder="Bảo Việt, PVI, PJICO, PTI..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Phí bảo hiểm TNDS (VNĐ)</label>
              <input
                type="number"
                value={tndsInsuranceCost}
                onChange={(e) => setTndsInsuranceCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
              />
            </div>
          </div>

          {/* Block 3: Bảo hiểm Thân Vỏ Vật Chất */}
          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
              <span className="font-bold text-purple-950 flex items-center gap-1.5 text-sm">
                <Shield className="w-4 h-4 text-purple-600" />
                3. Bảo Hiểm Tự Nguyện Vật Chất Thân Vỏ
              </span>
              <button
                type="button"
                onClick={() => setBodyInsuranceExpiryDate(handleAddYears(bodyInsuranceExpiryDate, 1))}
                className="px-2.5 py-0.5 bg-white hover:bg-purple-100 border border-purple-300 rounded text-[11px] font-semibold text-purple-800"
              >
                +1 Năm Hạn Mới
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày hết hạn Thân Vỏ</label>
                <input
                  type="date"
                  value={bodyInsuranceExpiryDate}
                  onChange={(e) => setBodyInsuranceExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Đơn vị bảo hiểm thân vỏ</label>
                <input
                  type="text"
                  value={bodyInsuranceProvider}
                  onChange={(e) => setBodyInsuranceProvider(e.target.value)}
                  placeholder="PVI, Bảo Việt, Liberty..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Phí bảo hiểm thân vỏ hàng năm (VNĐ)</label>
              <input
                type="number"
                value={bodyInsuranceCost}
                onChange={(e) => setBodyInsuranceCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Cập Nhật & Lưu Thay Đổi Vào Hồ Sơ Xe</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
