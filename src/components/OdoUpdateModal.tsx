import React, { useState } from 'react';
import { X, Gauge, Calendar, Plus, Save, History, Check } from 'lucide-react';
import { Vehicle } from '../types';

interface OdoUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onSaveOdo: (vehicleId: string, newOdo: number, date: string, note?: string) => void;
  onSaveBulkOdo?: (updates: { vehicleId: string; newOdo: number; date: string; note?: string }[]) => void;
}

export const OdoUpdateModal: React.FC<OdoUpdateModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  selectedVehicleId,
  onSaveOdo,
  onSaveBulkOdo
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>(selectedVehicleId ? 'single' : 'bulk');
  const [selectedId, setSelectedId] = useState<string>(selectedVehicleId || vehicles[0]?.id || '');
  
  // Single vehicle form state
  const targetVehicle = vehicles.find(v => v.id === selectedId) || vehicles[0];
  const [singleOdo, setSingleOdo] = useState<number>(targetVehicle ? targetVehicle.currentOdo : 0);
  const [singleDate, setSingleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [singleNote, setSingleNote] = useState<string>('');

  // Bulk form state: record mapping of vehicleId -> current proposed odo
  const [bulkOdos, setBulkOdos] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    vehicles.forEach(v => {
      map[v.id] = v.currentOdo;
    });
    return map;
  });
  const [bulkDate, setBulkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkNote, setBulkNote] = useState<string>('Cập nhật ODO định kỳ');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync state when target vehicle changes
  React.useEffect(() => {
    if (selectedVehicleId) {
      setSelectedId(selectedVehicleId);
      const v = vehicles.find(item => item.id === selectedVehicleId);
      if (v) {
        setSingleOdo(v.currentOdo);
      }
      setActiveTab('single');
    }
  }, [selectedVehicleId, vehicles]);

  if (!isOpen) return null;

  const handleVehicleSelect = (id: string) => {
    setSelectedId(id);
    const v = vehicles.find(item => item.id === id);
    if (v) {
      setSingleOdo(v.currentOdo);
    }
  };

  const handleAddDelta = (delta: number) => {
    setSingleOdo(prev => prev + delta);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetVehicle && singleOdo > 0) {
      onSaveOdo(targetVehicle.id, Number(singleOdo), singleDate, singleNote);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 500);
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveBulkOdo) {
      const updates = vehicles.map(v => ({
        vehicleId: v.id,
        newOdo: Number(bulkOdos[v.id] || v.currentOdo),
        date: bulkDate,
        note: bulkNote,
      }));
      onSaveBulkOdo(updates);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 500);
    }
  };

  const kmDifference = singleOdo - (targetVehicle?.currentOdo || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[92vh] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Cập Nhật Số ODO Xe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Từng xe / Toàn bộ đội xe */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-2 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <button
            onClick={() => setActiveTab('single')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors min-h-[38px] ${
              activeTab === 'single'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Cập nhật từng xe
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors min-h-[38px] ${
              activeTab === 'bulk'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Nhập cả đội ({vehicles.length} xe)
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Vehicle Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Chọn phương tiện
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {vehicles.map(v => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => handleVehicleSelect(v.id)}
                    className={`p-2 rounded-xl text-left border text-xs transition-all min-h-[52px] ${
                      selectedId === v.id
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 dark:border-blue-500 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{v.code}</span>
                      <span className="text-[10px] text-slate-500">{v.brand}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {v.name}
                    </div>
                    <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                      {v.currentOdo.toLocaleString('vi-VN')} km
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Odometer Input */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">ODO trước đó:</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {targetVehicle?.currentOdo.toLocaleString('vi-VN')} km
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Số ODO mới (km)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={singleOdo || ''}
                    onChange={(e) => setSingleOdo(Number(e.target.value))}
                    className="w-full text-lg sm:text-xl font-bold font-mono px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-semibold text-slate-400">
                    km
                  </span>
                </div>
              </div>

              {/* Quick Delta Adders */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 mr-0.5">Tăng nhanh:</span>
                {[50, 100, 200, 500, 1000].map(d => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => handleAddDelta(d)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold transition-colors min-h-[36px]"
                  >
                    +{d} km
                  </button>
                ))}
              </div>

              {kmDifference !== 0 && (
                <div className="text-xs flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <span>Chênh lệch:</span>
                  <span className={`font-mono font-bold ${kmDifference >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kmDifference > 0 ? `+${kmDifference.toLocaleString('vi-VN')}` : kmDifference.toLocaleString('vi-VN')} km
                  </span>
                </div>
              )}
            </div>

            {/* Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ngày ghi nhận
                </label>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú hành trình
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đi tỉnh đón khách"
                  value={singleNote}
                  onChange={(e) => setSingleNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 min-h-[40px]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[40px]"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-sm min-h-[40px]"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'Đã lưu!' : 'Lưu Số ODO & Cập Nhật'}</span>
              </button>
            </div>

          </form>
        ) : (
          <form onSubmit={handleBulkSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
              Nhập nhanh số ODO hiện thời của từng xe để hệ thống tự động tính toán lại mốc và cấp bảo dưỡng tương lai cho toàn bộ đội xe.
            </div>

            <div className="space-y-2.5">
              {vehicles.map((v) => (
                <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {v.code}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {v.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Biển: {v.licensePlate} • Hiện tại: {v.currentOdo.toLocaleString('vi-VN')} km
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={bulkOdos[v.id] || ''}
                      onChange={(e) => setBulkOdos({ ...bulkOdos, [v.id]: Number(e.target.value) })}
                      className="w-32 text-sm font-bold font-mono px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-right text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-xs font-medium text-slate-400">km</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ngày ghi nhận chung
                </label>
                <input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú đợt kiểm tra
                </label>
                <input
                  type="text"
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'Đã lưu thành công!' : 'Lưu Toàn Bộ Đội Xe'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
