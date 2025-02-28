

export class TransactionEntity {
  constructor(
    public readonly transactionId:string,
    public readonly amount:number,
    public readonly status:string,
    public readonly transactionType:string,
    public readonly updatedAt:Date
  ){}

  static fromObject(object:{[key:string]:any}):TransactionEntity{

    const {transactionId,amount,status,transactionType,updatedAt} = object;
    if(!transactionId) throw 'TransactionId is required';
    if(!amount) throw 'Amount is required';
    if(!status) throw 'Status is required';
    if(!transactionType) throw 'TransactionType is required';
    if(!updatedAt) throw 'UpdatedAt is required';

    return new TransactionEntity(transactionId,amount,status,transactionType,updatedAt);
  }
}