import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"

const dbPath: string = 'db/test'
var dbMet: MetricsHandler

describe('Metrics', function () {
  before(function () {
    LevelDB.clear(dbPath)
    dbMet = new MetricsHandler(dbPath)
  })

  after(function () {
    dbMet.closeDB()
  })

  describe('Metrics', function () {
    it('should get empty array on non existing group', function () {
      dbMet.get("0", function (err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })
    it('should save existing datas', function(){
        var met:Metric[]=[]
        met.push(new Metric('12221122123',10))
        dbMet.save("0",met, (err: Error | null)=>{
            dbMet.get("0", (err: Error | null, result?: Metric[]) =>{
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                if(result)
                    expect(result[0].value).to.equal(10)
            })
        })
    })
  })
})
