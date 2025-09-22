import questsSeed from '../schemas/quests.seed.json';

export interface QuestSpec {
  target: number;
}

export type QuestRank = 'Bronze' | 'Silver' | 'Gold' | 'Degen';

export interface QuestDefinition {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  points: number;
  rank: QuestRank;
  spec: QuestSpec;
}

export type QuestStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

const QUESTS: QuestDefinition[] = questsSeed as QuestDefinition[];

export function getAllQuests(): QuestDefinition[] {
  return QUESTS;
}