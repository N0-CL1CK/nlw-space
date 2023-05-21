import { FastifyInstance } from 'fastify';
import AuthController from '../controllers/auth.controller';

export async function authRoutes(router: FastifyInstance) {
  router.post('/register', AuthController.register);
}
