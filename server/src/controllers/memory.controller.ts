import { FastifyRequest } from 'fastify';
import { Prisma } from '../lib/prisma';
import { object, z } from 'zod';

class MemoryController {
  public async getAllMemories(): Promise<object> {
    const memories = await Prisma.memory.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (!(memories.length > 0)) return { 404: 'Não há memórias ainda' };
    else
      return memories.map((memory) => {
        return {
          id: memory.id,
          coverUrl: memory.coverUrl,
          resume: memory.content.substring(0, 115).concat('...'),
        };
      });
  }

  public async getMemory(req: FastifyRequest): Promise<object> {
    const paramsSchema = object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(req.params);
    const memory = await Prisma.memory.findUniqueOrThrow({ where: { id } });

    return memory ? { memory } : { 500: 'Ocorre um erro interno' };
  }

  public async createMemory(req: FastifyRequest): Promise<object> {
    const bodySchema = object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body);

    const memory = await Prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: '2dab77cf-f551-44fd-8120-1a91aee62646',
      },
    });

    return memory ? { memory } : { 500: 'Ocorre um erro interno' };
  }

  public async updateMemory(req: FastifyRequest): Promise<object> {
    const paramsSchema = object({ id: z.string().uuid() });
    const bodySchema = object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });

    const { id } = paramsSchema.parse(req.params);
    const { content, coverUrl, isPublic } = bodySchema.parse(req.body);

    const memory = await Prisma.memory.update({
      where: { id },
      data: { content, coverUrl, isPublic },
    });

    return memory ? { memory } : { 500: 'Ocorreu um erro interno' };
  }

  public async deleteMemory(req: FastifyRequest): Promise<object> {
    const paramsSchema = object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(req.params);

    const deletedMemory = await Prisma.memory.delete({ where: { id } });

    return deletedMemory
      ? { deletedMemory }
      : { 500: 'Ocorreu um erro interno' };
  }
}

export default new MemoryController();
