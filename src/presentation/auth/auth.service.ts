import { prisma } from "../../config/prismaClient";
import { LoginUserDto } from "../../domain/dtos/auth/loginUser.dto";
import { RegisterUserDto } from "../../domain/dtos/auth/registerUser.dto";
import { CustomError } from "../../domain/errors/custom.error";
import { bycriptAdapter } from "../../config/bycript.adapter";

export class AuthService {
  constructor() {}

  public async register(registerUserDto: RegisterUserDto) {
    // corroborar si el usuario existe
    const user = await prisma.user.findFirst({
      where: {
        email: registerUserDto.email,
      },
    });
    if (user) {
      throw CustomError.badRequest("User already exists");
    }

    try {
      // crear usuario
      const newUser = await prisma.user.create({
        data: {
          ...registerUserDto,
          password: bycriptAdapter.hash(registerUserDto.password),
        },
      });

      // const random cvu

      const newCvu = this.removeLettersFromString(newUser.id);
      // crear wallet
      const newWallet = await prisma.wallet.create({
        data: {
          userId: newUser.id,
          cvu: newCvu,
          balance: 100,
          alias: "",
          currency: "ARS",
        },
      });

      const { password: _, ...rest } = newUser;
      const { alias, cvu } = newWallet;
      // TODO:generar token
      // retornar usuario y token
      return {
        user: rest,
        wallet: {
          alias,
          cvu,
        },
        token: "token",
      };
    } catch (error) {
      console.log(error);
    }
  }

  public async login(loginUserDto: LoginUserDto) {
    return loginUserDto;
  }

  private removeLettersFromString(id: string) {
    const regex = /\D+/g;
    return id.replace(regex, "");
  }
}
