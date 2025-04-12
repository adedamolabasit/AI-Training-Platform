// oracle.ts
import { CronJob } from 'cron'

async function checkActiveObligations() {
  const manager = new ethers.Contract(/* ... */)
  const filter = manager.filters.ObligationCreated()
  const events = await manager.queryFilter(filter)
  
  for (const event of events) {
    const [cid, provider] = event.args
    const obligation = await manager.obligations(cid)
    
    if (obligation.status === 0) { // Active
      const { isProofValid, isTimely } = await verifyFilecoinProof(cid, provider)
      const arbiter = new ethers.Contract(/* ... */)
      await arbiter.verifyFilecoinProof(cid, isProofValid, isTimely)
    }
  }
}

// Run every hour
new CronJob('0 * * * *', checkActiveObligations).start()