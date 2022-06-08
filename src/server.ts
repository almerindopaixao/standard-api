import './utils/module-alias';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from '@src/logger';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import * as database from '@src/database';
import { ForecastController } from './controllers/forecast';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupController(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupController();
    await this.databaseSetup();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Server listening on port: ${this.port}`);
    });
  }
}
