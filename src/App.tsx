import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Gauge, 
  Layers, 
  DollarSign, 
  BookOpen, 
  Sparkles, 
  FileSpreadsheet, 
  Car, 
  ShieldCheck, 
  Wrench, 
  AlertTriangle,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  X,
  CalendarDays,
  Shield,
  FileText
} from 'lucide-react';
import { Vehicle, OdoLog, MaintenanceMilestone, ServiceRecord, AppUser, UserPermissions } from './types';
import { 
  INITIAL_VEHICLES, 
  DEMO_VEHICLES, 
  DEMO_ODO_LOGS, 
  DEMO_SERVICE_RECORDS, 
  initialOdoLogs, 
  initialServiceRecords, 
  brandConfigs 
} from './data/vehiclePresets';
import { 
  getFleetAnalytics, 
  calculateVehicleMilestones, 
  calculateRollingDailyKm, 
  formatVND 
} from './utils/maintenanceEngine';
import { 
  getStoredUser, 
  saveStoredUser, 
  getPermissionsForRole 
} from './utils/authManager';
import { 
  isSupabaseConfigured,
  fetchVehiclesFromSupabase,
  upsertVehicleToSupabase,
  deleteVehicleFromSupabase,
  fetchOdoLogsFromSupabase,
  insertOdoLogToSupabase,
  deleteOdoLogFromSupabase,
  fetchServiceRecordsFromSupabase,
  insertServiceRecordToSupabase,
  deleteServiceRecordFromSupabase
} from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { FleetOverviewBanner } from './components/FleetOverviewBanner';
import { FleetTableView } from './components/FleetTableView';
import { VehicleCard } from './components/VehicleCard';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { OdoUpdateModal } from './components/OdoUpdateModal';
import { FleetBudgetView } from './components/FleetBudgetView';
import { ExportReportModal } from './components/ExportReportModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { AiFleetAdvisorModal } from './components/AiFleetAdvisorModal';
import { ChecklistViewer } from './components/ChecklistViewer';
import { FleetCalendarView } from './components/FleetCalendarView';
import { ComplianceManagerView } from './components/ComplianceManagerView';
import { FleetSpecsTableView } from './components/FleetSpecsTableView';
import { UpdateComplianceModal } from './components/UpdateComplianceModal';
import { EditVehicleModal } from './components/EditVehicleModal';
import { CompleteServiceModal } from './components/CompleteServiceModal';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { AuthModal } from './components/AuthModal';
import { UserManagementModal } from './components/UserManagementModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  // Local storage persistence
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved vehicles', e);
      }
    }
    return INITIAL_VEHICLES;
  });

  const [logs, setLogs] = useState<OdoLog[]>(() => {
    const saved = localStorage.getItem('fleet_odo_logs_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved logs', e);
      }
    }
    return initialOdoLogs;
  });

  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>(() => {
    const saved = localStorage.getItem('fleet_service_records_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved service records', e);
      }
    }
    return initialServiceRecords;
  });

  // Fetch initial data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    async function loadSupabaseData() {
      try {
        const [remoteVehicles, remoteLogs, remoteRecords] = await Promise.all([
          fetchVehiclesFromSupabase(),
          fetchOdoLogsFromSupabase(),
          fetchServiceRecordsFromSupabase()
        ]);
        if (isMounted) {
          if (remoteVehicles && remoteVehicles.length > 0) {
            setVehicles(remoteVehicles);
          }
          if (remoteLogs && remoteLogs.length > 0) {
            setLogs(remoteLogs);
          }
          if (remoteRecords && remoteRecords.length > 0) {
            setServiceRecords(remoteRecords);
          }
        }
      } catch (err) {
        console.error('Error syncing with Supabase:', err);
      }
    }
    loadSupabaseData();
    return () => { isMounted = false; };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('fleet_vehicles_v2', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('fleet_odo_logs_v2', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('fleet_service_records_v2', JSON.stringify(serviceRecords));
  }, [serviceRecords]);

  // Main Navigation State
  const [currentTab, setCurrentTab] = useState<'fleet' | 'calendar' | 'compliance' | 'specs' | 'budget' | 'manuals'>('fleet');
  const [selectedBrand, setSelectedBrand] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'safe'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isOdoModalOpen, setIsOdoModalOpen] = useState<boolean>(false);
  const [targetOdoVehicleId, setTargetOdoVehicleId] = useState<string | undefined>(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailVehicle, setSelectedDetailVehicle] = useState<Vehicle | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<string>('milestones');

  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState<boolean>(false);
  const [selectedComplianceVehicle, setSelectedComplianceVehicle] = useState<Vehicle | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState<boolean>(false);
  const [isAiFleetAdvisorOpen, setIsAiFleetAdvisorOpen] = useState<boolean>(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState<boolean>(false);
  const [selectedEditVehicle, setSelectedEditVehicle] = useState<Vehicle | null>(null);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);

  // Authentication & Access Control (RBAC) State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);

  const permissions = useMemo(() => {
    return currentUser ? getPermissionsForRole(currentUser.role) : getPermissionsForRole('viewer');
  }, [currentUser]);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    saveStoredUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
  };

  const requirePermission = (permissionKey: keyof UserPermissions, actionName: string, actionFn: () => void) => {
    if (!permissions[permissionKey]) {
      const requiredRole = (permissionKey === 'canAddVehicle' || permissionKey === 'canDeleteVehicle' || permissionKey === 'canManageDatabase' || permissionKey === 'canResetData')
        ? 'Quản trị viên (Admin)'
        : 'Quản trị viên hoặc Kỹ thuật viên';
      setAuthNotice(`Chức năng "${actionName}" bị khóa do tài khoản hiện tại không có quyền thực hiện. Vui lòng đăng nhập với quyền ${requiredRole}.`);
      setIsAuthModalOpen(true);
      return;
    }
    actionFn();
  };

  // Complete Maintenance Record Modal State
  const [isCompleteServiceModalOpen, setIsCompleteServiceModalOpen] = useState<boolean>(false);
  const [completeServiceVehicle, setCompleteServiceVehicle] = useState<Vehicle | null>(null);
  const [completeServiceMilestone, setCompleteServiceMilestone] = useState<MaintenanceMilestone | null>(null);

  // Manuals tab selected vehicle
  const [manualSelectedVehicleId, setManualSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'veh_01');

  // Recalculate fleet analytics dynamically
  const analytics = useMemo(() => {
    return getFleetAnalytics(vehicles, logs);
  }, [vehicles, logs]);

  // Map of vehicle ID -> Milestones
  const vehicleMilestonesMap = useMemo(() => {
    const map: Record<string, MaintenanceMilestone[]> = {};
    vehicles.forEach((v) => {
      map[v.id] = calculateVehicleMilestones(v, logs, 12);
    });
    return map;
  }, [vehicles, logs]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedBrand !== 'Tất cả' && v.brand !== selectedBrand) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = v.code.toLowerCase().includes(q);
        const matchName = v.name.toLowerCase().includes(q);
        const matchPlate = v.licensePlate.toLowerCase().includes(q);
        const matchBrand = v.brand.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchPlate && !matchBrand) {
          return false;
        }
      }
      if (statusFilter === 'due') {
        const milestones = vehicleMilestonesMap[v.id];
        const next = milestones?.[0];
        if (next && next.urgencyLevel !== 'urgent' && next.urgencyLevel !== 'due_soon' && next.urgencyLevel !== 'overdue') {
          return false;
        }
      } else if (statusFilter === 'safe') {
        const milestones = vehicleMilestonesMap[v.id];
        const next = milestones?.[0];
        if (next && next.urgencyLevel !== 'normal') {
          return false;
        }
      }
      return true;
    });
  }, [vehicles, selectedBrand, searchQuery, statusFilter, vehicleMilestonesMap]);

  // Handlers
  const handleSaveSingleOdo = (vehicleId: string, newOdo: number, date: string, note?: string) => {
    const targetVeh = vehicles.find((v) => v.id === vehicleId);
    if (!targetVeh) return;

    const delta = Math.max(0, newOdo - targetVeh.currentOdo);
    const newLog: OdoLog = {
      id: `log_${Date.now()}`,
      vehicleId,
      date,
      odo: newOdo,
      deltaKm: delta,
      note: note || 'Cập nhật định kỳ',
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    const vehicleLogs = updatedLogs.filter((l) => l.vehicleId === vehicleId);
    const newDailyRate = calculateRollingDailyKm(vehicleLogs, targetVeh.averageKmPerDay);

    const updatedVehicles = vehicles.map((v) => {
      if (v.id === vehicleId) {
        return {
          ...v,
          currentOdo: newOdo,
          averageKmPerDay: newDailyRate,
        };
      }
      return v;
    });
    setVehicles(updatedVehicles);

    if (selectedDetailVehicle && selectedDetailVehicle.id === vehicleId) {
      setSelectedDetailVehicle({
        ...selectedDetailVehicle,
        currentOdo: newOdo,
        averageKmPerDay: newDailyRate,
      });
    }

    // Async sync to Supabase if configured
    if (isSupabaseConfigured()) {
      insertOdoLogToSupabase(newLog).catch(console.error);
      const updatedTarget = updatedVehicles.find((v) => v.id === vehicleId);
      if (updatedTarget) upsertVehicleToSupabase(updatedTarget).catch(console.error);
    }
  };

  const handleSaveBulkOdo = (updates: { vehicleId: string; newOdo: number; date: string; note?: string }[]) => {
    const newLogs: OdoLog[] = [];
    const updatedVehicles = vehicles.map((v) => {
      const u = updates.find((item) => item.vehicleId === v.id);
      if (u && u.newOdo > 0) {
        const delta = Math.max(0, u.newOdo - v.currentOdo);
        const logItem: OdoLog = {
          id: `log_${Date.now()}_${v.id}`,
          vehicleId: v.id,
          date: u.date,
          odo: u.newOdo,
          deltaKm: delta,
          note: u.note || 'Cập nhật hàng loạt',
        };
        newLogs.push(logItem);
        if (isSupabaseConfigured()) {
          insertOdoLogToSupabase(logItem).catch(console.error);
        }
        return {
          ...v,
          currentOdo: u.newOdo,
        };
      }
      return v;
    });

    const combinedLogs = [...newLogs, ...logs];
    setLogs(combinedLogs);
    setVehicles(updatedVehicles);

    if (isSupabaseConfigured()) {
      updatedVehicles.forEach(v => upsertVehicleToSupabase(v).catch(console.error));
    }
  };

  const handleSaveCompliance = (vehicleId: string, updates: Partial<Vehicle>) => {
    const updatedVehicles = vehicles.map((v) => {
      if (v.id === vehicleId) {
        const updated = {
          ...v,
          ...updates,
        };
        if (isSupabaseConfigured()) {
          upsertVehicleToSupabase(updated).catch(console.error);
        }
        return updated;
      }
      return v;
    });
    setVehicles(updatedVehicles);

    if (selectedDetailVehicle && selectedDetailVehicle.id === vehicleId) {
      setSelectedDetailVehicle({
        ...selectedDetailVehicle,
        ...updates,
      });
    }
  };

  const handleDeleteLog = (logId: string) => {
    requirePermission('canInputOdo', 'Xóa nhật ký ODO', () => {
      const targetLog = logs.find(l => l.id === logId);
      const updatedLogs = logs.filter((l) => l.id !== logId);
      setLogs(updatedLogs);
      
      if (isSupabaseConfigured()) {
        deleteOdoLogFromSupabase(logId).catch(console.error);
      }

      if (targetLog) {
        // Re-calculate the vehicle's currentOdo from the remaining logs
        const vehicleRemainingLogs = updatedLogs
          .filter(l => l.vehicleId === targetLog.vehicleId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.odo - a.odo);

        const currentVeh = vehicles.find(v => v.id === targetLog.vehicleId);
        if (currentVeh) {
          const restoredOdo = vehicleRemainingLogs.length > 0
            ? vehicleRemainingLogs[0].odo
            : (currentVeh.initialOdo || currentVeh.lastServiceOdo || 0);

          const updatedVehicles = vehicles.map(v => 
            v.id === targetLog.vehicleId ? { ...v, currentOdo: restoredOdo } : v
          );
          setVehicles(updatedVehicles);

          if (selectedDetailVehicle && selectedDetailVehicle.id === targetLog.vehicleId) {
            setSelectedDetailVehicle({
              ...selectedDetailVehicle,
              currentOdo: restoredOdo
            });
          }

          if (isSupabaseConfigured()) {
            const updatedVeh = updatedVehicles.find(v => v.id === targetLog.vehicleId);
            if (updatedVeh) upsertVehicleToSupabase(updatedVeh).catch(console.error);
          }
        }
      }
    });
  };

  const handleOpenCompleteServiceModal = (vehicle: Vehicle, milestone?: MaintenanceMilestone) => {
    requirePermission('canCompleteService', 'Ghi nhận hoàn tất bảo dưỡng', () => {
      setCompleteServiceVehicle(vehicle);
      setCompleteServiceMilestone(milestone || null);
      setIsCompleteServiceModalOpen(true);
    });
  };

  const handleSaveServiceRecord = (recordData: Omit<ServiceRecord, 'id'>, newOdo?: number) => {
    const newRecord: ServiceRecord = {
      ...recordData,
      id: `srv_${Date.now()}`
    };

    // Prepend to service records
    const updatedServiceRecords = [newRecord, ...serviceRecords];
    setServiceRecords(updatedServiceRecords);

    if (isSupabaseConfigured()) {
      insertServiceRecordToSupabase(newRecord).catch(console.error);
    }

    // Update vehicle's lastService fields and currentOdo (if requested)
    const targetVeh = vehicles.find(v => v.id === recordData.vehicleId);
    if (targetVeh) {
      const effectiveOdo = newOdo && newOdo > targetVeh.currentOdo ? newOdo : targetVeh.currentOdo;
      
      // If newOdo is provided, also add an OdoLog entry
      if (newOdo && newOdo > targetVeh.currentOdo) {
        const delta = Math.max(0, newOdo - targetVeh.currentOdo);
        const newLog: OdoLog = {
          id: `log_srv_${Date.now()}`,
          vehicleId: targetVeh.id,
          date: recordData.date,
          odo: newOdo,
          deltaKm: delta,
          note: `Ghi nhận ODO tại xưởng: ${recordData.tierName} (${recordData.garageName})`
        };
        setLogs(prev => [newLog, ...prev]);
        if (isSupabaseConfigured()) {
          insertOdoLogToSupabase(newLog).catch(console.error);
        }
      }

      const updatedVehicles = vehicles.map(v => {
        if (v.id === recordData.vehicleId) {
          const updated = {
            ...v,
            lastServiceOdo: recordData.odo,
            lastServiceDate: recordData.date,
            lastServiceTier: recordData.tierName,
            currentOdo: effectiveOdo,
            status: 'active' as const
          };
          if (isSupabaseConfigured()) {
            upsertVehicleToSupabase(updated).catch(console.error);
          }
          return updated;
        }
        return v;
      });

      setVehicles(updatedVehicles);

      if (selectedDetailVehicle && selectedDetailVehicle.id === recordData.vehicleId) {
        setSelectedDetailVehicle({
          ...selectedDetailVehicle,
          lastServiceOdo: recordData.odo,
          lastServiceDate: recordData.date,
          lastServiceTier: recordData.tierName,
          currentOdo: effectiveOdo,
          status: 'active'
        });
      }
    }
  };

  const handleDeleteServiceRecord = (recordId: string) => {
    requirePermission('canCompleteService', 'Xóa phiếu lịch sử bảo dưỡng', () => {
      setServiceRecords(prev => prev.filter(r => r.id !== recordId));
      if (isSupabaseConfigured()) {
        deleteServiceRecordFromSupabase(recordId).catch(console.error);
      }
    });
  };

  const handleLoadDemoData = () => {
    setVehicles(DEMO_VEHICLES);
    setLogs(DEMO_ODO_LOGS);
    setServiceRecords(DEMO_SERVICE_RECORDS);
    localStorage.setItem('fleet_vehicles_v2', JSON.stringify(DEMO_VEHICLES));
    localStorage.setItem('fleet_odo_logs_v2', JSON.stringify(DEMO_ODO_LOGS));
    localStorage.setItem('fleet_service_records_v2', JSON.stringify(DEMO_SERVICE_RECORDS));

    if (isSupabaseConfigured()) {
      DEMO_VEHICLES.forEach(v => upsertVehicleToSupabase(v).catch(console.error));
      DEMO_ODO_LOGS.forEach(l => insertOdoLogToSupabase(l).catch(console.error));
      DEMO_SERVICE_RECORDS.forEach(r => insertServiceRecordToSupabase(r).catch(console.error));
    }
  };

  const handleClearAllData = () => {
    requirePermission('canResetData', 'Xóa toàn bộ dữ liệu', () => {
      setVehicles([]);
      setLogs([]);
      setServiceRecords([]);
      localStorage.setItem('fleet_vehicles_v2', JSON.stringify([]));
      localStorage.setItem('fleet_odo_logs_v2', JSON.stringify([]));
      localStorage.setItem('fleet_service_records_v2', JSON.stringify([]));
    });
  };

  const handleResetDefaultData = () => {
    requirePermission('canManageDatabase', 'Cấu hình Database & Nạp dữ liệu', () => {
      setIsDatabaseModalOpen(true);
    });
  };

  const handleOpenDetailModal = (vehicle: Vehicle, initialTab: string = 'milestones') => {
    setSelectedDetailVehicle(vehicle);
    setDetailInitialTab(initialTab);
    setIsDetailModalOpen(true);
  };

  const handleOpenComplianceModal = (vehicle: Vehicle) => {
    requirePermission('canUpdateCompliance', 'Gia hạn Đăng kiểm & Bảo hiểm', () => {
      setSelectedComplianceVehicle(vehicle);
      setIsComplianceModalOpen(true);
    });
  };

  const handleOpenEditVehicleModal = (vehicle: Vehicle) => {
    requirePermission('canEditVehicle', 'Chỉnh sửa thông số xe', () => {
      setSelectedEditVehicle(vehicle);
      setIsEditVehicleModalOpen(true);
    });
  };

  const handleSaveVehicle = (updatedVehicle: Vehicle) => {
    const updatedVehicles = vehicles.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v));
    setVehicles(updatedVehicles);

    if (selectedDetailVehicle && selectedDetailVehicle.id === updatedVehicle.id) {
      setSelectedDetailVehicle(updatedVehicle);
    }

    if (isSupabaseConfigured()) {
      upsertVehicleToSupabase(updatedVehicle).catch(console.error);
    }
  };

  const handleAddVehicle = (newVeh: Vehicle) => {
    requirePermission('canAddVehicle', 'Thêm phương tiện mới', () => {
      const updated = [...vehicles, newVeh];
      setVehicles(updated);
      if (isSupabaseConfigured()) {
        upsertVehicleToSupabase(newVeh).catch(console.error);
      }
    });
  };

  const handleOpenOdoModal = (vehicle?: Vehicle) => {
    requirePermission('canInputOdo', 'Cập nhật chỉ số ODO', () => {
      setTargetOdoVehicleId(vehicle ? vehicle.id : undefined);
      setIsOdoModalOpen(true);
    });
  };

  const handleOpenAddVehicleModal = () => {
    requirePermission('canAddVehicle', 'Thêm phương tiện mới', () => {
      setIsAddVehicleModalOpen(true);
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden">
      
      {/* Desktop Left Sidebar (#0F172A) */}
      <div className="hidden md:flex flex-col h-full">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onOpenOdoModal={() => handleOpenOdoModal()}
          onOpenAddVehicleModal={handleOpenAddVehicleModal}
          onOpenAiAdvisor={() => setIsAiFleetAdvisorOpen(true)}
          onOpenExportReport={() => setIsExportModalOpen(true)}
          onResetData={handleResetDefaultData}
          onOpenDatabaseModal={() => requirePermission('canManageDatabase', 'Cơ sở dữ liệu', () => setIsDatabaseModalOpen(true))}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setAuthNotice(undefined);
            setIsAuthModalOpen(true);
          }}
          onOpenUserManagement={() => setIsUserManagementModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full max-h-screen bg-[#0F172A] z-10 shadow-2xl overflow-hidden animate-in slide-in-from-left duration-200">
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onOpenOdoModal={() => {
                setIsMobileMenuOpen(false);
                handleOpenOdoModal();
              }}
              onOpenAddVehicleModal={() => {
                setIsMobileMenuOpen(false);
                handleOpenAddVehicleModal();
              }}
              onOpenAiAdvisor={() => {
                setIsMobileMenuOpen(false);
                setIsAiFleetAdvisorOpen(true);
              }}
              onOpenExportReport={() => {
                setIsMobileMenuOpen(false);
                setIsExportModalOpen(true);
              }}
              onResetData={() => {
                setIsMobileMenuOpen(false);
                handleResetDefaultData();
              }}
              onOpenDatabaseModal={() => {
                setIsMobileMenuOpen(false);
                requirePermission('canManageDatabase', 'Cơ sở dữ liệu', () => setIsDatabaseModalOpen(true));
              }}
              currentUser={currentUser}
              onOpenAuthModal={() => {
                setIsMobileMenuOpen(false);
                setAuthNotice(undefined);
                setIsAuthModalOpen(true);
              }}
              onOpenUserManagement={() => {
                setIsMobileMenuOpen(false);
                setIsUserManagementModalOpen(true);
              }}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenOdoModal={() => handleOpenOdoModal()}
          onOpenAddVehicleModal={handleOpenAddVehicleModal}
          onOpenAiAdvisor={() => setIsAiFleetAdvisorOpen(true)}
          onOpenExportReport={() => setIsExportModalOpen(true)}
          onResetData={handleResetDefaultData}
          onOpenDatabaseModal={() => requirePermission('canManageDatabase', 'Cơ sở dữ liệu', () => setIsDatabaseModalOpen(true))}
          vehiclesCount={vehicles.length}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setAuthNotice(undefined);
            setIsAuthModalOpen(true);
          }}
          onOpenUserManagement={() => setIsUserManagementModalOpen(true)}
        />

        {/* Scrollable Main Content Section */}
        <section className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto pb-24 md:pb-6">
          
          {/* TAB 1: FLEET OVERVIEW */}
          {currentTab === 'fleet' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* 4-KPI Grid and Filter Bar */}
              <FleetOverviewBanner
                analytics={analytics}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              {/* View Mode Toggle Header */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hiển thị {filteredVehicles.length} phương tiện trong đội
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                      viewMode === 'table'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Dạng Bảng</span>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                      viewMode === 'cards'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Dạng Thẻ</span>
                  </button>
                </div>
              </div>

              {/* Primary Table or Card Grid View */}
              {filteredVehicles.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                  <Car className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 text-sm">
                    Không tìm thấy xe nào khớp với bộ lọc
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Vui lòng xóa bộ lọc để hiển thị toàn bộ 6 phương tiện trong đội xe.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedBrand('Tất cả');
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : viewMode === 'table' ? (
                <FleetTableView
                  vehicles={filteredVehicles}
                  vehicleMilestonesMap={vehicleMilestonesMap}
                  onOpenDetail={(v, tab) => handleOpenDetailModal(v, tab)}
                  onOpenOdoUpdate={(v) => handleOpenOdoModal(v)}
                  onOpenAiConsult={(v) => handleOpenDetailModal(v, 'ai_consult')}
                  onOpenEditVehicle={(v) => handleOpenEditVehicleModal(v)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVehicles.map((vehicle) => {
                    const milestones = vehicleMilestonesMap[vehicle.id] || [];
                    return (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        milestones={milestones}
                        onOpenDetail={(v, tab) => handleOpenDetailModal(v, tab)}
                        onOpenOdoUpdate={(v) => handleOpenOdoModal(v)}
                        onOpenAiConsult={(v) => handleOpenDetailModal(v, 'ai_consult')}
                        onOpenEditVehicle={(v) => handleOpenEditVehicleModal(v)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Professional Polish Bottom 2-Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Banner 1: Navy Brand Discovery Card */}
                <div className="bg-blue-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-white">Khám phá chi tiết hãng</h3>
                    <p className="text-blue-200 text-xs mt-1 max-w-md">
                      Dữ liệu được trích xuất từ tài liệu hướng dẫn sử dụng Mercedes-Benz, Ford, Kia và Hyundai chính hãng.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('manuals')}
                    className="bg-white text-blue-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-xs shrink-0"
                  >
                    Xem Tài Liệu
                  </button>
                </div>

                {/* Banner 2: Alert Insight Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800">
                      Cảnh báo: Tần suất vận hành
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {analytics.overdueCount > 0 
                        ? `Đội xe có ${analytics.overdueCount} phương tiện đã quá hạn ODO. Cần lên lịch bảo dưỡng khẩn cấp.`
                        : `CAR02 (GLS450) & CAR04 (Transit) đang có cường độ chạy cao nhất. Hệ thống tự động tính toán lại ngày tới hạn.`
                      }
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CALENDAR VIEW (MONTH / YEAR) */}
          {currentTab === 'calendar' && (
            <div className="animate-in fade-in duration-200">
              <FleetCalendarView
                vehicles={vehicles}
                onOpenVehicleDetail={(v) => handleOpenDetailModal(v, 'milestones')}
                onOpenComplianceModal={(v) => handleOpenComplianceModal(v)}
                onOpenOdoModal={(v) => handleOpenOdoModal(v)}
              />
            </div>
          )}

          {/* TAB 3: COMPLIANCE MANAGER VIEW (ĐĂNG KIỂM & BẢO HIỂM) */}
          {currentTab === 'compliance' && (
            <div className="animate-in fade-in duration-200">
              <ComplianceManagerView
                vehicles={vehicles}
                onOpenUpdateModal={(v) => handleOpenComplianceModal(v)}
                onOpenVehicleDetail={(v) => handleOpenDetailModal(v, 'compliance')}
                onOpenEditVehicle={(v) => handleOpenEditVehicleModal(v)}
              />
            </div>
          )}

          {/* TAB 4: FLEET TECHNICAL SPECS & ADMIN SHEET */}
          {currentTab === 'specs' && (
            <div className="animate-in fade-in duration-200">
              <FleetSpecsTableView
                vehicles={vehicles}
                onOpenDetail={(v) => handleOpenDetailModal(v, 'milestones')}
                onOpenOdoUpdate={(v) => handleOpenOdoModal(v)}
                onOpenComplianceUpdate={(v) => handleOpenComplianceModal(v)}
                onOpenEditVehicle={(v) => handleOpenEditVehicleModal(v)}
              />
            </div>
          )}

          {/* TAB 5: BUDGET & COST FORECASTING VIEW */}
          {currentTab === 'budget' && (
            <div className="animate-in fade-in duration-200">
              <FleetBudgetView
                vehicles={vehicles}
                logs={logs}
                serviceRecords={serviceRecords}
                onOpenVehicleDetail={(v, tab) => handleOpenDetailModal(v, tab || 'milestones')}
                onOpenExportReport={() => setIsExportModalOpen(true)}
                onOpenCompleteModal={(v, milestone) => handleOpenCompleteServiceModal(v, milestone)}
                onDeleteServiceRecord={handleDeleteServiceRecord}
              />
            </div>
          )}

          {/* TAB 6: BRAND MANUALS & CHECKLIST EXPLORER */}
          {currentTab === 'manuals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-6 bg-[#0F172A] text-white rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Thư Viện Sổ Tay Bảo Dưỡng Kỹ Thuật Chính Hãng
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Tra cứu toàn bộ danh mục phụ tùng, dầu nhớt và hạng mục kiểm tra theo tiêu chuẩn đại lý cho từng dòng xe trong đội.
                    </p>
                  </div>
                </div>

                {/* Vehicle selector buttons */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setManualSelectedVehicleId(v.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                        manualSelectedVehicleId === v.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-mono font-bold mr-1.5">{v.code}</span>
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist Viewer for Selected Car */}
              {(() => {
                const selectedVeh = vehicles.find((v) => v.id === manualSelectedVehicleId) || vehicles[0];
                if (!selectedVeh) return null;
                return <ChecklistViewer vehicle={selectedVeh} />;
              })()}

            </div>
          )}

        </section>

      </main>

      {/* Modals */}
      <OdoUpdateModal
        isOpen={isOdoModalOpen}
        onClose={() => setIsOdoModalOpen(false)}
        vehicles={vehicles}
        selectedVehicleId={targetOdoVehicleId}
        onSaveOdo={handleSaveSingleOdo}
        onSaveBulkOdo={handleSaveBulkOdo}
      />

      <VehicleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        vehicle={selectedDetailVehicle}
        milestones={selectedDetailVehicle ? vehicleMilestonesMap[selectedDetailVehicle.id] || [] : []}
        logs={logs}
        serviceRecords={serviceRecords}
        initialTab={detailInitialTab}
        onOpenOdoModal={(v) => {
          setIsDetailModalOpen(false);
          handleOpenOdoModal(v);
        }}
        onDeleteLog={handleDeleteLog}
        onOpenComplianceModal={(v) => {
          setIsDetailModalOpen(false);
          handleOpenComplianceModal(v);
        }}
        onOpenEditVehicle={(v) => {
          setIsDetailModalOpen(false);
          handleOpenEditVehicleModal(v);
        }}
        onOpenCompleteServiceModal={(v, milestone) => {
          setIsDetailModalOpen(false);
          handleOpenCompleteServiceModal(v, milestone);
        }}
        onDeleteServiceRecord={handleDeleteServiceRecord}
      />

      <CompleteServiceModal
        isOpen={isCompleteServiceModalOpen}
        onClose={() => setIsCompleteServiceModalOpen(false)}
        vehicle={completeServiceVehicle}
        milestone={completeServiceMilestone}
        onSaveServiceRecord={handleSaveServiceRecord}
      />

      <EditVehicleModal
        isOpen={isEditVehicleModalOpen}
        onClose={() => setIsEditVehicleModalOpen(false)}
        vehicle={selectedEditVehicle}
        onSaveVehicle={handleSaveVehicle}
      />

      <UpdateComplianceModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        vehicle={selectedComplianceVehicle}
        onSaveCompliance={handleSaveCompliance}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        vehicles={vehicles}
        logs={logs}
      />

      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onAddVehicle={handleAddVehicle}
      />

      <AiFleetAdvisorModal
        isOpen={isAiFleetAdvisorOpen}
        onClose={() => setIsAiFleetAdvisorOpen(false)}
        vehicles={vehicles}
      />

      <DatabaseConfigModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onLoadDemoData={handleLoadDemoData}
        onClearAllData={handleClearAllData}
        totalVehiclesCount={vehicles.length}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthNotice(undefined);
        }}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        requiredPermissionNotice={authNotice}
        onOpenUserManagement={() => setIsUserManagementModalOpen(true)}
      />

      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={() => {
          const fresh = getStoredUser();
          setCurrentUser(fresh);
        }}
      />

      {/* Mobile Floating Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenOdoModal={() => handleOpenOdoModal()}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        currentUser={currentUser}
      />

    </div>
  );
}

