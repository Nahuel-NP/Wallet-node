import { prisma } from "../../config/prismaClient";
import { LoginUserDto } from "../../domain/dtos/auth/loginUser.dto";
import { RegisterUserDto } from "../../domain/dtos/auth/registerUser.dto";
import { CustomError } from "../../domain/errors/custom.error";
import { bycriptAdapter } from "../../config/bycript.adapter";
import { UserEntity } from "../../domain/entities/user.entity";
import { JwtAdapter } from "../../config/jwt.adapter";

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


      const token = await JwtAdapter.generateToken({ id: newUser.id });
      return {
        user: rest,
        wallet: {
          alias,
          cvu,
        },
        token,
      };
    } catch (error) {
      console.log(error);
    }
  }

  public async login(loginUserDto: LoginUserDto) {
    // corroborar si el usuario existe
    const user = await prisma.user.findFirst({
      where: {
        email: loginUserDto.email,
      },
    });
    if (!user) {
      throw CustomError.badRequest("User does not exist");
    }
    // corroborar si la contraseña es correcta
    const validPassword = bycriptAdapter.compare(
      loginUserDto.password,
      user.password
    );

    if (!validPassword) {
      throw CustomError.badRequest("Invalid password");
    }

    // comprobar si esta activo

    if (!user.isActive) {
      throw CustomError.unauthorized("User is not active");
    }
    // comprobar si esta validado el email
    if (!user.emailValidated) {
      //TODO: send validation email
      throw CustomError.unauthorized("Email not validated");
    }

    const token = await JwtAdapter.generateToken({ id: user.id });
    // obtener wallet

    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Transaciones?

    if (!wallet) {
      throw CustomError.internalServer("Wallet not found");
    }

    const userToReturn = UserEntity.fromObject(user);
    const { alias, cvu } = wallet;
    return {
      user: userToReturn,
      wallet: {
        alias,
        cvu,
      },
      token,
    };
  }

  private removeLettersFromString(id: string) {
    const regex = /\D+/g;
    return id.replace(regex, "");
  }
}
