-- ==============================================================================
-- SUPABASE DATABASE SCHEMA CHO HỆ THỐNG QUẢN LÝ BẢO DƯỠNG ĐỘI XE Ô TÔ
-- ==============================================================================
-- Hướng dẫn: Copy toàn bộ nội dung file này và dán vào Supabase SQL Editor -> Bấm "Run"

-- (TÙY CHỌN) XÓA BẢNG CŨ ĐỂ KHỞI TẠO LẠI TỪ ĐẦU (NẾU MUỐN RESET SẠCH SẼ):
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

    -- Thông số kỹ thuật & định danh
    vin_number TEXT,
    engine_number TEXT,
    seat_count INTEGER,
    oil_capacity_liters TEXT,
    registration_date DATE,

    -- Đăng kiểm
    inspection_expiry_date DATE,
    inspection_station TEXT,
    inspection_cost NUMERIC DEFAULT 2500000,

    -- Bảo hiểm TNDS bắt buộc
    tnds_insurance_expiry_date DATE,
    tnds_insurance_provider TEXT DEFAULT 'Bảo Việt',
    tnds_insurance_cost NUMERIC DEFAULT 873000,

    -- Bảo hiểm thân vỏ
    body_insurance_expiry_date DATE,
    body_insurance_provider TEXT,
    body_insurance_cost NUMERIC,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG NHẬT KÝ ODO (odo_logs)
CREATE TABLE public.odo_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    odo INTEGER NOT NULL,
    delta_km INTEGER DEFAULT 0,
    note TEXT,
    recorded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG LỊCH SỬ BẢO DƯỠNG & HÓA ĐƠN THỰC TẾ (service_records)
CREATE TABLE public.service_records (
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
CREATE TABLE public.user_profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT '123456',
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'driver', -- 'admin', 'technician', 'driver', 'viewer'
    role_title TEXT,
    avatar TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NẠP DỮ LIỆU TÀI KHOẢN MẪU CÙNG MẬT KHẨU KHỞI TẠO
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

-- TẠO CHỈ MỤC (INDEXES) ĐỂ TRUY VẤN NHANH
CREATE INDEX IF NOT EXISTS idx_odo_logs_vehicle_id ON public.odo_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_odo_logs_date ON public.odo_logs(date);
CREATE INDEX IF NOT EXISTS idx_service_records_vehicle_id ON public.service_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_records_date ON public.service_records(date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- BẬT ROW LEVEL SECURITY (RLS) VÀ TẠO CHÍNH SÁCH PUBLIC READ/WRITE CHO ANON KEY
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odo_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Chính sách cho phép đọc/ghi qua Supabase Anon Key
CREATE POLICY "Cho phép truy cập công khai vehicles" ON public.vehicles
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép truy cập công khai odo_logs" ON public.odo_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép truy cập công khai service_records" ON public.service_records
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép truy cập công khai user_profiles" ON public.user_profiles
    FOR ALL USING (true) WITH CHECK (true);
