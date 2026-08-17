import { Vehicle, OdoLog, MaintenanceMilestone, ServiceTier } from '../types';
import { BRAND_CONFIGS } from '../data/vehiclePresets';

/**
 * Format currency in VNĐ (e.g. 15.400.000 đ)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate dynamic rolling average daily km from OdoLog entries
 */
export function calculateRollingDailyKm(logs: OdoLog[], defaultRate: number = 45): number {
  if (!logs || logs.length === 0) return defaultRate;

  // Sort logs ascending by date
  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sorted.length === 1) {
    return sorted[0].deltaKm > 0 ? sorted[0].deltaKm : defaultRate;
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const firstDate = new Date(first.date).getTime();
  const lastDate = new Date(last.date).getTime();
  const diffDays = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  const diffOdo = last.odo - first.odo;
  if (diffOdo > 0 && diffDays > 0) {
    const calculatedRate = Math.round(diffOdo / diffDays);
    return Math.min(Math.max(calculatedRate, 10), 350); // clamp realistic range 10 - 350 km/day
  }

  return defaultRate;
}

/**
 * Find the brand config for a vehicle
 */
export function getBrandConfig(brand: string) {
  return BRAND_CONFIGS[brand] || BRAND_CONFIGS['Ford'];
}

/**
 * Determine exact maintenance tier for a given target ODO & brand
 */
export function determineTierForOdo(brand: string, targetOdo: number): {
  tier: ServiceTier;
  tierLevel: 1 | 2 | 3 | 4 | 5;
  colorClass: string;
} {
  const brandCfg = getBrandConfig(brand);
  const tiers = brandCfg.tiers;

  if (brand === 'Mercedes-Benz') {
    // Mercedes ASSYST PLUS: 8k cycle
    if (targetOdo % 64000 === 0 || targetOdo % 80000 === 0) {
      const tier4 = tiers.find(t => t.tierCode === 'TIER_4') || tiers[3];
      return { tier: tier4, tierLevel: 4, colorClass: 'bg-purple-600 text-white border-purple-500' };
    } else if (targetOdo % 32000 === 0 || targetOdo % 40000 === 0) {
      const tier3 = tiers.find(t => t.tierCode === 'TIER_3') || tiers[2];
      return { tier: tier3, tierLevel: 3, colorClass: 'bg-amber-600 text-white border-amber-500' };
    } else if (targetOdo % 16000 === 0) {
      const tier2 = tiers.find(t => t.tierCode === 'TIER_2') || tiers[1];
      return { tier: tier2, tierLevel: 2, colorClass: 'bg-blue-600 text-white border-blue-500' };
    } else {
      const tier1 = tiers.find(t => t.tierCode === 'TIER_1') || tiers[0];
      return { tier: tier1, tierLevel: 1, colorClass: 'bg-emerald-600 text-white border-emerald-500' };
    }
  }

  if (brand === 'Ford') {
    // Ford: 10k cycle
    if (targetOdo % 80000 === 0) {
      const tier4 = tiers.find(t => t.tierCode === 'TIER_4') || tiers[3];
      return { tier: tier4, tierLevel: 4, colorClass: 'bg-purple-600 text-white border-purple-500' };
    } else if (targetOdo % 40000 === 0) {
      const tier3 = tiers.find(t => t.tierCode === 'TIER_3') || tiers[2];
      return { tier: tier3, tierLevel: 3, colorClass: 'bg-amber-600 text-white border-amber-500' };
    } else if (targetOdo % 20000 === 0) {
      const tier2 = tiers.find(t => t.tierCode === 'TIER_2') || tiers[1];
      return { tier: tier2, tierLevel: 2, colorClass: 'bg-blue-600 text-white border-blue-500' };
    } else {
      const tier1 = tiers.find(t => t.tierCode === 'TIER_1') || tiers[0];
      return { tier: tier1, tierLevel: 1, colorClass: 'bg-emerald-600 text-white border-emerald-500' };
    }
  }

  // Kia & Hyundai: 5k cycle
  if (targetOdo % 40000 === 0) {
    const tier4 = tiers.find(t => t.tierCode === 'TIER_4') || tiers[3];
    return { tier: tier4, tierLevel: 4, colorClass: 'bg-purple-600 text-white border-purple-500' };
  } else if (targetOdo % 20000 === 0) {
    const tier3 = tiers.find(t => t.tierCode === 'TIER_3') || tiers[2];
    return { tier: tier3, tierLevel: 3, colorClass: 'bg-amber-600 text-white border-amber-500' };
  } else if (targetOdo % 10000 === 0) {
    const tier2 = tiers.find(t => t.tierCode === 'TIER_2') || tiers[1];
    return { tier: tier2, tierLevel: 2, colorClass: 'bg-blue-600 text-white border-blue-500' };
  } else {
    const tier1 = tiers.find(t => t.tierCode === 'TIER_1') || tiers[0];
    return { tier: tier1, tierLevel: 1, colorClass: 'bg-emerald-600 text-white border-emerald-500' };
  }
}

