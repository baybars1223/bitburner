import {describeHost} from '/old/util/server.ns'

const SERVERS_PATH = '/old/util/servers.txt'
const WORKER_LIST_PATH = '/old/lists/weaken-workerList.txt'
const SERIALIZED_WORKERS_PATH = '/old/lists/weaken-workers.txt'

const LOG_FILE = '/old/logs/weakener.txt'
const ERROR_FILE = '/old/errors/weakener.txt'

const WEAKEN_PATH = '/old/util/weak.ns'
const WEAKEN_COST = 1.75

function replaceWorkerEntry(ns, workers, entry) {
	// ns.tprint(`Entry: ${JSON.stringify(entry)}`)
	const index = workers.findIndex((w) => w.name === entry.name)
	if(index !== -1) {
		workers.splice(index, 1, entry)
	} else {
		if(entry.name) {
			workers.push(entry)
		}
	}
	return workers
}

function findNewTarget(ns, servers) {
	// ns.tprint(`Servers: ${JSON.stringify(servers)}`)
	const entries = servers.filter(({name, security}) => {
		return security !== 1 && security !== null && security !== Infinity && name !== 'n00dles'
	})
	ns.tprint(entries)
	if(entries.length > 0) {
		const filterA = entries.sort((a, b)=> a.securityDiff - b.securityDiff).filter(e => e.current >= e.min + 3)
		const filterB = entries.sort((a, b)=> a.security - b.security)
		let target = ''
		if(filterA.length > 0) {
			target = filterA[0]
		} else {
			target = filterB[0]
		}
		// ns.tprint('\Security Diff Filter:\n')
		// filterA.forEach(e => ns.tprint(e))
		
		// ns.tprint('\Security Filter:\n')
		// filterB.forEach(e => ns.tprint(e))
		if(entries.length > 1) {
			servers.splice(target.idx, 1)
		}
		// ns.tprint(target.name)
		return target.name
	}
	ns.tprint('oops')
	return ''
}

/** @param {NS} ns **/
function weakenNewTarget(ns, worker, servers) {
	const target = findNewTarget(ns, servers)
	ns.print(`${worker.ServerRam} (worker.ServerRam) - ${worker.UsedRam} (worker.UsedRam) = ${worker.ServerRam - worker.UsedRam}`)
	let availableRam = worker.ServerRam - worker.UsedRam
	if (worker.Server == 'home') {
		availableRam = worker.Server == 'home' ? Math.max(availableRam - 62, 0) : availableRam
		if(availableRam > 0) {
			const pid = ns.exec(WEAKEN_PATH, worker.Server, Math.floor(availableRam / WEAKEN_COST), target)
			const script = new SerializedScript({path: WEAKEN_PATH, args: target, pid })
			const updatedWorker = new SerializedWorker(worker.Server, target, 'weakener', script)
			// ns.tprint(`Updated Worker:\n${updatedWorker.serialize()}`)
			return updatedWorker
		}
	} else {
		if(availableRam == 0) {
			ns.killall(worker.Server)
			worker.updateRam()
			availableRam = worker.ServerRam - worker.UsedRam
		}
		const pid = ns.exec(WEAKEN_PATH, worker.Server, Math.floor(availableRam / WEAKEN_COST), target)
		const script = new SerializedScript({path: WEAKEN_PATH, args: target, pid })
		const updatedWorker = new SerializedWorker(worker.Server, target, 'weakener', script)
		// ns.tprint(`Updated Worker:\n${updatedWorker.serialize()}`)
		return updatedWorker
	}
}

class SerializedScript {
	constructor({path, args = [], pid = null}) {
		this.path = path
		this.args = args
		if(pid !== null && (typeof pid).toLowerCase() == 'number') {
			this.pid = pid
		}
	}

	get active() {
		return (typeof this.pid).toLowerCase() == 'number'
	}

	serialize(stringify = false) {
		const script = {
			path: this.path,
			args: this.args,
			...this.pid && { pid: this.pid }
		}
		return stringify ? JSON.stringify(script) : script
	}
}

class SerializedWorker {
	constructor(name, target, type, script = null) {
		this.name = name
		this.target = target
		this.type = type
		this.script = script
	}

