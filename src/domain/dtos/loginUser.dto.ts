export class LoginUserDto {
  readonly email: string;
  readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { email, password } = object;
    if (!email) return ["Missing email"];
    if (!password) return ["Missing password"];

    return [undefined, new LoginUserDto(email, password)];
  }
}
