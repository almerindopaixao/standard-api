import './utils/module-alias';
import bodyParser from 'body-parser';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import { ForecastController } from './controllers/forecast';

export class SetupServer extends Server {
    constructor(private port = 3000) {
        super();
    }

    private setupExpress(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.setupController();
    }

    private setupController(): void {
        const forecastController = new ForecastController();
        this.addControllers([forecastController]);
    }

    public async init(): Promise<void> {
        this.setupExpress();
    }

    public getApp(): Application {
        return this.app;
    }
}