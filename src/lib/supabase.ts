import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Vehicle, OdoLog, ServiceRecord } from '../types';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!client && supabaseUrl && supabaseAnonKey) {
    try {
      client = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
    }
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
}

// ----------------------------------------------------
// Database Operations (with Supabase)
// ----------------------------------------------------

export async function fetchVehiclesFromSupabase(): Promise<Vehicle[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('vehicles')
    .select('*')
    .order('code', { ascending: true });

  if (error) {
    console.error('Error fetching vehicles from Supabase:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    code: row.code,
    name: row.name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    licensePlate: row.license_plate,
    engine: row.engine,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    currentOdo: row.current_odo,
    initialOdo: row.initial_odo,
    averageKmPerDay: row.average_km_per_day,
    lastServiceOdo: row.last_service_odo,
    lastServiceDate: row.last_service_date,
    lastServiceTier: row.last_service_tier,
    baseCycleKm: row.base_cycle_km,
    imageKey: row.image_key,
    status: row.status || 'active',
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    notes: row.notes,
    vinNumber: row.vin_number,
    engineNumber: row.engine_number,
    seatCount: row.seat_count,
    oilCapacityLiters: row.oil_capacity_liters,
    registrationDate: row.registration_date,
    inspectionExpiryDate: row.inspection_expiry_date,
    inspectionStation: row.inspection_station,
    inspectionCost: row.inspection_cost,
    tndsInsuranceExpiryDate: row.tnds_insurance_expiry_date,
    tndsInsuranceProvider: row.tnds_insurance_provider,
    tndsInsuranceCost: row.tnds_insurance_cost,
    bodyInsuranceExpiryDate: row.body_insurance_expiry_date,
    bodyInsuranceProvider: row.body_insurance_provider,
    bodyInsuranceCost: row.body_insurance_cost,
  }));
}

export async function upsertVehicleToSupabase(v: Vehicle): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const payload = {
    id: v.id,
    code: v.code,
    name: v.name,
    brand: v.brand,
    model: v.model,
    year: v.year,
    license_plate: v.licensePlate,
    engine: v.engine,
    transmission: v.transmission,
    fuel_type: v.fuelType,
    current_odo: v.currentOdo,
    initial_odo: v.initialOdo,
    average_km_per_day: v.averageKmPerDay,
    last_service_odo: v.lastServiceOdo,
    last_service_date: v.lastServiceDate,
    last_service_tier: v.lastServiceTier,
    base_cycle_km: v.baseCycleKm,
    image_key: v.imageKey,
    status: v.status,
    driver_name: v.driverName,
    driver_phone: v.driverPhone,
    notes: v.notes,
    vin_number: v.vinNumber,
    engine_number: v.engineNumber,
    seat_count: v.seatCount,
    oil_capacity_liters: v.oilCapacityLiters,
    registration_date: v.registrationDate,
    inspection_expiry_date: v.inspectionExpiryDate,
    inspection_station: v.inspectionStation,
    inspection_cost: v.inspectionCost,
    tnds_insurance_expiry_date: v.tndsInsuranceExpiryDate,
    tnds_insurance_provider: v.tndsInsuranceProvider,
    tnds_insurance_cost: v.tndsInsuranceCost,
    body_insurance_expiry_date: v.bodyInsuranceExpiryDate,
    body_insurance_provider: v.bodyInsuranceProvider,
    body_insurance_cost: v.bodyInsuranceCost,
    updated_at: new Date().toISOString()
  };

  const { error } = await sb
    .from('vehicles')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Error upserting vehicle to Supabase:', error);
    throw error;
  }
}

export async function deleteVehicleFromSupabase(vehicleId: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const { error } = await sb
    .from('vehicles')
    .delete()
    .eq('id', vehicleId);

  if (error) {
    console.error('Error deleting vehicle from Supabase:', error);
    throw error;
  }
}

export async function fetchOdoLogsFromSupabase(): Promise<OdoLog[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('odo_logs')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching ODO logs from Supabase:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.date,
    odo: row.odo,
    deltaKm: row.delta_km,
    note: row.note,
    recordedBy: row.recorded_by,
    createdAt: row.created_at
  }));
}

