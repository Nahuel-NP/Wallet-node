import jwt from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;
export class JwtAdapter {

  static async generateToken(payload: any, duration = 60 * 60 * 4) {
    return new Promise((resolve) => {
      jwt.sign(payload, JWT_SEED, { expiresIn: duration }, (error, token) => {
        if (error) {
          resolve(null);
        }
        return resolve(token);
      });
    });
  }

  static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (error, decoded) => {
        if (error) {
          resolve(null);
        }
        resolve(decoded as T);
      });
    });
  }
}