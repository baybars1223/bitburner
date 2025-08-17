const TARGETS_PATH = '/lists/spread-targets.txt'
const WORKER_LIST_PATH = '/lists/spread-workers.txt'

const LOG_FILE = '/logs/spread.txt'
const ERROR_FILE = '/errors/spread.txt'

const RAM_SEGMENTS = 8

const WEAKEN_PATH = '/util/weak.ns'
const WEAKEN_COST = 1.75
const WEAKEN_SEGMENTS = 2

const GROW_PATH = '/util/grow.ns'
const GROW_COST = 1.75
const GROW_SEGMENTS = 5

const HACK_PATH = '/util/hackRoutine.js'
const HACK_COST = 1.75
const HACK_SEGMENTS = 1

/** @param {NS} ns **/
export async function main(ns) {
    try {
        await ns.write(ERROR_FILE, '', 'w')
        await ns.write(LOG_FILE, '', 'w')

        const serverList = JSON.parse(await ns.read(TARGETS_PATH))
        const workersList = JSON.parse(await ns.read(WORKER_LIST_PATH))
        ns.tprint(workersList)
        try {
            const targets = serverList.reduce((acc, s) => {
                const canHack =
                    ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(s)
                const hasMoney = ns.getServerMaxMoney(s)
                // ns.tprint(`${s}: ${canHack}`)
                if (canHack && hasMoney) {
                    acc.push(ns.getServer(s))
                }
                return acc
            }, [])

			const scannedServers = ns.scan('home')
            for (const w of workersList) {
				if(scannedServers.includes(w) || w == 'home') {
					let worker = ns.getServer(w)
					if (worker.maxRam == 0) {
						break
					} else {
						if (w !== 'home') {
							ns.killall(w)
							for (let i = 0; i < 1000; i += 1) {
								worker = ns.getServer(w)
								let usedRam = worker.ramUsed
								ns.print(usedRam)
								if (usedRam !== 0) {
									ns.killall(worker.hostname)
									await ns.sleep(50)
								} else {
									i = 1000
								}
							}
						}
						ns.tprint(worker)
						const expensiveOp = Math.max(
							GROW_COST,
							HACK_COST,
							WEAKEN_COST
						)
						ns.tprint(
							`const ramPerTarget = Math.floor((Math.floor((worker.maxRam - worker.ramUsed) / targets.length / 10) * 10) / expensiveOp) * expensiveOp`
						)
						ns.tprint(
							`const ramPerTarget = Math.floor((Math.floor((${worker.maxRam} - ${worker.ramUsed}) / ${targets.length} / 10) * 10) / ${expensiveOp}) * ${expensiveOp}`
						)
						ns.tprint(
							`const ramPerTarget = Math.floor((${Math.floor(
								(worker.maxRam - worker.ramUsed) /
									targets.length /
									10
							)} * 10) / ${expensiveOp}) * ${expensiveOp}`
						)
						ns.tprint(
							`const ramPerTarget = ${Math.floor(
								(Math.floor(
									(worker.maxRam - worker.ramUsed) /
										targets.length /
										10
								) *
									10) /
									expensiveOp
							)} * ${expensiveOp}`
						)
						const ramPerTarget =
							Math.floor(((worker.maxRam - worker.ramUsed) / targets.length) / expensiveOp) * expensiveOp
						const ramPerSegment = ramPerTarget / RAM_SEGMENTS
						ns.tprint(
							`\nramPerTarget: ${ramPerTarget}\nramPerSegment:${ramPerSegment}`
						)

						const targetDescriptions = {}
						let logMsg = `Worker: ${worker.hostname}\n`
						for (const target of targets) {
							logMsg += `\tTarget: ${target.hostname}\n`
							const growRam = GROW_SEGMENTS * ramPerSegment
							const weakenRam = WEAKEN_SEGMENTS * ramPerSegment
							const hackRam = HACK_SEGMENTS * ramPerSegment

							const growThreads = Math.floor(growRam / GROW_COST)
							const weakenThreads = Math.floor(
								weakenRam / WEAKEN_COST
							)
							const hackThreads = Math.floor(hackRam / HACK_COST)

							ns.print(
								`\ngrowRam: ${growRam}\nweakenRam:${weakenRam}\nhackRam: ${hackRam}`
							)
							ns.print(
								`\ngrowThreads: ${growThreads}\nweakenThreads:${weakenThreads}\nhackThreads: ${hackThreads}`
							)

							const weakenPID = ns.exec(
								WEAKEN_PATH,
								worker.hostname,
								weakenThreads,
								target.hostname
							)
							const growPID = ns.exec(
								GROW_PATH,
								worker.hostname,
								growThreads,
								target.hostname
							)
							const hackPID = ns.exec(
								HACK_PATH,
								worker.hostname,
								hackThreads,
								target.hostname
							)
							targetDescriptions[target.hostname] = {
								weakenPID,
								growPID,
								hackPID,
							}
						}
						ns.tprint(logMsg)
					}
			    }
			}
        } catch (e) {
            ns.tprint('error')
            await ns.write(ERROR_FILE, e, 'a')
            const msg = e.message || e
            ns.tprint(msg)
            await ns.write(ERROR_FILE, msg, 'a')

            if (typeof e == 'object' && e instanceof Error) {
                ns.tprint(e.stack)
            }
            await ns.sleep(10000)
        }
    } catch (e) {
        ns.tprint('error')
        await ns.write(ERROR_FILE, e, 'a')
        await ns.write(ERROR_FILE, '\n', 'a')
        ns.tprint(e)
        ns.tprint(`Error while attempting to parse json`)
    }
}