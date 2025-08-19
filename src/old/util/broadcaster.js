const SERVERS_PATH = '/old/lists/serverDescriptions.txt'

class PortMessage {
	/** 
	 * @param {object} data
	 * @param {object} source
	 * @param {string} source.host
	 * @param {string} source.script
	 * @param {string[]} [source.args]
	 */
	constructor(data, source) {
		this.ts = new Date().toLocaleTimeString()
		this.data = typeof data == 'object' ? JSON.stringify(data) : data
		this.source = source
	}
}

class Broadcaster {
	/** @param {NS} ns **/
	constructor(ns, cb, port, interval) {
		this.ns = ns
		this.callback = cb
		this.port = port
		this.interval = interval
	}

	async broadcast (args) {
		this.ns.tprint('hola')
		const [ok, data, source] = this.callback(this.ns, ...args)
		if(ok) {
			await this.ns.writePort(this.port, new PortMessage(data, source))
		}
		await this.ns.sleep(this.interval)
	}
}

/** @param {NS} ns **/
export async function broadcast(ns) {
	

	while(true) {	
		try {
			const servers = JSON.parse(ns.read(SERVERS_PATH))
			testBroadcaster.broadcast(servers)
		} catch (e) {
			ns.tprint(e.message)
			ns.tprint(e.stack)
		} finally {
			await ns.sleep(100)
		}
	}
}

/** @param {NS} ns **/
const testBroadcasterCallback = (ns, servers, target, attributes) => {
	// ns.tprint(`servers:`)
	// ns.tprint(servers)
	// ns.tprint(`target:`)
	// ns.tprint(target)
	// ns.tprint(`attributes:`)
	// ns.tprint(attributes)
	const description = servers.find(s => {ns.tprint(s.hostname); ns.tprint(target); return s.hostname === target})
		ns.tprint(`description:`)
		ns.tprint(description)
	if(!!description) {
		const data = attributes.reduce((acc, cur) => {
			acc[cur] = description[cur]
			return acc
		}, {server: target})
		ns.tprint(`data:`)
		ns.tprint(data)
		return [true, data, { host: 'home', script: = '/old/util/broadcaster.js'}]
	}
	return [false]	
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')
	const [target, attributes, ...args] = ns.args
	const testBroadcaster = new Broadcaster(ns, testBroadcasterCallback, 15, 5000)

	while(true) {	
		try {
			const servers = JSON.parse(ns.read(SERVERS_PATH))
			await testBroadcaster.broadcast([servers, target, attributes, ...args])
		} catch (e) {
			ns.tprint(e.message)
			ns.tprint(e.stack)
		} finally {
			await ns.sleep(100)
		}
	}
}