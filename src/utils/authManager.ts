import { AppUser, UserRole, UserPermissions } from '../types';
import { 
  getSupabaseClient, 
  isSupabaseConfigured, 
  fetchUsersFromSupabase, 
  upsertUserToSupabase, 
  deleteUserFromSupabase 
} from '../lib/supabase';

export const PRESET_USERS: (AppUser & { passwordHint: string })[] = [
  {
    id: 'user_admin_01',
    username: 'admin',
    password: 'admin123',
    email: 'admin@fleetcare.vn',
    fullName: 'Nguyễn Văn Quản Trị',
    role: 'admin',
    roleTitle: 'Giám đốc Đội xe / Quản trị viên',
    avatar: '👨‍💼',
    phoneNumber: '0901 888 999',
    passwordHint: 'admin123'
  },
  {
    id: 'user_tech_01',
    username: 'kythuat',
    password: 'tech123',
    email: 'kythuat@fleetcare.vn',
    fullName: 'Trần Văn Kỹ Thuật',
    role: 'technician',
    roleTitle: 'Xưởng trưởng / Kỹ thuật viên',
    avatar: '🔧',
    phoneNumber: '0912 345 678',
    passwordHint: 'tech123'
  },
  {
    id: 'user_driver_01',
    username: 'taixe',
    password: 'driver123',
    email: 'taixe@fleetcare.vn',
    fullName: 'Lê Hoàng Tài Xế',
    role: 'driver',
    roleTitle: 'Đội trưởng Lái xe',
    avatar: '🚗',
    assignedVehicleId: 'veh_01',
    phoneNumber: '0988 776 655',
    passwordHint: 'driver123'
  },
  {
    id: 'user_viewer_01',
    username: 'khach',
    password: 'guest123',
    email: 'khach@fleetcare.vn',
    fullName: 'Khách tham quan',
    role: 'viewer',
    roleTitle: 'Khách (Chỉ xem)',
    avatar: '👤',
    phoneNumber: '0900 000 000',
    passwordHint: 'guest123'
  }
];

export function getPermissionsForRole(role: UserRole): UserPermissions {
  switch (role) {
    case 'admin':
      return {
        canAddVehicle: true,
        canEditVehicle: true,
        canDeleteVehicle: true,
        canInputOdo: true,
        canCompleteService: true,
        canUpdateCompliance: true,
        canExportReports: true,
        canManageDatabase: true,
        canResetData: true,
        isReadOnly: false
      };
    case 'technician':
      return {
        canAddVehicle: false,
        canEditVehicle: true,
        canDeleteVehicle: false,
        canInputOdo: true,
        canCompleteService: true,
        canUpdateCompliance: true,
        canExportReports: true,
        canManageDatabase: false,
        canResetData: false,
        isReadOnly: false
      };
    case 'driver':
    case 'viewer':
    default:
      return {
        canAddVehicle: false,
        canEditVehicle: false,
        canDeleteVehicle: false,
        canInputOdo: false,
        canCompleteService: false,
        canUpdateCompliance: false,
        canExportReports: true,
        canManageDatabase: false,
        canResetData: false,
        isReadOnly: true
      };
  }
}

const AUTH_STORAGE_KEY = 'fleet_current_user_v2';
const USERS_LIST_STORAGE_KEY = 'fleet_user_accounts_v2';

export function getAllUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_LIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(PRESET_USERS));
      return PRESET_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(PRESET_USERS));
      return PRESET_USERS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading stored users list:', err);
    return PRESET_USERS;
  }
}

export function saveAllUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users list:', err);
  }
}

export function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      // Default to first user (Admin) for seamless experience
      const all = getAllUsers();
      const admin = all.find(u => u.role === 'admin') || all[0];
      return admin;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading stored user:', err);
    return PRESET_USERS[0];
  }
}

export function saveStoredUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving user session:', err);
  }
}

export function authenticateUser(usernameOrEmail: string, passwordAttempt: string): { success: boolean; user?: AppUser; message?: string } {
  const users = getAllUsers();
  const cleanInput = usernameOrEmail.trim().toLowerCase();
  
  const found = users.find(u => 
    u.username.toLowerCase() === cleanInput || 
    u.email.toLowerCase() === cleanInput
  );

  if (!found) {
    return { success: false, message: 'Tên đăng nhập hoặc email không tồn tại trong hệ thống.' };
  }

  // Check password
  const expectedPassword = found.password || (PRESET_USERS.find(p => p.id === found.id)?.passwordHint) || '123456';
  
  if (passwordAttempt !== expectedPassword) {
    return { success: false, message: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
  }

  return { success: true, user: found };
}

export async function createNewUser(userData: Omit<AppUser, 'id'> & { password: string }): Promise<AppUser> {
  const users = getAllUsers();
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const newUser: AppUser = {
    ...userData,
    id: newId
  };

  const updatedUsers = [...users, newUser];
  saveAllUsers(updatedUsers);

  if (isSupabaseConfigured()) {
    try {
      await upsertUserToSupabase(newUser);
    } catch (e) {
      console.warn('Could not sync user to Supabase:', e);
    }
  }

  return newUser;
}

export async function updateUserAccount(userId: string, updates: Partial<AppUser>): Promise<AppUser | null> {
  const users = getAllUsers();
  let updatedUser: AppUser | null = null;

  const newUsers = users.map(u => {
    if (u.id === userId) {
      updatedUser = { ...u, ...updates };
      return updatedUser;
    }
    return u;
  });

  if (updatedUser) {
    saveAllUsers(newUsers);

    // Update current session if the updated user is logged in
    const current = getStoredUser();
    if (current && current.id === userId) {
      saveStoredUser(updatedUser);
    }

    if (isSupabaseConfigured()) {
      try {
        await upsertUserToSupabase(updatedUser);
      } catch (e) {
        console.warn('Could not sync user update to Supabase:', e);
      }
    }
  }

  return updatedUser;
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  const users = getAllUsers();
  const current = getStoredUser();
  if (current && current.id === userId) {
    throw new Error('Không thể xóa tài khoản bạn đang đăng nhập.');
  }

  const newUsers = users.filter(u => u.id !== userId);
  saveAllUsers(newUsers);

  if (isSupabaseConfigured()) {
    try {
      await deleteUserFromSupabase(userId);
    } catch (e) {
      console.warn('Could not delete user from Supabase:', e);
    }
  }

  return true;
}

export function getRoleBadgeDetails(role: UserRole) {
  switch (role) {
    case 'admin':
      return {
        label: 'Quản trị viên',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        badge: 'bg-indigo-600 text-white',
        desc: 'Toàn quyền tạo xe, xóa xe, ghi ODO, bảo dưỡng, quản lý user & DB'
      };
    case 'technician':
      return {
        label: 'Kỹ thuật viên',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        badge: 'bg-blue-600 text-white',
        desc: 'Quyền nhập ODO, ghi nhận bảo dưỡng, sửa hồ sơ xe (không xóa xe)'
      };
    case 'driver':
      return {
        label: 'Tài xế',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-600 text-white',
        desc: 'Xem lịch bảo dưỡng, sổ đăng kiểm & bảo hiểm, tra cứu HDSD'
      };
    case 'viewer':
    default:
      return {
        label: 'Chỉ xem',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        badge: 'bg-slate-600 text-white',
        desc: 'Chỉ xem tổng quan báo cáo và thông tin xe'
      };
  }
}
