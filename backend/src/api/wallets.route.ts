import { Router } from 'express';

import { evaluateWallet } from '../core/evaluator';

export const walletsRouter = Router();

interface WalletParams {
  address: string;
}

walletsRouter.get('/:address', async (req, res, next) => {
  try {
    const { address } = req.params as WalletParams;

    if (!address || address.trim().length === 0) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    const evaluation = await evaluateWallet(address);
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
});
