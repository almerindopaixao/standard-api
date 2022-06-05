import './utils/module-alias';
import bodyParser from 'body-parser';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import { ForecastController } from './controllers/forecast';
import * as database from '@src/database';
export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  private async setupExpress(): Promise<void> {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.setupController();
    await this.databaseSetup();
  }

  private setupController(): void {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public async init(): Promise<void> {
    await this.setupExpress();
  }

  public getApp(): Application {
    return this.app;
  }
}
