import { Request, Response } from "express";
import { LoginUserDto } from "../../domain/dtos/loginUser.dto";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "../../domain/dtos/registerUser.dto";
import { CustomError } from "../../domain/errors/custom.error";

export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  login = (req: Request, res: Response) => {
    const { email, password } = req.body;
    const [error, loginUserDto] = LoginUserDto.create({ email, password });

    if (error) return res.status(400).json({ error });

    this.authservice
      .login(loginUserDto!)
      .then((user) => {
        res.json(user);
      })
      .catch((error) => this.handleError(error, res));
  };

  register = (req: Request, res: Response) => {
    const { email, password } = req.body;
    const [error, registerUserDto] = RegisterUserDto.create({
      email,
      password,
    });

    if (error) return res.status(400).json({ error });

    this.authservice
      .register(registerUserDto!)
      .then((user) => {
        res.json(user);
      })
      .catch((error) => this.handleError(error, res));
  };
}
