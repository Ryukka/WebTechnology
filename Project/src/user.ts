
import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

export class User {
  public username: string
  public email: string
  public password: string = ""
  
  constructor(username: string, email: string, password: string) {
    this.username = username
    this.email = email
    this.password = password
  }
  static fromDb(username: string, password: string, email: string): User {
      return new User(username, email, password)
  }

  public getPassword(): string {
    return this.password;
  }
    
  public validatePassword(toValidate: String): boolean {
    if (this.password == toValidate){
      return true;
    }
    else{
      return false;
    } //return comparison with hashed password
  }
}
    
    
export class UserHandler {
      public db: any
    
      public get(username: string, password: string, email: string, callback: (err: Error | null, result?: User) => User) {
        this.db.get(`user:${username}`,`user:${password}`,`user:${email}`, function (err: Error, result?:User) {
          
          if (err) callback(err)
          else if ((username === undefined)||(password === undefined)||(email === undefined)) callback(null)
          else callback(null, User.fromDb(username, password,email))
        })
      }
    
      public save(user: User, callback: (err: Error | null) => void) {
        this.db.put(`user:${user.username}`, `password:${user.password}`,`email:${user.email}`, (err: Error | null) => {
          callback(err)
        })
      }
    
      public delete(username: string, callback: (err: Error | null) => void) { // to delete account
        this.db.delete(`user:${username}`, (err: Error | null) => {
          if (err) callback(err)
          else alert ('User deleted')
        }  )
      }
    
      constructor(path: string) {
        this.db = LevelDB.open(path)
      }
    }
