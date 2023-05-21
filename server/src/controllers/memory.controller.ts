import { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '../lib/prisma';
import { object, z } from 'zod';

class MemoryController {
  public async getAllMemories(request: FastifyRequest): Promise<object> {
    const memories = await Prisma.memory.findMany({
      where: { userId: request.user.sub },
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

  public async getMemory(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<object> {
    const paramsSchema = object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(request.params);
    const memory = await Prisma.memory.findUniqueOrThrow({ where: { id } });

    if (!memory.isPublic && memory.userId !== request.user.sub)
      return response.status(401).send();

    return memory;
  }

  public async createMemory(request: FastifyRequest): Promise<object> {
    const bodySchema = object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    const memory = await Prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    });

    return memory;
  }

  public async updateMemory(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<object> {
    const paramsSchema = object({ id: z.string().uuid() });
    const bodySchema = object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });

    const { id } = paramsSchema.parse(request.params);
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    let memory = await Prisma.memory.findFirstOrThrow({ where: { id } });

    if (memory.userId !== request.user.sub) return response.status(401).send();

    memory = await Prisma.memory.update({
      where: { id },
      data: { content, coverUrl, isPublic },
    });

    return memory;
  }

  public async deleteMemory(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<object> {
    const paramsSchema = object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(request.params);

    const memory = await Prisma.memory.findUniqueOrThrow({
      where: { id },
    });

    if (memory.userId !== request.user.sub) return response.status(401).send();

    const deletedMemory = await Prisma.memory.delete({ where: { id } });

    return deletedMemory;
  }
}

export default new MemoryController();
