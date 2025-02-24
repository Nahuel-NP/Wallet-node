

export class UserEntity {


  constructor(
    public readonly id:string,
    public readonly name:string,
    public readonly email:string,
    public readonly emailValidated:boolean,
    public readonly isActive:boolean,
    public readonly img?:string,
  ){}

  static fromObject(object:{[key:string]:any}):UserEntity{
    const {id,name,email,emailValidated,isActive,img} = object;
    if(!id) throw 'Id is required';
    if(!name) throw 'Name is required';
    if(!email) throw 'Email is required';
    if(!emailValidated) throw 'EmailValidated is required';

    return new UserEntity(id,name,email,emailValidated,isActive,img);
  }


}