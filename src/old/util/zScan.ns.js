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

const WEAKEN_WORKER_REGEX = _WEAKEN_WORKER_REGEX

/**
 * @param {NS} ns
 */
export async function main(ns) {
    const [ updateSpreaders = true ] = ns.args
    let newServers = await sub(ns, 'home')
    ns.tprint(JSON.stringify(newServers, null, 4))
    // TODO: Needs a reduce, nested objects, not arrays
    const currentServers = newServers.map(({name}) => name)
    await ns.write(SERVERS_PATH, JSON.stringify(currentServers), 'w')
    const servers = newServers.map(({name}) => ns.getServer(name))
    const owned = servers.filter(/** @param {Server} s */ s => s.purchasedByPlayer).map(s => s.hostname)
    await ns.write(OWNED_PATH, JSON.stringify(owned), 'w')
    const unowned = servers.filter(/** @param {Server} s */ s => !s.purchasedByPlayer).map(s => s.hostname)
    await ns.write(UNOWNED_PATH, JSON.stringify(unowned), 'w')
    const workerServers = owned.filter(s => s !== 'home' || HOME_IS_WORKER !== '')
    await ns.write(WORKERS_PATH, JSON.stringify(workerServers), 'w')
    if(updateSpreaders) {
        const spreadGeneral = workerServers.filter(s => s.match(GENERIC_WORKER_REGEX))
        await ns.write(SPREAD_WORKERS_LIST_PATH, JSON.stringify(spreadGeneral), 'w')
        const spreadWeaken = workerServers.filter(s => s.match(WEAKEN_WORKER_REGEX))
        await ns.write(SPREAD_WEAKEN_WORKERS_LIST_PATH, JSON.stringify(spreadWeaken), 'w')            
    }
    ns.tprint(JSON.parse(ns.read(SERVERS_PATH)))
}

/**
 * @param {NS} ns
 * @param {Array} out
 */
async function sub(ns, parent) {
    const children = ns.scan(parent)
    if(parent !== 'home') children.shift()
    const newHosts = []
    for(let child of children) {
        if(!newHosts.includes(child)) {
            let ok = await tryCrack(ns, child)
            if(ok) {
                const c = await sub(ns, child)
                newHosts.push({ 
                    name: child, 
                    // children: c
                })
                newHosts.push(...c)
            }
        }
    }
    return newHosts
}

/**
 * @param {NS} ns
 */
async function tryCrack(ns, hostname) {
    let server = ns.getServer(hostname)
    if(!server.hasAdminRights) {
        try {
            await crack(ns, server)
            return tryCrack(ns, hostname)
        } catch (e) {
            ns.tprint(`${server.hostname} isn't weak enough to nuke yet. ${server.openPortCount}/${server.numOpenPortsRequired} ports opened.`)
            return false
        }
    } else {
        return true
    }
}

/** @param {import(".").NS } ns */
export async function main2(ns) {
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
            ns.tprint(`i: ${i} VS len: ${currentServers.length}`)
            const hostname = currentServers[i]
            ns.tprint(hostname)
            const detectedHosts = ns.scan(hostname, true)
            if(print) {
                ns.tprint(`Current: ${hostname} Parent: ${detectedHosts.slice(0,1)}\n\t\tChildren: ${detectedHosts.length > 1 ? '\n\t\t--- ' + detectedHosts.slice(1).join('\n\t\t--- ') : 'None'}`)
            }
            for(const hostname of detectedHosts) {
                ns.tprint(hostname)
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
                    if(print) {
                        ns.tprint(`Server: ${server.hostname}`);
                        ns.tprint(`Cracked: ${cracked}`)
                        ns.tprint(`Root: ${server.hasAdminRights}`)
                        ns.tprint(`MoneyAvailable: ${server.moneyAvailable}`);
                        ns.tprint(`MaxMoney: ${server.moneyMax}`);
                        ns.tprint(`SecurityLevel: ${server.hackDifficulty}`);
                        ns.tprint(`MinSecurityLevel: ${server.minDifficulty}`);
                        ns.tprint(`ServerRam: ${server.maxRam}`);
                        ns.tprint(`RequiredHackingLevel: ${server.requiredHackingSkill}`);
                        ns.tprint(`RequiredPorts: ${server.openPortCount} / ${server.numOpenPortsRequired}`);
                        ns.tprint(`HackChance: ${ns.hackAnalyzeChance(server.hostname)}\n\n`);
                    }
                    if(cracked) {
                        ns.tprint(`${hostname} cracked successfully`)
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