export class TransferDto {
  constructor(
    public readonly cvuOrAlias: string,
    public readonly amount: number
  ) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, transferDto?: TransferDto] {
    const { cvuOrAlias, amount } = object;

    if (!cvuOrAlias) return ["CvuOrAlias is required"];
    if (!amount) return ["Amount is required"];
    if (typeof amount !== "number") return ["Amount must be a number"];
    if (amount <= 0) return ["Amount must be greater than 0"];

    return [undefined, new TransferDto(cvuOrAlias, amount)];
  }
}
