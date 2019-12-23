import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

export class Metric {
  public key: string
  public timestamp: number
  public value: number

  constructor(k: string, ts: number, v: number) {
    this.key= k
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {
  private db: any 
  
  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }
  
  public closeDB(){
    this.db.close()
  }
  
  public save(m: Metric, callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)  
    stream.write({username: m.key, metric:m.timestamp, value:m.value} )
    stream.end()
  }
  
  public get(key: string, callback: (err: Error | null, result?: Metric[]) => void) {
    const stream = this.db.createReadStream()
    var met: Metric[] = []
    
    stream.on('error', callback)
      .on('data', (data: any) => {
        const user = data.username
      const timestamp = data.timestamp
      const value = data.value
          met.push(new Metric(user,timestamp, value))
      })
      .on('end', (err: Error) => {
        callback(null, met)
      })
  }
  public delete(key: string,timestamp:string, callback: (err: Error | null, result?: Metric[]) => void){
    const stream = this.db.createReadStream()
      stream.on('error', callback)
    .on('data', (data: any) => {
      const user = data.username
      const timestamp = data.timestamp
      this.db.del(data.username,data.timestamp,data.value)
    }
    )
  }
}
