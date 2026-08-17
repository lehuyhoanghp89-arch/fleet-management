import React, { useState } from 'react';
import { X, Plus, Car, Shield, Fuel, FileCheck, Calendar, Info } from 'lucide-react';
import { Vehicle } from '../types';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVehicle: Vehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
}) => {
  const [code, setCode] = useState('CAR07');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<'Mercedes-Benz' | 'Ford' | 'Kia' | 'Hyundai' | 'Khác'>('Ford');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState(2024);
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState<'Xăng' | 'Dầu Diesel' | 'Hybrid'>('Dầu Diesel');
  const [currentOdo, setCurrentOdo] = useState<number>(10000);
  const [baseCycleKm, setBaseCycleKm] = useState<number>(10000);
  const [seatCount, setSeatCount] = useState<number>(7);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Legal & Compliance fields
  const [inspectionExpiryDate, setInspectionExpiryDate] = useState('');
  const [inspectionStation, setInspectionStation] = useState('');
  const [tndsInsuranceExpiryDate, setTndsInsuranceExpiryDate] = useState('');
  const [tndsInsuranceProvider, setTndsInsuranceProvider] = useState('Bảo Việt');
  const [bodyInsuranceExpiryDate, setBodyInsuranceExpiryDate] = useState('');
  const [bodyInsuranceProvider, setBodyInsuranceProvider] = useState('Bảo Việt');
  const [vinNumber, setVinNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !licensePlate.trim()) return;

    // Automatic default daily km calculation starting point (e.g. 40 km/day until first logs come in)
    const initialDailyKm = 40;

    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      code: code.toUpperCase(),
      name,
      brand,
      model: model || name,
      year: Number(year),
      licensePlate,
      engine: engine || 'Động cơ tiêu chuẩn',
      transmission: transmission || 'Tự động',
      fuelType,
      currentOdo: Number(currentOdo),
      initialOdo: Number(currentOdo),
      averageKmPerDay: initialDailyKm, // Hệ thống tự động tính toán qua logs
      lastServiceOdo: Math.max(0, Number(currentOdo) - Number(baseCycleKm)),
      lastServiceDate: new Date().toISOString().split('T')[0],
      baseCycleKm: Number(baseCycleKm) || (brand === 'Mercedes-Benz' ? 8000 : brand === 'Ford' ? 10000 : 5000),
      status: 'active',
      driverName,
      driverPhone,
      notes,
      seatCount: Number(seatCount) || 7,
      vinNumber,
      inspectionExpiryDate: inspectionExpiryDate || undefined,
      inspectionStation: inspectionStation || undefined,
      inspectionCost: 2500000,
      tndsInsuranceExpiryDate: tndsInsuranceExpiryDate || undefined,
      tndsInsuranceProvider: tndsInsuranceProvider || undefined,
      tndsInsuranceCost: 873000,
      bodyInsuranceExpiryDate: bodyInsuranceExpiryDate || undefined,
      bodyInsuranceProvider: bodyInsuranceProvider || undefined,
    };

    onAddVehicle(newVehicle);
    onClose();
  };

  const handleBrandChange = (newBrand: 'Mercedes-Benz' | 'Ford' | 'Kia' | 'Hyundai' | 'Khác') => {
    setBrand(newBrand);
    if (newBrand === 'Mercedes-Benz') setBaseCycleKm(8000);
    else if (newBrand === 'Ford') setBaseCycleKm(10000);
    else setBaseCycleKm(5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">
              Thêm Phương Tiện Mới Vào Đội Xe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          
          {/* Section 1: Basic Info */}
          <div>
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2 text-blue-700">
              1. Thông Tin Cơ Bản
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã định danh</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CAR07"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Hãng xe & Chu kỳ hãng</label>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Mercedes-Benz">Mercedes-Benz (Chu kỳ 8.000 km)</option>
                  <option value="Ford">Ford (Chu kỳ 10.000 km)</option>
                  <option value="Kia">Kia (Chu kỳ 5.000 km)</option>
                  <option value="Hyundai">Hyundai (Chu kỳ 5.000 km)</option>
                  <option value="Khác">Khác (Chu kỳ 5.000 km)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên xe & Phiên bản</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Ford Everest Titanium 2.0L 4x4"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Biển số xe</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="30H-123.45"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Năm sản xuất</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số chỗ ngồi</label>
              <input
                type="number"
                value={seatCount}
                onChange={(e) => setSeatCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nhiên liệu</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Dầu Diesel">Dầu Diesel</option>
                <option value="Xăng">Xăng</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số ODO hiện tại (km)</label>
              <input
                type="number"
                value={currentOdo}
                onChange={(e) => setCurrentOdo(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* System automated average km notice */}
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-2 text-[11px] text-blue-800">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Mức chạy trung bình (km/ngày): </span>
              <span>Hệ thống tự động tính toán động từ các lần cập nhật ODO thực tế, không cần người dùng nhập tay.</span>
            </div>
          </div>

          {/* Section 2: Đăng kiểm & Bảo hiểm */}
          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2 text-purple-700">
              2. Quản Lý Đăng Kiểm & Bảo Hiểm Xe
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Hạn Đăng Kiểm
                </label>
                <input
                  type="date"
                  value={inspectionExpiryDate}
                  onChange={(e) => setInspectionExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Trạm đăng kiểm</label>
                <input
                  type="text"
                  value={inspectionStation}
                  onChange={(e) => setInspectionStation(e.target.value)}
                  placeholder="Trạm ĐK 29-03V..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" /> Hạn Bảo Hiểm Bắt Buộc (TNDS)
                </label>
                <input
                  type="date"
                  value={tndsInsuranceExpiryDate}
                  onChange={(e) => setTndsInsuranceExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-600" /> Hạn Bảo Hiểm Thân Vỏ
                </label>
                <input
                  type="date"
                  value={bodyInsuranceExpiryDate}
                  onChange={(e) => setBodyInsuranceExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical & Driver */}
          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2 text-slate-600">
              3. Thông Số Kỹ Thuật & Tài Xế Phụ Trách
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Động cơ</label>
                <input
                  type="text"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  placeholder="2.0L Turbo Xăng..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Hộp số</label>
                <input
                  type="text"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  placeholder="Tự động 9 cấp / 10R80..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tài xế quản lý</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Họ và tên tài xế"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="09xx.xxx.xxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Vào Đội Xe</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

