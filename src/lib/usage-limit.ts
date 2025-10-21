import { prisma } from "./prisma";

const USAGE_LIMITS = {
  free: 3,
  pro: 600,
  business: 2500,
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
      transcriptions: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Utente non trovato");
  }

  const subscriptionStatus = user.subscriptionStatus || "free";
  const limit = USAGE_LIMITS[subscriptionStatus as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.free;

  const now = new Date();
  const lastResetDate = user.limitResetDate || user.transcriptions[0]?.createdAt || now;
  
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const shouldResetLimit = lastResetDate < monthStart;

  if (shouldResetLimit) {
    await prisma.user.update({
      where: { id: userId },
      data: { limitResetDate: now },
    });
  }

  const filterDate = shouldResetLimit ? now : lastResetDate;

  const currentMonthTranscriptions = user.transcriptions.filter(
    (t) => t.createdAt >= filterDate
  );

  const currentCount = currentMonthTranscriptions.length;
  const allowed = currentCount < limit;

  let message: string | undefined;
  if (!allowed) {
    if (subscriptionStatus === "free") {
      message = `Hai raggiunto il limite di ${limit} analisi gratuite. Passa a Premium per continuare!`;
    } else {
      message = `Hai raggiunto il limite mensile di ${limit} minuti di trascrizione. Attendi il prossimo mese o passa a un piano superiore.`;
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

export async function getUserUsageInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      limitResetDate: true,
      transcriptions: {
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const subscriptionStatus = user.subscriptionStatus || "free";
  const limit = USAGE_LIMITS[subscriptionStatus as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.free;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastResetDate = user.limitResetDate || user.transcriptions[0]?.createdAt || now;
  
  const filterDate = lastResetDate < monthStart ? now : lastResetDate;

  const currentMonthTranscriptions = user.transcriptions.filter(
    (t) => t.createdAt >= filterDate
  );

  return {
    subscriptionStatus,
    currentCount: currentMonthTranscriptions.length,
    limit,
    remaining: Math.max(0, limit - currentMonthTranscriptions.length),
  };
}

