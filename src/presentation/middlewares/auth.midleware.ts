import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config/jwt.adapter";
import { prisma } from "../../config/prismaClient";
import { UserEntity } from "../../domain/entities/user.entity";

export class AuthMiddlaware {
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header("Authorization");

    if (!authorization) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    if (!authorization.startsWith("Bearer")) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const token = authorization.split(" ").at(1) || "";

    try {
      const payload = await JwtAdapter.validateToken<{
        id: string;
      }>(token);

      if (!payload) {
        return res.status(401).json({
          message: "Invalid token",
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        return res.status(401).json({
          message: "Invalid token - user",
        });
      }
      if (!user.isActive) {
        return res.status(403).json({
          message: "user not valid",
        });
      }

      req.body.user = UserEntity.fromObject(user);

      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