export async function insertOdoLogToSupabase(log: OdoLog): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const payload = {
    id: log.id,
    vehicle_id: log.vehicleId,
    date: log.date,
    odo: log.odo,
    delta_km: log.deltaKm,
    note: log.note,
    recorded_by: log.recordedBy,
    created_at: log.createdAt || new Date().toISOString()
  };

  const { error } = await sb
    .from('odo_logs')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Error inserting ODO log to Supabase:', error);
    throw error;
  }
}

export async function deleteOdoLogFromSupabase(logId: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const { error } = await sb
    .from('odo_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('Error deleting ODO log from Supabase:', error);
    throw error;
  }
}

export async function fetchServiceRecordsFromSupabase(): Promise<ServiceRecord[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('service_records')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching service records from Supabase:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.date,
    odo: row.odo,
    tierCode: row.tier_code,
    tierName: row.tier_name,
    actualCost: Number(row.actual_cost) || 0,
    garageName: row.garage_name,
    invoiceNumber: row.invoice_number,
    notes: row.notes,
    replacedItems: Array.isArray(row.replaced_items) ? row.replaced_items : [],
    isCompleted: row.is_completed ?? true
  }));
}

export async function insertServiceRecordToSupabase(rec: ServiceRecord): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const payload = {
    id: rec.id,
    vehicle_id: rec.vehicleId,
    date: rec.date,
    odo: rec.odo,
    tier_code: rec.tierCode,
    tier_name: rec.tierName,
    actual_cost: rec.actualCost,
    garage_name: rec.garageName,
    invoice_number: rec.invoiceNumber,
    notes: rec.notes,
    replaced_items: rec.replacedItems,
    is_completed: rec.isCompleted,
    created_at: new Date().toISOString()
  };

  const { error } = await sb
    .from('service_records')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Error saving service record to Supabase:', error);
    throw error;
  }
}

export async function deleteServiceRecordFromSupabase(recordId: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const { error } = await sb
    .from('service_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting service record from Supabase:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// USER PROFILES & AUTH MANAGEMENT
// -------------------------------------------------------------
export async function fetchUsersFromSupabase(): Promise<any[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Could not fetch user profiles from Supabase (may need table creation):', error.message);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    username: row.username,
    password: row.password || undefined,
    email: row.email,
    fullName: row.full_name,
    role: row.role || 'driver',
    roleTitle: row.role_title || '',
    avatar: row.avatar || '👤',
    phoneNumber: row.phone_number || ''
  }));
}

export async function upsertUserToSupabase(user: any): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const payload: Record<string, any> = {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    role_title: user.roleTitle,
    avatar: user.avatar,
    phone_number: user.phoneNumber,
    created_at: new Date().toISOString()
  };

  if (user.password) {
    payload.password = user.password;
  }

  const { error } = await sb
    .from('user_profiles')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.warn('Error saving user profile to Supabase:', error.message);
  }
}

export async function deleteUserFromSupabase(userId: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  const { error } = await sb
    .from('user_profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.warn('Error deleting user profile from Supabase:', error.message);
  }
}

export async function verifySupabaseUserCredentials(usernameOrEmail: string, passwordAttempt: string): Promise<{ matched: boolean; user?: any }> {
  const sb = getSupabaseClient();
  if (!sb) return { matched: false };

  const clean = usernameOrEmail.trim();
  const { data, error } = await sb
    .from('user_profiles')
    .select('*')
    .or(`username.ilike.${clean},email.ilike.${clean}`)
    .limit(1);

  if (error || !data || data.length === 0) {
    return { matched: false };
  }

  const row = data[0];
  if (row.password && row.password === passwordAttempt) {
    return {
      matched: true,
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        role: row.role || 'driver',
        roleTitle: row.role_title || '',
        avatar: row.avatar || '👤',
        phoneNumber: row.phone_number || ''
      }
    };
  }

  return { matched: false };
}
