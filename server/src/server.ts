import fastify from 'fastify';
import cors from '@fastify/cors';
import { memoryRoutes } from './routes/memory.routes';

class Application {
  private app = fastify();

  private applySettings(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.register(cors, { origin: true });

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  private buildRoutes(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
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
    await this.applySettings();
    await this.buildRoutes();
    await this.listen();
  }
}
// add a comment
new Application().load();
