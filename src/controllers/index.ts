import mongoose from 'mongoose';
import { Response } from 'express';
import { CUSTOM_VALIDATION } from '@src/models/user';
import logger from '@src/logger';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): Response {
    if (!(error instanceof mongoose.Error.ValidationError)) {
      logger.error(error);
      return res
        .status(500)
        .send({ code: 500, error: 'Something went wrong!' });
    }

    const clientErrors = this.handleClientErrors(error);

    return res.status(clientErrors.code).send({ ...clientErrors });
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    const duplicatedKindErrors = this.findDuplicatedKindErrors(error);
    if (duplicatedKindErrors.length) return { code: 409, error: error.message };
    return { code: 422, error: error.message };
  }

  private findDuplicatedKindErrors(
    error: mongoose.Error.ValidationError
  ): (mongoose.Error.ValidatorError | mongoose.Error.CastError)[] {
    return Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
    );
  }
}
