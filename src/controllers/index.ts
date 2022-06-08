import mongoose from 'mongoose';
import { Response } from 'express';
import { CUSTOM_VALIDATION } from '@src/models/user';
import logger from '@src/logger';
import ApiError, { APIError } from '@src/utils/errors/ApiError';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): Response {
    if (!(error instanceof mongoose.Error.ValidationError)) {
      logger.error(error);
      return this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong!',
      });
    }

    const clientErrors = this.handleClientErrors(error);

    return this.sendErrorResponse(res, {
      code: clientErrors.code,
      message: clientErrors.error,
    });
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

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
