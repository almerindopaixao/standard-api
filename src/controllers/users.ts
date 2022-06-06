import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { BaseController } from '@src/controllers';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newuser = await user.save();
      res.status(201).send(newuser);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }
}
