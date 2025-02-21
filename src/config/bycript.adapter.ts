import { compareSync, hashSync, genSaltSync } from "bcryptjs";

export const bycriptAdapter = {
  hash: (password: string) => {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  },
  compare: (password: string, hash: string) => {
    return compareSync(password, hash);
  },
};