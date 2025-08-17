import {describeHost} from '/util/server.ns'

const SERVERS_PATH = '/util/servers.txt'
const WORKER_LIST_PATH = '/util/workerList.txt'
const SERIALIZED_WORKERS_PATH = '/util/workers.txt'

const LOG_FILE = '/logs/weakener-logs.txt'
const ERROR_FILE = '/logs/weakener-errors.txt'

const WEAKEN_PATH = '/util/weak.ns'
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
	const entries = Object.entries(servers).filter(([s, {security}]) => security !== null && s !== 'n00dles')
	if(entries.length > 0) {
		entries.sort(([a, asec], [b, bsec])=> asec.security - bsec.security)
		// ns.tprint(`Sorted Entries: ${JSON.stringify(entries)}`)
		const target = entries[0][0]
		if(entries.length > 1) {
			delete servers[entries[0][0]]
		}
		return target
	}
	return ''
}

/** @param {NS} ns **/
function weakenNewTarget(ns, worker, servers) {
	const target = findNewTarget(ns, servers)
	// ns.tprint(`target: ${target}`)
	const availableRam = worker.ServerRam - worker.UsedRam
	if(availableRam == 0) {
		ns.killall(worker.ServerRam)
		worker.updateRam()
	}
	const pid = ns.exec(WEAKEN_PATH, worker.Server, Math.floor(availableRam / WEAKEN_COST), target)
	const script = new SerializedScript({path: WEAKEN_PATH, args: target, pid })
	const updatedWorker = new SerializedWorker(worker.Server, target, 'weakener', script)
	// ns.tprint(`Updated Worker:\n${updatedWorker.serialize()}`)
	return updatedWorker
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
				await ns.write(ERROR_FILE, msg, 'a')
				ns.tprint(msg)
			}
			finally {
				try {
					const servers = serverList.reduce((acc, s) => {
						const canHack = ns.getHackingLevel() > ns.getServerRequiredHackingLevel(s)
						if (canHack) {
							acc[s] = {
								security: ns.getServerMinSecurityLevel(s) / ns.getServerSecurityLevel(s)
							}
						}
						return acc
					}, {})

					workers.forEach(({name, target, type, script}) => {
						const worker = describeHost(ns, name)
						if (type == 'weakener') {
							const hasScript = ns.scriptRunning(WEAKEN_PATH, name)
							if(target === '' || !servers[target]) {
								if(hasScript) {
									ns.scriptKill(WEAKEN_PATH, name)
									worker.updateRam()
								}
								const updatedWorker = weakenNewTarget(ns, worker, servers)
								// ns.tprint(`workers1 updatedWorker:\n${JSON.stringify(updatedWorker)}`)
								replaceWorkerEntry(ns, workers, updatedWorker)
							} else {
								if(servers[target].security >= 1) {
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
					await ns.write(ERROR_FILE, e, 'a')
					const msg = e.message || e
					ns.tprint(msg)
					
					if(typeof e == 'object' && e instanceof Error) {
						ns.tprint(e.stack)
					}
					await ns.sleep(10000)
				}
			}
		}
	} catch (e) {
		await ns.write(ERROR_FILE, e, 'a')
		await ns.write(ERROR_FILE, '\n', 'a')
		ns.tprint(e)
		ns.tprint(`Error while attempting to parse json`)
	}
}