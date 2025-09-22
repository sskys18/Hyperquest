import questsSeed from '../schemas/quests.seed.json';

export type QuestRank = 'Bronze' | 'Silver' | 'Gold' | 'Degen';

export interface QuestDefinition {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  points: number;
  rank: QuestRank;
}

export type QuestStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

const QUESTS: QuestDefinition[] = questsSeed as QuestDefinition[];

export function getAllQuests(): QuestDefinition[] {
  return QUESTS;
}