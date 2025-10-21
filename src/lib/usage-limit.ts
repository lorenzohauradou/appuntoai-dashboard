import { prisma } from "./prisma";

const USAGE_LIMITS = {
  free: 3,
  pro: 20,
  business: 60,
};

export interface UsageLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  subscriptionStatus: string;
  message?: string;
}

export async function checkUsageLimit(userId: string): Promise<UsageLimitResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      limitResetDate: true,
      monthlyAnalysesCount: true,
    },
  });

  if (!user) {
    throw new Error("Utente non trovato");
  }

  const subscriptionStatus = user.subscriptionStatus || "free";
  const limit = USAGE_LIMITS[subscriptionStatus as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.free;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastResetDate = user.limitResetDate || new Date(0);
  
  const shouldResetLimit = lastResetDate < monthStart;

  let currentCount = user.monthlyAnalysesCount || 0;

  if (shouldResetLimit) {
    currentCount = 0;
    await prisma.user.update({
      where: { id: userId },
      data: { 
        limitResetDate: now,
        monthlyAnalysesCount: 0
      },
    });
  }

  const allowed = currentCount < limit;

  let message: string | undefined;
  if (!allowed) {
    if (subscriptionStatus === "free") {
      message = `Hai raggiunto il limite di ${limit} analisi gratuite. Passa a Premium per continuare!`;
    } else {
      message = `Hai raggiunto il limite mensile di ${limit} analisi. Attendi il prossimo mese o passa a un piano superiore.`;
    }
  }

  return {
    allowed,
    currentCount,
    limit,
    subscriptionStatus,
    message,
  };
}

export async function incrementUsageCount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyAnalysesCount: {
        increment: 1
      }
    }
  });
}

export async function getUserUsageInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      limitResetDate: true,
      monthlyAnalysesCount: true,
    },
  });

  if (!user) {
    return null;
  }

  const subscriptionStatus = user.subscriptionStatus || "free";
  const limit = USAGE_LIMITS[subscriptionStatus as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.free;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastResetDate = user.limitResetDate || new Date(0);
  
  const shouldReset = lastResetDate < monthStart;
  const currentCount = shouldReset ? 0 : (user.monthlyAnalysesCount || 0);

  return {
    subscriptionStatus,
    currentCount,
    limit,
    remaining: Math.max(0, limit - currentCount),
  };
}

