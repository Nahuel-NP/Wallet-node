import { LoginUserDto } from "../../domain/dtos/loginUser.dto";
import { RegisterUserDto } from "../../domain/dtos/registerUser.dto";

export class AuthService {
  constructor() {}

  public async login(loginUserDto: LoginUserDto) {
    return loginUserDto;
  }

  public async register(registerUserDto: RegisterUserDto) {
    return registerUserDto;
  }
}
