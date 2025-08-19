const SCRIPT_PATH = '/old/lib/manager.ns.js'
const DESCRIPTION_PATH = '/old/lib/server.txt'

class ServerDescription {
	/** @param {NS} ns **/
	constructor(ns, host, destination) {
		this.ns = ns
		this.ns.disableLog('ALL')
		this.Server = host
		this.Destination = destination
		console.log(host)
		this.Cracked = ns.hasRootAccess(host)
		this.MoneyAvailable = ns.getServerMoneyAvailable(host)
		this.MaxMoney = ns.getServerMaxMoney(host)
		this.SecurityLevel = ns.getServerSecurityLevel(host)
		this.MinSecurityLevel = ns.getServerMinSecurityLevel(host)
		try {
			this.ServerRam = ns.getServerMaxRam(destination)
			this.UsedRam =ns.getServerUsedRam(destination)
		} catch {
			this.ServerRam = ns.getServerMaxRam(host)
			this.UsedRam =ns.getServerUsedRam(host)
		}
		this.ScriptRam = ns.getScriptRam(SCRIPT_PATH)
		this.HackingLevel = ns.getHackingLevel()
		this.RequiredHackingLevel = ns.getServerRequiredHackingLevel(host)
		this.RequiredPorts = ns.getServerNumPortsRequired(host)
		this.HackChance = ns.hackAnalyzeChance(host)
		this.GrowthRate = ns.getServerGrowth(host)
		this.GrowTime = ns.getGrowTime(host)
	}

	updateRam() {
		try {
			this.ServerRam = this.ns.getServerMaxRam(this.Destination)
			this.UsedRam = this.ns.getServerUsedRam(this.Destination)
		} catch {
			this.ServerRam = this.ns.getServerMaxRam(this.Server)
			this.UsedRam = this.ns.getServerUsedRam(this.Server)
		}
	}

	async write() {
		// this.ns.tprint(this.serialize())
		return this.ns.write(DESCRIPTION_PATH, this.serialize(), 'w')
	}

	async copyToServer(host) {
		return this.ns.scp([SCRIPT_PATH, DESCRIPTION_PATH], host || this.Server, 'home')
	}

	async crack() {
		if(!this.Cracked) {
			try {
				this.ns.brutessh(this.Server)
			} catch (e) {}
			try {
				this.ns.ftpcrack(this.Server)
			} catch (e) {}
			try {
				this.ns.relaysmtp(this.Server)
			} catch (e) {}
			try {
				this.ns.httpworm(this.Server)
			} catch (e) {}
			try {
				this.ns.sqlinject(this.Server)
			} catch (e) {}
			await this.ns.sleep(100)
			this.ns.nuke(this.Server)
		}
	}

	serialize() {
		return JSON.stringify({
			Server: this.Server,
			Cracked: this.Cracked,
			MoneyAvailable: this.MoneyAvailable,
			MaxMoney: this.MaxMoney,
			SecurityLevel: this.SecurityLevel,
			MinSecurityLevel: this.MinSecurityLevel,
			ServerRam: this.ServerRam,
			ScriptRam: this.ScriptRam,
			HackingLevel: this.HackingLevel,
			RequiredHackingLevel: this.RequiredHackingLevel,
			RequiredPorts: this.RequiredPorts,
			HackChance: this.HackChance,
			GrowthRate: this.GrowthRate,
			GrowTime: this.GrowTime,
		})
	}
}

/** @param {NS} ns **/
export async function updateHost(ns, host, destination) {
	ns.disableLog('ALL')
    try {
		const description = new ServerDescription(ns, host, destination)
		await description.write()
		await description.copyToServer(destination)
		const availableRam = description.ServerRam - description.UsedRam
		const threads = Math.floor(availableRam / description.ScriptRam)
		if(!ns.scriptRunning(SCRIPT_PATH, destination) && threads > 0) {
			ns.exec(SCRIPT_PATH, destination, threads)
		}
		return description
	}
    catch (e) {
        ns.tprint(e)
        ns.tprint(e.stack)
        ns.tprint(e.message)
    }
}

/** @param {NS} ns **/
export function describeHost(ns, host) {
	ns.disableLog('ALL')
	return new ServerDescription(ns, host)
}

const crackers = [
	{ exe: 'brutessh', port: 'sshPortOpen'},
	{ exe: 'ftpcrack', port: 'ftpPortOpen'},
	{ exe: 'relaysmtp', port: 'smtpPortOpen'},
	{ exe: 'httpworm', port: 'httpPortOpen'},
	{ exe: 'sqlinject', port: 'sqlPortOpen'}
]
/** 
 * @param {NS} ns 
 * @param {Server} server
 */
export async function crack(ns, server) {
	if(!server.hasAdminRights) {
		if(server.numOpenPortsRequired > server.openPortCount) {
			for(let {exe, port} of crackers) {
				if(!server[port]) {
					try {
						ns[exe](server.hostname)
					} catch (e) {
						if(typeof e == 'string') {
							// ns.tprint(e)
						} else {
							// ns.tprint(e.message)
							// ns.tprint(e.stack)
						}
					}
				}
			}
			await ns.sleep(50)
		}
		ns.nuke(server.hostname)
	}
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL')
    try {
			let x = `foo ${(ns.args)}`;
		ns.tprint()
		const host = ns.args[0]
		return await updateHost(ns, host)
	}
    catch (e) {
        ns.tprint(e.message)
    }
}