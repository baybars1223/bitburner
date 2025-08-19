const SCRIPT_PATH = '/old/util/moveDir.ns'

/** @param {NS} ns **/
export async function main(ns) {
	const [hostname, num = 0, startAt = '', ] = ns.args
	const scan = ns.scan('home')
	const regex = new RegExp(`^(${hostname}(-\\d+)?)\$`)
	const relevant = scan.filter(s => !!s.match(regex))
	const servers = relevant.map(f => ns.getServer(f))
	servers.sort((a, b) => a.maxRam - b.maxRam)
	const count = Math.min(num, servers.length)
	try {
		for(let i = 0; i < count ; i += 1) {
			let deleted = false
			const killed = ns.killall(servers[i].hostname)
			if(killed) {
				if(ns.getServerUsedRam(servers[i].hostname) === 0) {
					deleted = ns.deleteServer(servers[i].hostname)
				}
			} else {
				deleted = ns.deleteServer(servers[i].hostname)
			}
			ns.tprint(`${servers[i].hostname} deleted: ${deleted}`)
		}
	} catch (e) {
		ns.tprint(e)
	}
	// const numServers = Math.min((num || Math.floor(currentMoney / serverCost)), ns.getPurchasedServerLimit() - ns.getPurchasedServers().length)
	// ns.tprint(`Input of ${num || Math.floor(currentMoney / serverCost)} vs number available of ${ns.getPurchasedServerLimit() - ns.getPurchasedServers().length}`)
	// if(dryrun) {
	// 	ns.tprint(`RAM: ${ns.nFormat(ram,'0,0')}`)
	// 	ns.tprint(`COST: ${ns.nFormat(ns.getPurchasedServerCost(ram),'0.0a')}`)
	// 	ns.tprint(`Would buy ${numServers} for ${ns.nFormat(numServers * serverCost, '0.0a')}`)
	// } else {
	// 	for(let i = 0; i < numServers; i += 1) {
	// 		const host = ns.purchaseServer(hostname, ram)
	// 		for(let j = 0; j < 1000; j += 1) {
	// 			if(ns.scriptRunning(SCRIPT_PATH, 'home')) {
	// 				await ns.sleep(100)
	// 			} else {
	// 				j = 1001
	// 			}
	// 		}
	// 		ns.exec(SCRIPT_PATH, 'home', '1', 'util', host)
	// 	}
	// }
}