import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { BaseController } from '@src/controllers';
import { AuthService } from '@src/services/auth';

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

  @Post('authenticate')
  public async authenticate(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found',
      });

    if (
      !(await AuthService.comparePassword(
        String(password),
        String(user.password)
      ))
    )
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password does not match',
      });

    const token = AuthService.generateToken(user.toJSON());

    res.status(200).send({ token });
  }
}
