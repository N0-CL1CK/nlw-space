import { Prisma } from '../lib/prisma';
import { FastifyRequest } from 'fastify';
import { object, z } from 'zod';

import { App } from '../server';
import axios from 'axios';

async function getAccessToken(code: string): Promise<any> {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    );

    return response.data;
  } catch (err) {
    return { error_description: err };
  }
}

async function getUserData(token: string): Promise<any> {
  const userSchema = object({
    id: z.number(),
    login: z.string(),
    name: z.string(),
    avatar_url: z.string().url(),
  });

  try {
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { id, login, name, avatar_url } = userSchema.parse(userResponse.data);

    return { id, login, name, avatar_url };
  } catch (err: any) {
    return { err: err.response.data.message };
  }
}

class AuthController {
  public async register(req: FastifyRequest): Promise<object> {
    const bodySchema = object({
      code: z.string(),
    });

    const { code } = bodySchema.parse(req.body);

    const { access_token, error_description } = await getAccessToken(code);

    if (access_token) {
      const { id, login, name, avatar_url, err } = await getUserData(
        access_token,
      );

      if (id && login && name && avatar_url) {
        let user = await Prisma.user.findUnique({
          where: { githubId: id },
        });

        if (!user) {
          user = await Prisma.user.create({
            data: {
              githubId: id,
              login,
              name,
              avatarUrl: avatar_url,
            },
          });
        }

        const token = App.jwt.sign(
          { name: user.name, avatarUrl: user.avatarUrl },
          { sub: user.id, expiresIn: '30 days' },
        );

        return { token };
      } else return { err };
    } else return { err: error_description };
  }
}

export default new AuthController();
