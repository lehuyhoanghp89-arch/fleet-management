import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Github, 
  Globe, 
  RotateCcw,
  Sparkles,
  Layers,
  Terminal
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  totalVehiclesCount: number;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onLoadDemoData,
  onClearAllData,
  totalVehiclesCount
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'guide'>('status');
  const [copiedSql, setCopiedSql] = useState(false);
  const isConnected = isSupabaseConfigured();

  if (!isOpen) return null;

  const sqlSchema = `-- ==============================================================================
-- SUPABASE DATABASE SCHEMA CHO HỆ THỐNG QUẢN LÝ BẢO DƯỠNG ĐỘI XE Ô TÔ
-- ==============================================================================
-- 0. XÓA BẢNG CŨ ĐỂ KHỞI TẠO LẠI TỪ ĐẦU (RESET SẠCH SẼ):
DROP TABLE IF EXISTS public.service_records CASCADE;
DROP TABLE IF EXISTS public.odo_logs CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 1. BẢNG XE (vehicles)
CREATE TABLE public.vehicles (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    license_plate TEXT NOT NULL,
    engine TEXT,
    transmission TEXT,
    fuel_type TEXT,
    current_odo INTEGER NOT NULL DEFAULT 0,
    initial_odo INTEGER NOT NULL DEFAULT 0,
    average_km_per_day NUMERIC DEFAULT 45,
    last_service_odo INTEGER DEFAULT 0,
    last_service_date DATE,
    last_service_tier TEXT,
    base_cycle_km INTEGER DEFAULT 10000,
    image_key TEXT,
    status TEXT DEFAULT 'active',
    driver_name TEXT,
    driver_phone TEXT,
    notes TEXT,
    vin_number TEXT,
    engine_number TEXT,
    seat_count INTEGER,
    oil_capacity_liters TEXT,
    registration_date DATE,
    inspection_expiry_date DATE,
    inspection_station TEXT,
    inspection_cost NUMERIC DEFAULT 2500000,
    tnds_insurance_expiry_date DATE,
    tnds_insurance_provider TEXT DEFAULT 'Bảo Việt',
    tnds_insurance_cost NUMERIC DEFAULT 873000,
    body_insurance_expiry_date DATE,
    body_insurance_provider TEXT,
    body_insurance_cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG NHẬT KÝ ODO (odo_logs)
CREATE TABLE IF NOT EXISTS public.odo_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    odo INTEGER NOT NULL,
    delta_km INTEGER DEFAULT 0,
    note TEXT,
    recorded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG LỊCH SỬ BẢO DƯỠNG THỰC TẾ (service_records)
CREATE TABLE IF NOT EXISTS public.service_records (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    odo INTEGER NOT NULL,
    tier_code TEXT NOT NULL,
    tier_name TEXT NOT NULL,
    actual_cost NUMERIC NOT NULL DEFAULT 0,
    garage_name TEXT NOT NULL,
    invoice_number TEXT,
    notes TEXT,
    replaced_items JSONB DEFAULT '[]'::jsonb,
    is_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG PHÂN QUYỀN & MẬT KHẨU NGƯỜI DÙNG (user_profiles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT DEFAULT '123456',
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'driver',
    role_title TEXT,
    avatar TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NẾU ĐÃ CHẠY BẢNG TRƯỚC ĐÓ, CHẠY LỆNH NÀY ĐỂ THÊM CỘT PASSWORD:
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';

INSERT INTO public.user_profiles (id, username, password, email, full_name, role, role_title, avatar, phone_number)
VALUES 
  ('user_admin_01', 'admin', 'admin123', 'admin@fleetcare.vn', 'Nguyễn Văn Quản Trị', 'admin', 'Giám đốc Đội xe / Quản trị viên', '👨‍💼', '0901 888 999'),
  ('user_tech_01', 'kythuat', 'tech123', 'kythuat@fleetcare.vn', 'Trần Văn Kỹ Thuật', 'technician', 'Xưởng trưởng / Kỹ thuật viên', '🔧', '0912 345 678'),
  ('user_driver_01', 'taixe', 'driver123', 'taixe@fleetcare.vn', 'Lê Hoàng Tài Xế', 'driver', 'Đội trưởng Lái xe', '🚗', '0988 776 655'),
  ('user_viewer_01', 'khach', 'guest123', 'khach@fleetcare.vn', 'Khách tham quan', 'viewer', 'Khách (Chỉ xem)', '👤', '0900 000 000')
ON CONFLICT (id) DO UPDATE SET
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- TẠO INDEX VÀ ROW LEVEL SECURITY (RLS)
CREATE INDEX IF NOT EXISTS idx_odo_logs_vehicle_id ON public.odo_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_records_vehicle_id ON public.service_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odo_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on odo_logs" ON public.odo_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on service_records" ON public.service_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Cấu hình Database & Triển khai Production</h2>
              <p className="text-xs text-slate-400">Kết nối Supabase • Đẩy lên GitHub • Deploy Vercel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'status'
                ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Trạng thái kết nối</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Hướng dẫn GitHub & Vercel</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Schema SQL Supabase</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Connection Status Box */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isConnected 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isConnected ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isConnected ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {isConnected ? 'Đang kết nối Supabase Cloud Database' : 'Đang ở chế độ Offline / Local Storage'}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {isConnected 
                      ? 'Dữ liệu xe, nhật ký ODO và hóa đơn dịch vụ được đồng bộ trực tiếp hai chiều lên tài khoản Supabase PostgreSQL của bạn.'
                      : 'Toàn bộ dữ liệu hiện được lưu trữ an toàn trong trình duyệt của bạn (LocalStorage). Khi bạn thêm biến môi trường VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trên Vercel/Local, app sẽ tự động chuyển sang lưu trữ Supabase.'}
                  </p>
                </div>
              </div>

              {/* Data Management Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Quản trị dữ liệu nhanh</h4>
                  <span className="text-xs font-medium text-slate-500">
                    Hiện có: <strong>{totalVehiclesCount} xe</strong>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      if (window.confirm('Nạp bộ dữ liệu chuẩn 6 xe (Mercedes V250, GLS450, Everest, Transit, Carnival, Palisade) để thử nghiệm tính năng?')) {
                        onLoadDemoData();
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Nạp dữ liệu mẫu (6 xe)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ danh sách xe và lịch sử để nhập dữ liệu thực tế mới?')) {
                        onClearAllData();
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Xóa toàn bộ dữ liệu (Clear)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed">
                <strong>Quy trình chuẩn 3 bước:</strong> Tạo Database trên Supabase ➔ Đẩy code lên GitHub ➔ Triển khai lên Vercel.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Tạo dự án trên Supabase</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Vào <strong>supabase.com</strong> ➔ <em>New Project</em> ➔ Mở mục <strong>SQL Editor</strong> ➔ Copy đoạn mã ở tab "Schema SQL Supabase" và bấm <strong>Run</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Đẩy code lên GitHub</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Tạo một Repository mới trên GitHub (hoặc dùng tính năng Export của AI Studio) và đẩy toàn bộ source code này lên repo của bạn.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Deploy lên Vercel & Cấu hình Biến Môi Trường</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Vào <strong>vercel.com</strong> ➔ <em>Add New Project</em> ➔ Chọn repo GitHub ➔ Trong mục <strong>Environment Variables</strong>, thêm 2 biến:
                  </p>
                  <div className="pl-7 pt-1 space-y-1 font-mono text-[11px] text-slate-700">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <code>VITE_SUPABASE_URL = https://your-id.supabase.co</code>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <code>VITE_SUPABASE_ANON_KEY = eyJhbGciOi...</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Copy toàn bộ đoạn mã SQL này và dán vào <strong>Supabase SQL Editor</strong> để khởi tạo tự động 3 bảng (`vehicles`, `odo_logs`, `service_records`):
                </p>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Đã sao chép!' : 'Sao chép SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[320px] leading-relaxed select-all">
                  {sqlSchema}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
