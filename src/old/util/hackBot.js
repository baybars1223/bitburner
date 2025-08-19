/** @type import("..").NS */
let ns = null

const TARGETS_PATH = '/old/lists/spread-targets.txt'

const LOG_FILE = '/old/logs/hackBot.txt'
const ERROR_FILE = '/old/errors/hackBot.txt'

const HACK_PATH = '/old/util/minihack.js'
const HACK_COST = 1.75

/** @param {NS} _ns **/
export async function main(_ns) {
	ns = _ns
    try {
        await ns.write(ERROR_FILE, '', 'w')
        await ns.write(LOG_FILE, '', 'w')
		ns.disableLog('sleep')
		ns.disableLog('getServerMaxMoney')
		ns.disableLog('getServerMoneyAvailable')
		const [retainFree = 0, moneyThreshold = .5] = ns.args
        const serverList = JSON.parse(await ns.read(TARGETS_PATH))
		let botBusyWaitTime = 1000
		let targetDescriptions = {}
        try {
            const targets = serverList.reduce((acc, s) => {
                const canHack = ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(s)
                // const needsWeakening = true || ns.getServerMinSecurityLevel(s) / ns.getServerSecurityLevel(s) < 0.95
                // ns.tprint(`${s}: ${canHack}`)
				targetDescriptions[s] = {
					lastExec: 0,
					loggedInProgressMsg: false,
					loggedGrowingMsg: false,
					pid: 0,
					backoff: 100,
					threads: 0
				}
                if (canHack) {
                    acc.push(ns.getServer(s))
                }
                return acc
            }, [])
			let hbot = ns.getServer()
			let usedRam = hbot.ramUsed
			let ramAvail = hbot.maxRam - hbot.ramUsed - retainFree
			let threadsAvail = Math.floor(ramAvail / HACK_COST)
			while(true) {
				hbot = ns.getServer()
				usedRam = hbot.ramUsed
				ramAvail = hbot.maxRam - hbot.ramUsed - retainFree
				threadsAvail = Math.floor(ramAvail / HACK_COST)
				if(threadsAvail < 1) {
					if(botBusyWaitTime >= 5000) {
						ns.print(`Sleeping until ${new Date(Date.now() + botBusyWaitTime).toLocaleTimeString()}... (${ns.tFormat(botBusyWaitTime)})`)
					}
					await ns.sleep(botBusyWaitTime)
					botBusyWaitTime = Math.max(30000, botBusyWaitTime + 500) 
					continue
				}
				botBusyWaitTime = 1000
				// ns.tprint(ramAvail)
				// ns.tprint(threadsAvail)
				// ns.tprint(hbot)
				targets.sort((a, b) => {
					let money = ns.getServerMoneyAvailable(a.hostname) - ns.getServerMoneyAvailable(b.hostname)
						money = money > 0 ? 1 : money < 0 ? -1 : 0
					let time = ns.getHackTime(a.hostname) - ns.getHackTime(b.hostname)
						time = time > 0 ? 1 : time < 0 ? -1 : 0
					let chance = ns.hackAnalyzeChance(a.hostname) - ns.hackAnalyzeChance(b.hostname)
						chance = chance > 0 ? 1 : chance < 0 ? -1 : 0
					return (time * 0.8) + (chance * 0.8) + (money * 1)
				})
				ns.print(`Sorted as ${JSON.stringify(targets.map(t => t.hostname))}`)
				for (const target of targets) {
					const alreadyHacking = ns.isRunning(HACK_PATH, hbot.hostname, target.hostname)
					const readyForHarvest = ns.getServerMoneyAvailable(target.hostname) / ns.getServerMaxMoney(target.hostname) > moneyThreshold
					// ns.tprint(`${ns.getServerMoneyAvailable(target.hostname)} / ${ns.getServerMaxMoney(target.hostname)} > ${moneyThreshold} = ${readyForHarvest}`)
					let ok = threadsAvail > 0 && !alreadyHacking && readyForHarvest
					// ns.tprint(`${ok} = (${threadsAvail} > 0 && !ns.isRunning(HACK_PATH, hbot.hostname, target.hostname) == ${!ns.isRunning(HACK_PATH, hbot.hostname, target.hostname)})`)
					if(ok) {
						let hackPerThread = ns.hackAnalyze(target.hostname)
						
						const hackThreads = Math.min(threadsAvail, Math.ceil(0.5/hackPerThread))
						const hackRam = hackThreads * HACK_COST

						const hackPID = ns.exec(
							HACK_PATH,
							hbot.hostname,
							hackThreads,
							target.hostname
						)
						if(hackPID) {
							threadsAvail -= hackThreads		
							targetDescriptions[target.hostname].lastExec = Date.now()
							targetDescriptions[target.hostname].pid = 0
							targetDescriptions[target.hostname].threads = hackThreads
							targetDescriptions[target.hostname].loggedInProgressMsg = false
							targetDescriptions[target.hostname].loggedGrowingMsg = false
						}
						// ns.tprint(`Threads After: ${threadsAvail}`)
					} else if (threadsAvail < 1) {
						ns.print(`Skipping '${target.hostname}' because no threads are available`)
						break
					} else if (targetDescriptions[target.hostname] && !targetDescriptions[target.hostname].loggedInProgressMsg){
						ns.print(`It appears that we're already hacking '${target.hostname}'`)
						targetDescriptions[target.hostname].loggedInProgressMsg = true
					} else if (!readyForHarvest && targetDescriptions[target.hostname] && !targetDescriptions[target.hostname].loggedGrowingMsg){
						ns.print(`Waiting for '${target.hostname}' to grow`)
						targetDescriptions[target.hostname].loggedGrowingMsg = true
					}
					await ns.sleep(100)
				}
			}
		} catch (e) {
			ns.tprint(`hackBot Catch block #1`)
			ns.tprint(e.message)
			ns.tprint(e.stack)
		}
	} catch (e) {
			ns.tprint(`hackBot Catch block #2`)
			ns.tprint(e.message)
			ns.tprint(e.stack)
	}
}