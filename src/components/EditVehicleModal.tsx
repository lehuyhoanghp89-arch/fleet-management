import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Check, 
  User, 
  Phone, 
  Shield, 
  Calendar, 
  Wrench, 
  Fuel, 
  FileText, 
  Settings,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Vehicle } from '../types';
import { BRAND_CONFIGS } from '../data/vehiclePresets';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSaveVehicle: (updatedVehicle: Vehicle) => void;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSaveVehicle,
}) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [activeSection, setActiveSection] = useState<'basic' | 'specs' | 'driver' | 'compliance'>('basic');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
      });
      setSaveSuccessNotice(false);
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBrandChange = (newBrand: 'Mercedes-Benz' | 'Ford' | 'Kia' | 'Hyundai' | 'Khác') => {
    const config = BRAND_CONFIGS[newBrand];
    setFormData(prev => ({
      ...prev,
      brand: newBrand,
      baseCycleKm: config ? config.standardIntervalKm : (prev.baseCycleKm || 5000),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.licensePlate || !formData.code) {
      alert('Vui lòng nhập đầy đủ Mã xe, Tên xe và Biển số xe.');
      return;
    }

    const updated: Vehicle = {
      ...vehicle,
      ...formData,
      code: (formData.code || vehicle.code).trim().toUpperCase(),
      name: (formData.name || vehicle.name).trim(),
      licensePlate: (formData.licensePlate || vehicle.licensePlate).trim().toUpperCase(),
      brand: (formData.brand || vehicle.brand) as any,
      model: (formData.model || vehicle.model || '').trim(),
      year: Number(formData.year) || vehicle.year,
      seatCount: Number(formData.seatCount) || vehicle.seatCount || 7,
      engine: (formData.engine || vehicle.engine || '').trim(),
      transmission: (formData.transmission || vehicle.transmission || '').trim(),
      fuelType: (formData.fuelType || vehicle.fuelType) as any,
      oilCapacityLiters: (formData.oilCapacityLiters || vehicle.oilCapacityLiters || '').trim(),
      vinNumber: (formData.vinNumber || vehicle.vinNumber || '').trim().toUpperCase(),
      engineNumber: (formData.engineNumber || vehicle.engineNumber || '').trim().toUpperCase(),
      driverName: (formData.driverName || '').trim(),
      driverPhone: (formData.driverPhone || '').trim(),
      notes: (formData.notes || '').trim(),
      currentOdo: formData.currentOdo !== undefined ? Number(formData.currentOdo) : vehicle.currentOdo,
      baseCycleKm: Number(formData.baseCycleKm) || vehicle.baseCycleKm || 5000,
      inspectionExpiryDate: formData.inspectionExpiryDate || undefined,
      inspectionStation: formData.inspectionStation || undefined,
      inspectionCost: Number(formData.inspectionCost) || 0,
      tndsInsuranceExpiryDate: formData.tndsInsuranceExpiryDate || undefined,
      tndsInsuranceProvider: formData.tndsInsuranceProvider || undefined,
      tndsInsuranceCost: Number(formData.tndsInsuranceCost) || 0,
      bodyInsuranceExpiryDate: formData.bodyInsuranceExpiryDate || undefined,
      bodyInsuranceProvider: formData.bodyInsuranceProvider || undefined,
      bodyInsuranceCost: Number(formData.bodyInsuranceCost) || 0,
    };

    onSaveVehicle(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header with Dark Luxury Theme */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-mono font-bold text-sm text-white shadow-sm">
              {formData.code || vehicle.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Chỉnh Sửa Toàn Diện Hồ Sơ Xe & Tài Xế
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-bold border border-slate-700">
                  {formData.licensePlate || vehicle.licensePlate}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật thông tin định danh, số khung, số máy, tài xế phụ trách và hồ sơ bảo hiểm theo thực tế.
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

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'basic'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>1. Định Danh & Mua Xe</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('specs')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'specs'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>2. Kỹ Thuật (Số Khung/Máy)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('driver')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'driver'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>3. Lái Xe & Quản Lý</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('compliance')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'compliance'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>4. Đăng Kiểm & Bảo Hiểm</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* SECTION 1: BASIC IDENTIFICATION */}
          {activeSection === 'basic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2 text-[11px]">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Bạn có thể cập nhật lại mã xe nội bộ, tên thương mại, biển số xe chính xác sau khi bấm biển, năm sản xuất và hãng sản xuất.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã xe nội bộ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="VD: CAR01, XE-01..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Biển số xe thực tế <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate || ''}
                    onChange={(e) => handleChange('licensePlate', e.target.value)}
                    placeholder="VD: 30K-123.45"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hãng xe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.brand || 'Mercedes-Benz'}
                    onChange={(e) => handleBrandChange(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Mercedes-Benz">Mercedes-Benz (Định mức 8.000 km)</option>
                    <option value="Ford">Ford (Định mức 10.000 km)</option>
                    <option value="Kia">Kia (Định mức 5.000 km)</option>
                    <option value="Hyundai">Hyundai (Định mức 5.000 km)</option>
                    <option value="Khác">Hãng khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên phương tiện / Phiên bản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="VD: Mercedes-Benz V250 Luxury 7 chỗ"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Năm sản xuất
                  </label>
                  <input
                    type="number"
                    value={formData.year || 2023}
                    onChange={(e) => handleChange('year', Number(e.target.value))}
                    min={2000}
                    max={2030}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số chỗ ngồi đăng ký
                  </label>
                  <input
                    type="number"
                    value={formData.seatCount || 7}
                    onChange={(e) => handleChange('seatCount', Number(e.target.value))}
                    min={2}
                    max={50}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chu kỳ bảo dưỡng hãng (km)
                  </label>
                  <input
                    type="number"
                    value={formData.baseCycleKm || 5000}
                    onChange={(e) => handleChange('baseCycleKm', Number(e.target.value))}
                    step={1000}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Trạng thái vận hành
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => handleChange('status', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="active">Đang hoạt động bình thường</option>
                    <option value="in_service">Đang trong xưởng dịch vụ</option>
                    <option value="maintenance_due">Đến hạn bảo dưỡng</option>
                    <option value="overdue">Đã quá hạn bảo dưỡng</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số ODO hiện tại (km)
                  </label>
                  <input
                    type="number"
                    value={formData.currentOdo !== undefined ? formData.currentOdo : vehicle.currentOdo}
                    onChange={(e) => handleChange('currentOdo', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    placeholder="VD: 38450"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-semibold text-slate-700">Hiệu chỉnh số ODO công tơ mét:</p>
                  <p>Bạn có thể sửa trực tiếp số km tại đây nếu nhập nhầm hoặc xóa lần nhập sai trong thẻ <strong>Nhật ký ODO</strong> của xe.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: TECHNICAL SPECS, VIN & ENGINE NUMBER */}
          {activeSection === 'specs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2 text-[11px]">
                <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Nhập chính xác Số Khung (17 ký tự VIN) và Số Máy từ Cà-vẹt / Giấy đăng ký xe thực tế để phục vụ kiểm định, bảo hiểm và tra cứu phụ tùng OEM chính hãng.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số Khung (VIN) chuẩn 17 ký tự
                  </label>
                  <input
                    type="text"
                    value={formData.vinNumber || ''}
                    onChange={(e) => handleChange('vinNumber', e.target.value)}
                    placeholder="VD: W1V44781313XXXXXX"
                    maxLength={17}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Độ dài: {(formData.vinNumber || '').length}/17 ký tự
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số Máy Động Cơ
                  </label>
                  <input
                    type="text"
                    value={formData.engineNumber || ''}
                    onChange={(e) => handleChange('engineNumber', e.target.value)}
                    placeholder="VD: M274-920-312984"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Loại Động Cơ
                  </label>
                  <input
                    type="text"
                    value={formData.engine || ''}
                    onChange={(e) => handleChange('engine', e.target.value)}
                    placeholder="VD: 2.0L Turbo Xăng (M274)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hộp Số
                  </label>
                  <input
                    type="text"
                    value={formData.transmission || ''}
                    onChange={(e) => handleChange('transmission', e.target.value)}
                    placeholder="VD: 9G-TRONIC, 10R80 10-AT..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nhiên Liệu
                  </label>
                  <select
                    value={formData.fuelType || 'Xăng'}
                    onChange={(e) => handleChange('fuelType', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Xăng">Xăng (Gasoline)</option>
                    <option value="Dầu Diesel">Dầu Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Dung tích nhớt máy khuyến nghị (Lít)
                </label>
                <input
                  type="text"
                  value={formData.oilCapacityLiters || ''}
                  onChange={(e) => handleChange('oilCapacityLiters', e.target.value)}
                  placeholder="VD: 6.5 Lít (Chuẩn MB 229.5)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: DRIVER & FLEET MANAGEMENT */}
          {activeSection === 'driver' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 flex items-start gap-2 text-[11px]">
                <User className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <span>
                  Gán tài xế chuyên trách hoặc tài xế luân phiên quản lý phương tiện để tiện liên hệ nhắc lịch bảo dưỡng và đối chiếu nhật trình ODO.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Họ & Tên Tài Xế Phụ Trách
                  </label>
                  <input
                    type="text"
                    value={formData.driverName || ''}
                    onChange={(e) => handleChange('driverName', e.target.value)}
                    placeholder="VD: Nguyễn Văn Hùng"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Số Điện Thoại Tài Xế
                  </label>
                  <input
                    type="text"
                    value={formData.driverPhone || ''}
                    onChange={(e) => handleChange('driverPhone', e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú mua xe, lịch sử bàn giao hoặc yêu cầu vận hành đặc biệt
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Ghi chú về thời điểm mua xe, tình trạng lốp, phụ kiện gắn thêm, gara quen..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* SECTION 4: COMPLIANCE & INSURANCE */}
          {activeSection === 'compliance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Inspection */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Hồ Sơ Đăng Kiểm & Đường Bộ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Ngày Hết Hạn ĐK</label>
                    <input
                      type="date"
                      value={formData.inspectionExpiryDate || ''}
                      onChange={(e) => handleChange('inspectionExpiryDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Trạm Đăng Kiểm</label>
                    <input
                      type="text"
                      value={formData.inspectionStation || ''}
                      onChange={(e) => handleChange('inspectionStation', e.target.value)}
                      placeholder="Trạm 29-03V..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Dự toán phí ĐK (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.inspectionCost || 0}
                      onChange={(e) => handleChange('inspectionCost', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* TNDS */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Bảo Hiểm Bắt Buộc TNDS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Hạn BH TNDS</label>
                    <input
                      type="date"
                      value={formData.tndsInsuranceExpiryDate || ''}
                      onChange={(e) => handleChange('tndsInsuranceExpiryDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Nhà Cung Cấp</label>
                    <input
                      type="text"
                      value={formData.tndsInsuranceProvider || ''}
                      onChange={(e) => handleChange('tndsInsuranceProvider', e.target.value)}
                      placeholder="Bảo Việt, PVI..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Phí TNDS / Năm (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.tndsInsuranceCost || 0}
                      onChange={(e) => handleChange('tndsInsuranceCost', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Body Insurance */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
                <div className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Bảo Hiểm Thân Vỏ Tự Nguyện
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Hạn BH Thân Vỏ</label>
                    <input
                      type="date"
                      value={formData.bodyInsuranceExpiryDate || ''}
                      onChange={(e) => handleChange('bodyInsuranceExpiryDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Nhà Cung Cấp</label>
                    <input
                      type="text"
                      value={formData.bodyInsuranceProvider || ''}
                      onChange={(e) => handleChange('bodyInsuranceProvider', e.target.value)}
                      placeholder="Bảo Việt, Liberty..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Phí Thân Vỏ / Năm (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.bodyInsuranceCost || 0}
                      onChange={(e) => handleChange('bodyInsuranceCost', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              {saveSuccessNotice && (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã lưu thành công!
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Thay Đổi Hồ Sơ Xe</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
