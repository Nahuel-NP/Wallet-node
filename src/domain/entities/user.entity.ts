

export class UserEntity {


  constructor(
    public readonly id:string,
    public readonly name:string,
    public readonly email:string,
    public readonly emailValidated:boolean,
    public readonly password:string,
    public readonly img?:string
  ){}

  static fromObject(object:{[key:string]:any}):UserEntity{
    const {id,name,email,emailValidated,password,img} = object;
    if(!id) throw 'Id is required';
    if(!name) throw 'Name is required';
    if(!email) throw 'Email is required';
    if(!emailValidated) throw 'EmailValidated is required';
    if(!password) throw 'Password is required';

    return new UserEntity(id,name,email,emailValidated,password,img);
  }


}