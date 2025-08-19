const LOG_FILE = '/old/logs/hackBot.txt'
const ERROR_FILE = '/old/errors/hackBot.txt'

const GROW_PATH = '/old/util/minigrow.js'
const GROW_COST = 1.75

const WEAK_PATH = '/old/util/miniweak.js'
const WEAK_COST = 1.75

const HACK_PATH = '/old/util/minihack.js'
const HACK_COST = 1.75

/** @param {NS} ns */
function getTimes(ns, { hostname: host }) {
    return {
        hack: Math.ceil(ns.getHackTime(host)),
        grow: Math.ceil(ns.getGrowTime(host)),
        weak: Math.ceil(ns.getWeakenTime(host)),
    }
}

/**
 * @param {Server} host
 * @param {NS} ns
 */
function getThreads(ns, host, percentage) {
    const hack = Math.max(Math.ceil(ns.hackAnalyzeThreads(host.hostname, host.moneyMax * percentage)), 1)
    const grow = calcGrowThreads(ns, host, percentage)
    const hackSec = Math.max(ns.hackAnalyzeSecurity(hack), 0)
    const growSec = Math.max(ns.growthAnalyzeSecurity(grow), 0)
    const secIncrease = Math.max(100 - host.minDifficulty, 0)
    const weak = calcWeakThreads(ns, secIncrease)
    // const fixed = Math.ceil(secIncrease / 0.05)
    // if(fixed == weak) {
    //     ns.tprint(`Weak Thread Simple Calc OK`)
    // } else {
    //     ns.tprint(`${fixed} != ${weak}`)
    // }
    return {
        hack,
        grow,
        weak      
        // weak: fixed       
    }
}

/** @param {NS} ns */
function calcGrowThreads(ns, server, percentage) {
    if(server.moneyMax > 0) {
        let goal = server.moneyMax * percentage
        let threadsFloor = 1
        let threadsCeil
        let multiplier = 1
        let money = 0 
        let currentMoney = (threadsFloor +(1 - percentage) * server.moneyMax)

        for(let i = 0; i < 1000; i += 1) {
            currentMoney = (threadsFloor + (1 - percentage) * server.moneyMax)
            multiplier = server.moneyMax / currentMoney
            threadsCeil = ns.growthAnalyze(server.hostname, multiplier, 1)
            money = currentMoney * multiplier
            const diff = threadsCeil - threadsFloor
            if(threadsFloor >= threadsCeil && money >= goal) {
                if(diff < -2) {
                    threadsFloor -= Math.max(diff + 1, 0)
                } else {
                    return threadsFloor
                }
            }
            // let log = `TF: ${threadsFloor} vs TC: ${threadsCeil} | CM: ${ns.nFormat(currentMoney, '0.0a')} vs PM: ${ns.nFormat(money, '0.0a')} and goal ${ns.nFormat(goal, '0.0a')}`
            // ns.tprint(log)
            threadsFloor += Math.floor(diff / 2) || 1
        }
        return threadsFloor
    }
}

/** @param {NS} ns */
function calcWeakThreads(ns, amount) {
    let goal = amount
    let threadsFloor = 1
    let security = 0

    for(let i = 0; i < 1000; i += 1) {
        security = ns.weakenAnalyze(threadsFloor, 1)
        if(security >= goal) {
            return threadsFloor
        }
        threadsFloor += 1
    }
    return threadsFloor

}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('getServerMaxRam')
    ns.disableLog('getServerUsedRam')
    ns.disableLog('sleep')
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('getServerMoneyAvailable')
    let counter = 0
    const [_target, percentage = .5] = ns.args
    const target = ns.getServer(_target)
    const host = ns.getServer()
    const PIDs = []
    let threadsAvail
    while(true) {
			if(ns.getServerMaxMoney(_target) * .2 > ns.getServerMoneyAvailable(_target)) {
				ns.scriptKill(HACK_PATH, ns.getServer().hostname)
			}
        threadsAvail = Math.floor((ns.getServerMaxRam(host.hostname) - ns.getServerUsedRam(host.hostname)) / Math.max(GROW_COST, HACK_COST, WEAK_COST))
        if(threadsAvail > 0) {
            const times = getTimes(ns, target)
            if(counter % 10 === 0) ns.print(JSON.stringify(times, null, 2))
            const threads = getThreads(ns, target, percentage)
            // ns.tprint(JSON.stringify(threads))
            // ns.tprint(ns.getServerUsedRam(host.hostname))
            if(counter % 10 === 0) ns.print(`(${threadsAvail} > ${threads.weak} + ${threads.grow} + ${threads.hack}) = ${threadsAvail > threads.weak + threads.grow + threads.hack}`)
            if(threadsAvail > threads.weak + threads.grow + threads.hack) {
                const now = Date.now()
                const weakTime = Math.ceil(ns.getWeakenTime(target.hostname))
                ns.exec(
                    WEAK_PATH,
                    host.hostname,
                    threads.weak,
                    target.hostname,
                    threads.weak,
                    0,
                    weakTime,
                    counter
                )
                const weakFinish = weakTime + now
                await ns.sleep(50)

                const growTime = Math.ceil(ns.getGrowTime(target.hostname))
                const growWaitUntil = weakFinish - growTime - 10
                const growP = ns.exec(
                    GROW_PATH,
                    host.hostname,
                    threads.grow,
                    target.hostname,
                    threads.grow,
                    growWaitUntil,
                    growTime,
                    counter
                )
                PIDs.push(growP)
                await ns.sleep(50)
                
                const hackTime = Math.ceil(ns.getHackTime(target.hostname))
                const hackWaitUntil = weakFinish - hackTime - 5
                const hackP = ns.exec(
                    HACK_PATH,
                    host.hostname,
                    threads.hack,
                    target.hostname,
                    threads.hack,
                    hackWaitUntil,
                    hackTime,
                    counter
                )
                // setTimeout(() => {
                //     try {ns.kill(hackP)} catch {}
                // }, times.weak + 10)
                PIDs.push(hackP)

                counter += 1
                await ns.sleep(50)
            } else {
                if(counter % 15 === 0) ns.print(`Awaiting changes...`)
                await ns.sleep(1000)
            }
        } else {
                if(counter % 15 === 0) ns.print(`Awaiting changes...`)
            await ns.sleep(1000)
        }
    }
}