	serialize(stringify = true) {
		const worker = {
			name: this.name,
			target: this.target,
			type: this.type,
			script: this.script !== null ? this.script.serialize(false) : {}
		}
		return stringify ? JSON.stringify(worker) : worker
	}
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL')
	try {
		await ns.write(ERROR_FILE, '', 'w')
		await ns.write(LOG_FILE, '', 'w')
		while(true) {
			const start = Date.now()
			const serverList = JSON.parse(await ns.read(SERVERS_PATH))
			const workersList = JSON.parse(await ns.read(WORKER_LIST_PATH))
			let workers = []
			try {
				workers = JSON.parse(await ns.read(SERIALIZED_WORKERS_PATH))
			}
			catch (e) {
				const msg = `Failed to parse ${SERIALIZED_WORKERS_PATH}\n`
				ns.tprint(msg)
				await ns.write(ERROR_FILE, msg, 'a')
			}
			finally {
				try {
					const servers = serverList.reduce((acc, s, idx) => {
						const canHack = ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(s)
						if (canHack) {
							const entry = {
								name: s,
								min: ns.getServerMinSecurityLevel(s),
								current: Math.round(ns.getServerSecurityLevel(s) * 1000) / 1000,
								idx
							}
							entry.security = Math.round(entry.min / entry.current * 1000) / 1000
							entry.securityDiff = Math.round((entry.current - entry.min) * 100000) / 100000
							acc.push(entry)
						}
						return acc
					}, [])

					workers.forEach(({name, target, type, script}) => {
						const worker = describeHost(ns, name)
						ns.print(`Current Worker: {${name}, ${target}, ${type}, ${JSON.stringify(script)}}`)
						let targetServer = null
						try {
							targetServer = servers.find(s => s.name ==target)
						} catch (e) {
							ns.tprint(`Couldn't find server for reason:`)
							ns.tprint(e)
							// ns.tprint(typeof e)
							// ns.tprint(e instanceof Error)
							// ns.tprint(e.stack)
							// const msg = e.message || e
							// ns.tprint(msg)
							// await ns.write(ERROR_FILE, e, 'a')
							// await ns.write(ERROR_FILE, '\n', 'a')
						}
						ns.print(`Current Target Server: ${targetServer === undefined ? 'undefined' : JSON.stringify(targetServer)}`)
						if (type == 'weakener') {
							const hasScript = ns.scriptRunning(WEAKEN_PATH, name)
							if(target === '' || !targetServer) {
								if(hasScript) {
									ns.scriptKill(WEAKEN_PATH, name)
									worker.updateRam()
								}
								const updatedWorker = weakenNewTarget(ns, worker, servers)
								// ns.tprint(`workers1 updatedWorker:\n${JSON.stringify(updatedWorker)}`)
								replaceWorkerEntry(ns, workers, updatedWorker)
							} else if (!hasScript) {
									worker.updateRam()
									const updatedWorker = weakenNewTarget(ns, worker, servers)
									// ns.tprint(`workers2 updatedWorker:\n${JSON.stringify(updatedWorker)}`)
									replaceWorkerEntry(ns, workers, updatedWorker)

							} else {
								if(targetServer.security >= 1 || targetServer.current <= targetServer.min + 3) {
									if(hasScript) {
										ns.scriptKill(WEAKEN_PATH, name)
										worker.updateRam()
									}
									const updatedWorker = weakenNewTarget(ns, worker, servers)
									// ns.tprint(`workers2 updatedWorker:\n${JSON.stringify(updatedWorker)}`)
									replaceWorkerEntry(ns, workers, updatedWorker)
								}
							}
						}
					})

					workersList.filter((name) => workers.findIndex((w) => w.name == name) == -1)
						.forEach((name) => {
							const worker = describeHost(ns, name)
							const hasScript = ns.scriptRunning(WEAKEN_PATH, name)
							if(hasScript) {
								ns.scriptKill(WEAKEN_PATH, name)
								worker.updateRam()
							}
							const updatedWorker = weakenNewTarget(ns, worker, servers)
							// ns.tprint(`workersList updatedWorker:\n${JSON.stringify(updatedWorker)}`)
							replaceWorkerEntry(ns, workers, updatedWorker)
						})
					
					const serialized = workers.reduce((acc, w) => {
						// ns.tprint(w)
						acc.push(w)
						return acc
					}, [])
					await ns.write(SERIALIZED_WORKERS_PATH, JSON.stringify(serialized), 'w')
					const end = Date.now()
					const duration = end - start
					const msg = `[${new Date(end).toLocaleString()}] Update Complete. Duration: ${duration}\n`
					await ns.write(LOG_FILE, msg, 'a')
					ns.print(msg)
					await ns.sleep(15000 - duration)
				}
				catch (e) {
					ns.tprint(`Error during target assignment`)
					ns.tprint(typeof e)
					ns.tprint(e instanceof Error)
					ns.tprint(e.stack)
					const msg = e.message || e
					ns.tprint(msg)
					await ns.write(ERROR_FILE, e, 'a')
					await ns.write(ERROR_FILE, '\n', 'a')

					await ns.sleep(10000)
				}
			}
		}
	} catch (e) {
		ns.tprint(`Error while attempting to parse json`)
		await ns.write(ERROR_FILE, e, 'a')
		await ns.write(ERROR_FILE, '\n', 'a')
		ns.tprint(e)
	}
}