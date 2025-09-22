import { Router } from 'express';

import { getAllQuests, QuestDefinition } from '../core/questRegistry';

export const questsRouter = Router();

questsRouter.get('/', async (_req, res, next) => {
  try {
    const quests: QuestDefinition[] = getAllQuests();

    const payload = quests.map((quest) => ({
      slug: quest.slug,
      title: quest.title,
      shortDescription: quest.shortDescription,
      longDescription: quest.longDescription,
      rank: quest.rank,
      points: quest.points,
    }));

    res.json({ quests: payload });
  } catch (error) {
    next(error);
  }
});
