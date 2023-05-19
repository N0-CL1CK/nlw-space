import fastify from 'fastify';
import { memoryRoutes } from './routes/memory.routes';

class Application {
  private app = fastify();

  private buildRoutes(): void {
    this.app.register(memoryRoutes, { prefix: '/memories' });
  }

  private listen(): void {
    this.app
      .listen({ port: 8080 })
      .then(() => console.log(`🚀 HTTP server running on http://localhost:8080/`));
  }

  public load(): void {
    this.buildRoutes();
    this.listen();
  }
}
// add a comment
new Application().load();
