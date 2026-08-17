import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Key, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  Eye, 
  EyeOff, 
  Shield, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  AlertCircle,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { 
  getAllUsers, 
  createNewUser, 
  updateUserAccount, 
  deleteUserAccount, 
  getRoleBadgeDetails 
} from '../utils/authManager';
import { isSupabaseConfigured, fetchUsersFromSupabase } from '../lib/supabase';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserUpdated?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for Create / Edit
  const [isAddMode, setIsAddMode] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('driver');
  const [newRoleTitle, setNewRoleTitle] = useState('Đội ngũ Lái xe');

  // Change Password Modal State
  const [changePasswordUser, setChangePasswordUser] = useState<AppUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  const isConnectedToSupabase = isSupabaseConfigured();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      if (isConnectedToSupabase) {
        const remote = await fetchUsersFromSupabase();
        if (remote && remote.length > 0) {
          setUsers(remote);
          return;
        }
      }
      setUsers(getAllUsers());
    } catch (e) {
      console.error(e);
      setUsers(getAllUsers());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSuccessMessage(null);
      setErrorMessage(null);
      setIsAddMode(false);
      setChangePasswordUser(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newUsername.trim() || !newFullName.trim() || !newPassword.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setErrorMessage(`Tên đăng nhập "${newUsername}" đã tồn tại. Vui lòng chọn tên khác.`);
      return;
    }

    try {
      const avatarMap: Record<UserRole, string> = {
        admin: '👨‍💼',
        technician: '🔧',
        driver: '🚗',
        viewer: '👤'
      };

      await createNewUser({
        username: newUsername.trim().toLowerCase(),
        password: newPassword.trim(),
        email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@fleetcare.vn`,
        fullName: newFullName.trim(),
        role: newRole,
        roleTitle: newRoleTitle.trim() || (newRole === 'admin' ? 'Quản trị viên' : newRole === 'technician' ? 'Kỹ thuật viên' : 'Tài xế'),
        phoneNumber: newPhone.trim() || undefined,
        avatar: avatarMap[newRole]
      });

      setSuccessMessage(`Đã tạo thành công tài khoản "${newUsername}" với mật khẩu khởi tạo.`);
      setIsAddMode(false);
      // Reset fields
      setNewFullName('');
      setNewUsername('');
      setNewPassword('');
      setNewEmail('');
      setNewPhone('');
      await loadUsers();
      onUserUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi tạo người dùng.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordUser) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPasswordInput.trim()) {
      setErrorMessage('Mật khẩu mới không được để trống.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await updateUserAccount(changePasswordUser.id, {
        password: newPasswordInput.trim()
      });

      setSuccessMessage(`Đã đổi mật khẩu thành công cho tài khoản "${changePasswordUser.username}".`);
      setChangePasswordUser(null);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      await loadUsers();
      onUserUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi cập nhật mật khẩu.');
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (user.id === currentUser?.id) {
      setErrorMessage('Không thể xóa tài khoản bạn đang sử dụng.');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}" (${user.username})?`)) {
      return;
    }

    try {
      await deleteUserAccount(user.id);
      setSuccessMessage(`Đã xóa tài khoản "${user.username}".`);
      await loadUsers();
      onUserUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xóa người dùng.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Quản lý Tài khoản & Phân quyền Mật khẩu</h2>
                <span className="bg-indigo-600 text-[11px] font-bold px-2 py-0.5 rounded text-white">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Thêm tài khoản nhân sự, phân cấp vai trò và thiết lập/đổi mật khẩu truy cập hệ thống
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

        {/* Action bar & Notifications */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Notifications */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Bar with Add Button and Supabase Sync Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Tổng số tài khoản:</span>
              <span className="px-2 py-0.5 bg-slate-100 font-bold text-slate-800 rounded text-xs border border-slate-200">
                {users.length} người dùng
              </span>
              {isConnectedToSupabase ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đồng bộ Supabase `user_profiles`
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Lưu trữ Cục bộ
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadUsers}
                disabled={isLoading}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>

              <button
                onClick={() => {
                  setIsAddMode(!isAddMode);
                  setErrorMessage(null);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {isAddMode ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{isAddMode ? 'Hủy Thêm' : '+ Thêm Tài Khoản Mới'}</span>
              </button>
            </div>
          </div>

          {/* Form Create New User */}
          {isAddMode && (
            <form onSubmit={handleCreateUser} className="bg-white p-4 sm:p-5 rounded-xl border-2 border-indigo-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  Cấp Tài Khoản Người Dùng Mới
                </h3>
                <span className="text-xs text-slate-500">Mật khẩu được lưu an toàn vào cơ sở dữ liệu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và Tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Văn An"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: hvan"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Matkhau@123"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai trò (Phân quyền) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setNewRole(r);
                      if (r === 'admin') setNewRoleTitle('Quản trị viên');
                      else if (r === 'technician') setNewRoleTitle('Kỹ thuật viên xưởng');
                      else if (r === 'driver') setNewRoleTitle('Lái xe');
                      else setNewRoleTitle('Khách xem');
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="admin">Quản trị viên (Toàn quyền)</option>
                    <option value="technician">Kỹ thuật viên (Nhập ODO, Bảo dưỡng, Sửa xe)</option>
                    <option value="driver">Lái xe (Xem lịch xe, chỉ xem)</option>
                    <option value="viewer">Khách tham quan (Chỉ xem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chức danh / Vị trí
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Trưởng xưởng bảo trì"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="0912 xxx xxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMode(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu & Cấp Tài Khoản</span>
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Tài khoản & Nhân sự</th>
                    <th className="py-3 px-3">Vai trò</th>
                    <th className="py-3 px-3">Mật khẩu</th>
                    <th className="py-3 px-3">Liên hệ</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const roleBadge = getRoleBadgeDetails(user.role);
                    const isVisible = showPasswords[user.id] || false;
                    const pwdDisplay = user.password || 'admin123';
                    const isCurrent = user.id === currentUser?.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0 p-1 bg-slate-100 rounded-lg">
                              {user.avatar || '👤'}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{user.fullName}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                                    Đang dùng
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">
                                username: <span className="font-bold text-indigo-600">{user.username}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded border ${roleBadge.bg}`}>
                            {roleBadge.label}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{user.roleTitle}</div>
                        </td>

                        <td className="py-3 px-3 font-mono">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded bg-slate-100 border border-slate-200 ${isVisible ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                              {isVisible ? pwdDisplay : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                              title={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {user.phoneNumber ? (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Chưa cập nhật</span>
                          )}
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setChangePasswordUser(user);
                                setNewPasswordInput('');
                                setConfirmPasswordInput('');
                                setErrorMessage(null);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1 transition-colors"
                              title="Đổi mật khẩu tài khoản này"
                            >
                              <Key className="w-3 h-3" />
                              <span>Đổi Pass</span>
                            </button>

                            {!isCurrent && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Change Password Sub-Dialog */}
          {changePasswordUser && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
              <form onSubmit={handleChangePassword} className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Đổi Mật Khẩu: <span className="text-indigo-600 font-mono">@{changePasswordUser.username}</span>
                    </h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setChangePasswordUser(null)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  Đang đổi mật khẩu cho nhân sự <strong>{changePasswordUser.fullName}</strong>. Mật khẩu mới sẽ có hiệu lực ngay lập tức.
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      autoFocus
                      placeholder="Nhập mật khẩu mới..."
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận lại mật khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="Gõ lại mật khẩu mới..."
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setChangePasswordUser(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Mật Khẩu Mới</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Chỉ tài khoản <strong>Quản trị viên (Admin)</strong> mới có quyền xem và đổi mật khẩu hệ thống.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
