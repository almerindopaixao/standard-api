import mongoose from 'mongoose';
import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middlewares/auth';
import { Request, Response } from 'express';
import logger from '@src/logger';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({ ...req.body, user: req.decoded?.id });
      const result = await beach.save();
      res.status(201).send(result);
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: err.message });
      } else {
        logger.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}
