const BASE_PATH = '/old/logs/money-'
const SERVERS_PATH = '/old/lists/serverDescriptions.txt'

/** @param {NS} ns **/
export async function main(ns) {
    const servers = JSON.parse(ns.read(SERVERS_PATH))
    while(true) {
        const ts = Date.now()
        const reports = []
        const date = new Date().toISOString().split('T')[0]
        for(let {hostname: host} of servers) {
            reports.push({host, balance: ns.getServerMoneyAvailable(host)})
        }
        await ns.write(`${BASE_PATH}${date}.txt`, JSON.stringify({ts, reports}), 'a')
        await ns.write(`${BASE_PATH}${date}.txt`, `,\n`, 'a')
        await ns.sleep(100) 
    }
}