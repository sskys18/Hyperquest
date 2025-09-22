import { getAllQuests, QuestDefinition, QuestStatus } from './questRegistry';

export type QuestEvaluation = Pick<
  QuestDefinition,
  'slug' | 'title' | 'shortDescription' | 'longDescription' | 'rank' | 'points'
> & {
  status: QuestStatus;
  progressPct: number;
  metrics: Record<string, number>;
};

export type WalletEvaluation = {
  wallet: string;
  quests: QuestEvaluation[];
  summary: {
    totalPoints: number;
  };
};

export async function evaluateWallet(address: string): Promise<WalletEvaluation> {
  const quests = getAllQuests();

  const evaluations = quests.map((quest) => evaluateQuest(quest, address));
  const totalPoints = evaluations
    .filter((quest) => quest.status === 'COMPLETED')
    .reduce((sum, quest) => sum + quest.points, 0);

  return {
    wallet: address,
    quests: evaluations,
    summary: { totalPoints },
  };
}

function evaluateQuest(quest: QuestDefinition, address: string): QuestEvaluation {
  const evaluation = evaluateQuestBySlug(quest.slug, address);

  return {
    slug: quest.slug,
    title: quest.title,
    shortDescription: quest.shortDescription,
    longDescription: quest.longDescription,
    rank: quest.rank,
    points: quest.points,
    status: evaluation.status,
    progressPct: evaluation.progressPct,
    metrics: evaluation.metrics,
  };
}

function evaluateQuestBySlug(slug: string, address: string): {
  status: QuestStatus;
  progressPct: number;
  metrics: Record<string, number>;
} {
  // 간단한 모의 데이터로 검증 (실제로는 하이퍼리퀴드 API 호출)
  const mockData = getMockUserData(address);

  switch (slug) {
    case 'first-deposit': {
      const hasDeposit = mockData.depositCount > 0;
      return {
        status: hasDeposit ? 'COMPLETED' : 'NOT_STARTED',
        progressPct: hasDeposit ? 100 : 0,
        metrics: { depositCount: mockData.depositCount },
      };
    }

    case 'first-trade': {
      const hasTrade = mockData.tradeCount > 0;
      return {
        status: hasTrade ? 'COMPLETED' : 'NOT_STARTED',
        progressPct: hasTrade ? 100 : 0,
        metrics: { tradeCount: mockData.tradeCount },
      };
    }

    case 'high-volume': {
      const progressPct = 100;
      const status: QuestStatus = mockData.totalVolume >= 1000000 ? 'COMPLETED' : mockData.totalVolume > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      return {
        status,
        progressPct,
        metrics: { totalVolume: mockData.totalVolume },
      };
    }

    case 'high-pnl-percentage': {
      const progressPct = 100;
      const status: QuestStatus = mockData.maxPnlPercentage >= 100 ? 'COMPLETED' : mockData.maxPnlPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      return {
        status,
        progressPct,
        metrics: { maxPnlPercentage: mockData.maxPnlPercentage },
      };
    }

    case 'large-liquidation': {
      const hasLargeLiquidation = mockData.largeLiquidationCount > 0;
      return {
        status: hasLargeLiquidation ? 'COMPLETED' : 'NOT_STARTED',
        progressPct: hasLargeLiquidation ? 100 : 0,
        metrics: { largeLiquidationCount: mockData.largeLiquidationCount },
      };
    }

    case 'averaging-down-artisan': {
      const hasQualifyingEvent = mockData.averageDownEvents > 0;
      return {
        status: hasQualifyingEvent ? 'COMPLETED' : 'NOT_STARTED',
        progressPct: hasQualifyingEvent ? 100 : 0,
        metrics: { averageDownEvents: mockData.averageDownEvents },
      };
    }

    case 'all-in-yolo': {
      const progressPct = 100;
      const status: QuestStatus = mockData.maxAllocationPercentage >= 80 ? 'COMPLETED' : mockData.maxAllocationPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      return {
        status,
        progressPct,
        metrics: { maxAllocationPercentage: mockData.maxAllocationPercentage },
      };
    }

    default: {
      const progressPct = 100;
      const status: QuestStatus = mockData.tradeCount >= 1 ? 'COMPLETED' : mockData.tradeCount > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      return {
        status,
        progressPct,
        metrics: { tradeCount: mockData.tradeCount },
      };
    }
  }
}

function getMockUserData(address: string) {
  // 지갑 주소 기반으로 모의 데이터 생성 (실제로는 하이퍼리퀴드 API 호출)
  const hash = address.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  return {
    depositCount: Math.abs(hash % 5),
    tradeCount: Math.abs(hash % 100),
    totalVolume: Math.abs(hash % 2000000),
    maxPnlPercentage: Math.abs(hash % 200),
    largeLiquidationCount: Math.abs(hash % 2),
    averageDownEvents: Math.abs(hash % 3),
    maxAllocationPercentage: Math.abs(hash % 100),
  };
}

