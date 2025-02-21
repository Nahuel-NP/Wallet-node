import { prisma } from "../../config/prismaClient";
import { LoginUserDto } from "../../domain/dtos/loginUser.dto";
import { RegisterUserDto } from "../../domain/dtos/registerUser.dto";
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

    // crear usuario
    const newUser = await prisma.user.create({
      data: {
        ...registerUserDto,
        password: bycriptAdapter.hash(registerUserDto.password),
      },
    });

    const { password: _, ...rest } = newUser;
    // TODO:generar token
    // retornar usuario y token
    return {
      user: rest,
      token: "token",
    };
  }

  public async login(loginUserDto: LoginUserDto) {
    return loginUserDto;
  }
}
