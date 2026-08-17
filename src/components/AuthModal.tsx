import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  ShieldCheck, 
  Check, 
  LogOut, 
  X, 
  AlertCircle, 
  ArrowRight, 
  Info,
  Layers,
  Sparkles,
  ChevronRight,
  Users,
  Settings
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { 
  getAllUsers, 
  authenticateUser, 
  getPermissionsForRole, 
  getRoleBadgeDetails,
  PRESET_USERS
} from '../utils/authManager';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onLogin: (user: AppUser) => void;
  onLogout: () => void;
  requiredPermissionNotice?: string;
  onOpenUserManagement?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  requiredPermissionNotice,
  onOpenUserManagement
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'manual' | 'roles'>('quick');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSupabaseReady = isSupabaseConfigured();
  const allUsers = getAllUsers();

  const handleQuickLogin = (user: AppUser) => {
    setLoginError(null);
    onLogin(user);
    setSuccessMessage(`Đăng nhập thành công với vai trò ${user.roleTitle}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 800);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSuccessMessage(null);

    const cleanUsername = usernameInput.trim();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername || !cleanPassword) {
      setLoginError('Vui lòng nhập đầy đủ tên đăng nhập (hoặc email) và mật khẩu.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Authenticate against local and synced database accounts
      const authResult = authenticateUser(cleanUsername, cleanPassword);

      if (authResult.success && authResult.user) {
        onLogin(authResult.user);
        setSuccessMessage(`Đăng nhập thành công: ${authResult.user.fullName} (${authResult.user.roleTitle})`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 800);
        setIsSubmitting(false);
        return;
      }

      // 2. If Supabase is configured and input looks like email, try Supabase native Auth
      if (isSupabaseReady && cleanUsername.includes('@')) {
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb.auth.signInWithPassword({
            email: cleanUsername,
            password: cleanPassword
          });

          if (!error && data.user) {
            const role = (data.user.user_metadata?.role as UserRole) || 'admin';
            const authUser: AppUser = {
              id: data.user.id,
              username: data.user.email?.split('@')[0] || 'user',
              email: data.user.email || cleanUsername,
              fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Người dùng',
              role: role,
              roleTitle: role === 'admin' ? 'Quản trị viên' : role === 'technician' ? 'Kỹ thuật viên' : 'Tài xế',
              avatar: '👤'
            };
            onLogin(authUser);
            setSuccessMessage(`Đăng nhập Supabase thành công: ${authUser.email}`);
            setTimeout(() => {
              setSuccessMessage(null);
              onClose();
            }, 800);
            setIsSubmitting(false);
            return;
          }
        }
      }

      setLoginError(authResult.message || 'Tên đăng nhập hoặc mật khẩu không chính xác. Bạn có thể chọn nhanh tài khoản tại tab "Chọn nhanh vai trò".');
    } catch (err: any) {
      setLoginError(err.message || 'Đã xảy ra lỗi khi xác thực.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRoleDetails = currentUser ? getRoleBadgeDetails(currentUser.role) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Xác thực & Phân quyền truy cập</h2>
              <p className="text-xs text-slate-400">Hệ thống phân quyền Quản lý • Kỹ thuật • Tài xế</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Required Role Notice if triggered by unauthorized action */}
        {requiredPermissionNotice && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{requiredPermissionNotice}</span>
          </div>
        )}

        {/* Current User Bar if logged in */}
        {currentUser && (
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-lg shadow-inner">
                {currentUser.avatar || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{currentUser.fullName}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentRoleDetails?.bg}`}>
                    {currentRoleDetails?.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">@{currentUser.username} • {currentUser.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser.role === 'admin' && onOpenUserManagement && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenUserManagement();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors"
                  title="Mở bảng quản lý thêm tài khoản và đổi mật khẩu"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Quản lý Tài Khoản & Mật Khẩu</span>
                </button>
              )}

              <button
                onClick={() => {
                  onLogout();
                  setSuccessMessage('Đã đăng xuất khỏi phiên làm việc.');
                  setTimeout(() => setSuccessMessage(null), 1500);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'quick'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chọn nhanh vai trò (1-Click)</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Đăng nhập Username/Password</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ma trận phân quyền</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-sm">
          {/* Status Alert Messages */}
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: QUICK 1-CLICK PRESET ROLES */}
          {activeTab === 'quick' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Chọn một tài khoản tương ứng với vai trò của bạn để kiểm thử phân quyền ngay lập tức:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {allUsers.map((user) => {
                  const isSelected = currentUser?.id === user.id;
                  const roleDet = getRoleBadgeDetails(user.role);
                  const pwdDisplay = user.password || (PRESET_USERS.find(p => p.id === user.id)?.passwordHint) || '123456';

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleQuickLogin(user)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                          {user.avatar || '👤'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{user.fullName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleDet.bg}`}>
                              {roleDet.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {roleDet.desc}
                          </p>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            username: <span className="font-semibold text-slate-700">{user.username}</span> • pass: <span className="font-semibold text-indigo-600">{pwdDisplay}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đang dùng
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>Đăng nhập</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL USERNAME & PASSWORD FORM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="ví dụ: admin, kythuat, hoặc email của bạn"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-sm transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-sm transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Danh sách tài khoản mặc định kèm mật khẩu:</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] pt-1">
                  <div>• Admin: <span className="font-bold text-slate-800">admin</span> / <span className="text-indigo-600 font-bold">admin123</span></div>
                  <div>• Kỹ thuật: <span className="font-bold text-slate-800">kythuat</span> / <span className="text-indigo-600 font-bold">tech123</span></div>
                  <div>• Lái xe: <span className="font-bold text-slate-800">taixe</span> / <span className="text-indigo-600 font-bold">driver123</span></div>
                  <div>• Khách xem: <span className="font-bold text-slate-800">khach</span> / <span className="text-indigo-600 font-bold">guest123</span></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: ROLE PERMISSION MATRIX */}
          {activeTab === 'roles' && (
            <div className="space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="p-2.5">Quyền hạn / Chức năng</th>
                      <th className="p-2.5 text-center text-indigo-700">Quản trị viên</th>
                      <th className="p-2.5 text-center text-blue-700">Kỹ thuật viên</th>
                      <th className="p-2.5 text-center text-emerald-700">Tài xế / Khách</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                    <tr>
                      <td className="p-2.5 font-medium">Thêm phương tiện mới (+ Thêm xe)</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Cập nhật ODO (Đơn lẻ & Hàng loạt)</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Ghi nhận hoàn thành bảo dưỡng</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Gia hạn Đăng kiểm & Bảo hiểm</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Cấp tài khoản & Quản lý mật khẩu</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Xóa xe / Xóa nhật ký / Reset dữ liệu</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Có</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold">✗ Khóa</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {currentUser ? `Đang đăng nhập: ${currentUser.fullName}` : 'Chưa đăng nhập (Chế độ xem mặc định)'}
          </span>
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
