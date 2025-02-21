export class loginUserDto {
  readonly email: string;
  readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  static create(object: { [key: string]: any }): [string?, loginUserDto?] {
    const { email, password } = object;
    if (!email) return ["Missing email"];
    if (!password) return ["Missing password"];

    return [undefined, new loginUserDto(email, password)];
  }
}
