import { crack } from '/util/server.ns'

const SERVERS_PATH = '/lists/servers.txt'
const UNOWNED_PATH = '/lists/servers_unowned.txt'
const WORKERS_PATH = '/lists/servers_workers.txt'
const OWNED_PATH = '/lists/servers_owned.txt'
const SPREAD_WORKERS_LIST_PATH = '/lists/spread-workers.txt'
const SPREAD_WEAKEN_WORKERS_LIST_PATH = '/lists/xweaken-workerList.txt'

const HOME_IS_WORKER = ''
const GENERIC_WORKER_REGEX = /^a(-\d+)?$/
const _WEAKEN_WORKER_REGEX = /^w(-\d+)?$/
const GROWTH_WORKER_REGEX = /^g(-\d+)?$/
const HACK_WORKER_REGEX = /^h(-\d+)?$/

const WEAKEN_WORKER_REGEX = GENERIC_WORKER_REGEX


function formatNumber(num) {
    const endings = ['K', 'M', 'B', 'T']
    let n = num
    let e = ''
    for(let i = 0; i < endings.length; i += 1) {
        if (n > 1000) {
            n = n / 1000
            e = endings[i]
        }
    }
    return `${Math.floor(n * 10) / 10}${e}`.padEnd(6)
}

/** @param {import(".").NS } ns */
/** @param {NS} ns */
export async function main(ns) {
    try {
        const [ updateSpreaders = true, print = false ] = ns.args
        const currentServers = ['home']
        const newServers = []
        const ownedServers = []
        const unownedServers = []
        let workerServers = []
        let targetServers = []
        let i = 0
        while(i < currentServers.length) {
            i += 1
            // ns.tprint(`i: ${i} VS len: ${currentServers.length}`)
            const hostname = currentServers[i]
            // ns.tprint(hostname)
            const detectedHosts = ns.scan(hostname, true)
						let sorted = detectedHosts.sort((a, b) => {
              let serverA = ns.getServer(a)
              let serverB = ns.getServer(b)
							return serverA.moneyMax - serverB.moneyMax
						})
            // if(print) {
            //     ns.tprint(`Current: ${hostname} Parent: ${detectedHosts.slice(0,1)}\n\t\tChildren: ${detectedHosts.length > 1 ? '\n\t\t--- ' + detectedHosts.slice(1).join('\n\t\t--- ') : 'None'}`)
            // }
            for(const hostname of sorted) {
												let files = [...ns.ls('home', 'util'), ...ns.ls('home', 'lists'), "clusterMKI.js"]
												ns.scp(files, hostname, 'home')
            // for(const hostname of detectedHosts) {
                if(!currentServers.includes(hostname)) {
                    newServers.push(hostname)
                    let server = ns.getServer(hostname)
                    try {
                        await crack(ns, server)
                    } catch (e) {
                        ns.tprint(`Server: ${server.hostname}`)
                        ns.tprint(e.message)
                        ns.tprint(e.stack)
                    }
                    let cracked = server.openPortCount >= server.numOpenPortsRequired
                    // if(print) {
                    if(ns.hackAnalyzeChance(server.hostname) > 0.25 && server.moneyMax > 0) {
                        ns.tprint(`Server: ${server.hostname}`);
                        ns.tprint(`MoneyAvailable: ${formatNumber(server.moneyAvailable)}`);
                        ns.tprint(`MaxMoney: ${formatNumber(server.moneyMax)}`);
                        ns.tprint(`Root: ${server.hasAdminRights}`)
                        ns.tprint(`SecurityLevel: ${server.hackDifficulty}`);
                        ns.tprint(`MinSecurityLevel: ${server.minDifficulty}`);
                        ns.tprint(`HackChance: ${ns.hackAnalyzeChance(server.hostname)}\n\n`);
                        // ns.tprint(`Cracked: ${cracked}`)
                        // ns.tprint(`ServerRam: ${server.maxRam}`);
                        // ns.tprint(`RequiredHackingLevel: ${server.requiredHackingSkill}`);
                        // ns.tprint(`RequiredPorts: ${server.openPortCount} / ${server.numOpenPortsRequired}`);
                    }
                    if(cracked) {
                        // ns.tprint(`${hostname} cracked successfully`)
                        currentServers.push(hostname)
                    }
                    if(server.purchasedByPlayer) {
                        ownedServers.push(hostname)
                    } else {
                        unownedServers.push(hostname)
                    }
                }
            }   
        }

        if(print) {
            ns.tprint(JSON.stringify(currentServers))
        }
        await ns.write(SERVERS_PATH, JSON.stringify(currentServers), 'w')
        await ns.write(UNOWNED_PATH, JSON.stringify(unownedServers), 'w')
        await ns.write(OWNED_PATH, JSON.stringify(ownedServers), 'w')
        workerServers = ownedServers.filter(s => s !== 'home' || HOME_IS_WORKER !== '')
        await ns.write(WORKERS_PATH, JSON.stringify(workerServers), 'w')
        if(updateSpreaders) {
            const spreadGeneral = workerServers.filter(s => s.match(GENERIC_WORKER_REGEX))
            await ns.write(SPREAD_WORKERS_LIST_PATH, JSON.stringify(spreadGeneral), 'w')
            const spreadWeaken = workerServers.filter(s => s.match(WEAKEN_WORKER_REGEX))
            await ns.write(SPREAD_WEAKEN_WORKERS_LIST_PATH, JSON.stringify(spreadWeaken), 'w')            
        }
        ns.tprint(JSON.parse(ns.read(SERVERS_PATH)))
    } catch (e) {
        ns.tprint(e)
    }
}