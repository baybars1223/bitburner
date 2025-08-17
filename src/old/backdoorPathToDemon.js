/** @param {import(".").NS } ns */
/** @param {NS} ns */
export async function main(ns) {
	let demon = ns.getServer("w0r1d_d43m0n")
	ns.tprint(`Server: ${demon.hostname}`);
	ns.tprint(`MoneyAvailable: ${ns.formatNumber(demon.moneyAvailable)}`);
	ns.tprint(`MaxMoney: ${ns.formatNumber(demon.moneyMax)}`);
	ns.tprint(`Root: ${demon.hasAdminRights}`)
	ns.tprint(`SecurityLevel: ${demon.hackDifficulty}`);
	ns.tprint(`MinSecurityLevel: ${demon.minDifficulty}`);
	ns.tprint(`HackChance: ${ns.hackAnalyzeChance(demon.hostname)}\n\n`);
	ns.tprint(`Cracked: ${demon.hasAdminRights}`)
	ns.tprint(`ServerRam: ${demon.maxRam}`);
	ns.tprint(`RequiredHackingLevel: ${demon.requiredHackingSkill}`);
	ns.tprint(`RequiredPorts: ${demon.openPortCount} / ${demon.numOpenPortsRequired}`);
	ns.tprint(ns.scan("w0r1d_d43m0n"))
	let path = []
	let start = "w0r1d_d43m0n"
	for(let i = 20; i > 0; i-=1) {
		let connections = ns.scan(start)
		if(connections.includes("home")) {
			path.push("home")
			i = 0
		} else {
			path.push(connections[0])
			start = connections[0]
		}
	}
	
	path.reverse()

	for(let host of path) {
		ns.singularity.connect(host)
		await ns.singularity.installBackdoor()
	}
}
