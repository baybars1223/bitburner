const TARGETS_PATH = '/lists/xweaken-targets.txt'
const WORKER_LIST_PATH = '/lists/xweaken-workerList.txt'

const LOG_FILE = '/logs/spread-weakener.txt'
const ERROR_FILE = '/errors/spread-weakener.txt'

const RAM_SEGMENTS = 1

const WEAKEN_PATH = '/util/weak.ns'
const WEAKEN_COST = 1.75
const WEAKEN_SEGMENTS = 1

const GROW_PATH = '/util/grow.ns'
const GROW_COST = 1.75
const GROW_SEGMENTS = 0

const HACK_PATH = '/util/hackRoutine.js'
const HACK_COST = 1.75
const HACK_SEGMENTS = 0

/** @param {NS} ns **/
export async function main(ns) {
    try {
        await ns.write(ERROR_FILE, '', 'w')
        await ns.write(LOG_FILE, '', 'w')

        const serverList = JSON.parse(await ns.read(TARGETS_PATH))
        const workersList = ns.args.length > 0 ? ns.args : JSON.parse(await ns.read(WORKER_LIST_PATH))
		ns.tprint(serverList)
        ns.tprint(workersList)
        try {
            const targets = serverList.reduce((acc, s) => {
                const canHack =
                    ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(s)
                const needsWeakening = true || ns.getServerMinSecurityLevel(s) / ns.getServerSecurityLevel(s) < 0.95
                // ns.tprint(`${s}: ${canHack}`)
                if (canHack && needsWeakening) {
                    acc.push(ns.getServer(s))
                }
                return acc
            }, [])

			const scannedServers = ns.scan('home')
			ns.tprint(scannedServers)
            for (const w of workersList) {
				if(scannedServers.includes(w) || w === 'home') {
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
						const expensiveOp = Math.max(
							GROW_COST,
							HACK_COST,
							WEAKEN_COST
						)
						const ramAvail = worker.maxRam - worker.ramUsed
						const roundedRamAvailPerTarget = Math.floor(ramAvail / targets.length * 10) / 10
						const ramPerTarget = Math.floor(roundedRamAvailPerTarget * expensiveOp) / expensiveOp
						const ramPerSegment = ramPerTarget / RAM_SEGMENTS
						let logMsg = '\n'
						logMsg += `WORKER:    ${worker.hostname}\n`
						logMsg += `RAM:       ${`${ns.nFormat(ramPerTarget * Math.pow(1000, 3), '0b')} per target`.padEnd(15)} | ${ns.nFormat(ramPerSegment * Math.pow(1000, 3), '0b')}  per segment\n`
						logMsg += `THREADS:   ${`${ns.nFormat(ramPerTarget / expensiveOp, '0')} per target`.padEnd(15)} | ${ns.nFormat(ramPerSegment / expensiveOp, '0')} per segment\n`
						// logMsg += 'RAM CALCULATIONS LOG:\n'
						// logMsg += `\t${ramAvail} = 'const ramAvail = ${worker.maxRam} {{worker.maxRam}} - ${worker.ramUsed} {{worker.ramUsed}}'\n`
						// logMsg += `\t${roundedRamAvailPerTarget} = 'const roundedRamAvailPerTarget = Math.floor(${ramAvail} {{ramAvail}} / ${targets.length} {{targets.length}} * 10) / 10'\n`
						// logMsg += `\t${ramPerTarget} = 'const ramPerTarget = Math.floor(${roundedRamAvailPerTarget} {{roundedRamAvailPerTarget}} * ${expensiveOp} {{expensiveOp}}) / ${expensiveOp} {{expensiveOp}}'\n`

						const targetDescriptions = {}
						let printTargets = targets.length < 10
						logMsg += `TARGET(S): ${!printTargets ? targets.length : ''}\n`
						for (const target of targets) {
							logMsg += printTargets ? `\t${target.hostname}\n` : ''
							const growRam = GROW_SEGMENTS * ramPerSegment
							const weakenRam = WEAKEN_SEGMENTS * ramPerSegment
							const hackRam = HACK_SEGMENTS * ramPerSegment

							const growThreads = Math.floor(growRam / GROW_COST)
							const weakenThreads = Math.floor(
								weakenRam / WEAKEN_COST
							)
							const hackThreads = Math.floor(hackRam / HACK_COST)

							ns.print(
								`\ngrowRam: ${growRam}\nweakenRam:${weakenRam}\nhackRam: ${hackRam}`,
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
							// const growPID = ns.exec(
							// 	GROW_PATH,
							// 	worker.hostname,
							// 	growThreads,
							// 	target.hostname
							// )
							// const hackPID = ns.exec(
							// 	HACK_PATH,
							// 	worker.hostname,
							// 	hackThreads,
							// 	target.hostname
							// )
							targetDescriptions[target.hostname] = {
								weakenPID,
								// growPID,
								// hackPID,
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
        ns.tprint(e.message)
		ns.tprint(e.stack)
        ns.tprint(`Error while attempting to parse json`)
    }
}