/**
 * Calculate the next upcoming milestones & future roadmap for a vehicle
 */
export function calculateVehicleMilestones(
  vehicle: Vehicle,
  logs: OdoLog[] = [],
  futureCount: number = 8
): MaintenanceMilestone[] {
  const brandCfg = getBrandConfig(vehicle.brand);
  const baseInterval = vehicle.baseCycleKm || brandCfg.standardIntervalKm || 5000;
  
  // Calculate dynamic daily km
  const vehicleLogs = logs.filter(l => l.vehicleId === vehicle.id);
  const effectiveDailyKm = calculateRollingDailyKm(vehicleLogs, vehicle.averageKmPerDay || 45);

  const currentOdo = vehicle.currentOdo;

  // Determine the next milestone ODO
  // Example: if currentOdo is 38,450 and base is 8,000
  // Next target is Math.ceil(38,450 / 8000) * 8000 = 40,000
  let nextMilestoneOdo = Math.ceil(currentOdo / baseInterval) * baseInterval;
  if (nextMilestoneOdo <= currentOdo) {
    nextMilestoneOdo += baseInterval;
  }

  const milestones: MaintenanceMilestone[] = [];
  const today = new Date();

  for (let i = 0; i < futureCount; i++) {
    const targetOdo = nextMilestoneOdo + (i * baseInterval);
    const kmRemaining = targetOdo - currentOdo;
    const isCurrentNext = i === 0;

    // Calculate days remaining based on daily average
    const daysRemaining = Math.max(0, Math.round(kmRemaining / Math.max(1, effectiveDailyKm)));

    const estDate = new Date(today);
    estDate.setDate(today.getDate() + daysRemaining);
    const estDateString = estDate.toISOString().split('T')[0];

    const { tier, tierLevel, colorClass } = determineTierForOdo(vehicle.brand, targetOdo);

    // Calculate estimated cost
    const totalEst = tier.items.reduce((acc, item) => acc + item.unitPrice + item.laborPrice, 0);

    // Urgency level
    let urgencyLevel: 'normal' | 'due_soon' | 'urgent' | 'overdue' = 'normal';
    const isOverdue = isCurrentNext && (kmRemaining <= 0 || (currentOdo > targetOdo));

    if (isOverdue) {
      urgencyLevel = 'overdue';
    } else if (kmRemaining <= 500 || daysRemaining <= 5) {
      urgencyLevel = 'urgent';
    } else if (kmRemaining <= 1200 || daysRemaining <= 14) {
      urgencyLevel = 'due_soon';
    }

    milestones.push({
      milestoneIndex: i + 1,
      targetOdo,
      tierCode: tier.tierCode,
      tierName: tier.name,
      shortTier: tier.shortName,
      tierLevel,
      colorClass,
      kmRemaining,
      daysRemaining,
      estimatedDate: estDateString,
      estimatedCost: totalEst,
      items: tier.items,
      brandNotes: tier.brandManualRef,
      isCurrentNext,
      isOverdue,
      urgencyLevel,
    });
  }

  return milestones;
}

/**
 * Aggregate summary for entire fleet
 */
export function getFleetAnalytics(vehicles: Vehicle[], logs: OdoLog[]) {
  let urgentCount = 0;
  let dueSoonCount = 0;
  let normalCount = 0;
  let overdueCount = 0;
  let totalNextServiceCost = 0;
  let totalEst30DayCost = 0;
  let totalEst90DayCost = 0;
  let totalEst365DayCost = 0;

  const vehicleMap: Record<string, { vehicle: Vehicle; milestones: MaintenanceMilestone[] }> = {};

  vehicles.forEach(vehicle => {
    const milestones = calculateVehicleMilestones(vehicle, logs, 10);
    vehicleMap[vehicle.id] = { vehicle, milestones };

    const next = milestones[0];
    if (next) {
      totalNextServiceCost += next.estimatedCost;
      if (next.urgencyLevel === 'overdue') overdueCount++;
      else if (next.urgencyLevel === 'urgent') urgentCount++;
      else if (next.urgencyLevel === 'due_soon') dueSoonCount++;
      else normalCount++;
    }

    // Accumulate costs in time windows
    milestones.forEach(m => {
      if (m.daysRemaining <= 30) totalEst30DayCost += m.estimatedCost;
      if (m.daysRemaining <= 90) totalEst90DayCost += m.estimatedCost;
      if (m.daysRemaining <= 365) totalEst365DayCost += m.estimatedCost;
    });
  });

  return {
    totalVehicles: vehicles.length,
    overdueCount,
    urgentCount,
    dueSoonCount,
    normalCount,
    totalNextServiceCost,
    totalEst30DayCost,
    totalEst90DayCost,
    totalEst365DayCost,
    vehicleMap,
  };
}
