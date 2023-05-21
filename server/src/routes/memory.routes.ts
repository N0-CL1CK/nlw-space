import { FastifyInstance } from 'fastify';
import MemoryController from '../controllers/memory.controller';

export async function memoryRoutes(router: FastifyInstance) {
  router.addHook('preHandler', async (request) => await request.jwtVerify());

  router.get('/', MemoryController.getAllMemories);
  router.post('/', MemoryController.createMemory);

  router.get('/:id', MemoryController.getMemory);
  router.put('/:id', MemoryController.updateMemory);
  router.delete('/:id', MemoryController.deleteMemory);
}
