export class WithdrawalDto {
  constructor(readonly amount: number) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, withdrawalDto?: WithdrawalDto] {
    const { amount } = object;

    if (!amount) {
      return ["Amount is required"];
    }

    if (isNaN(amount)) {
      return ["Amount must be a number"];
    }

    if (amount <= 0) {
      return ["Amount must be greater than 0"];
    }

    return [undefined, new WithdrawalDto(amount)];
  }
}
