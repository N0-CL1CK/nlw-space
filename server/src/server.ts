import 'dotenv/config';

import fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';

import { memoryRoutes } from './routes/memory.routes';
import { authRoutes } from './routes/auth.routes';

class Application {
  private app = fastify();

  constructor() {
    this.app.register(cors, { origin: true });
    this.app.register(jwt, { secret: 'spacetime' });
  }

  public get jwt() {
    return this.app.jwt;
  }

  private buildRoutes(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.register(authRoutes, { prefix: '/auth' });
        this.app.register(memoryRoutes, { prefix: '/memories' });

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  private listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app
          .listen({ port: 8080 })
          .then(() =>
            console.log(`🚀 HTTP server running on http://localhost:8080/`),
          );

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  public async load(): Promise<void> {
    await this.buildRoutes();
    await this.listen();
  }
}

const App = new Application();

App.load();

export { App };
