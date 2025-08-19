const SERVERS_PATH = '/old/util/servers.txt'

/** @param {NS} ns **/
export async function main(ns) {
	// if(ns.args.length > 0) {
	if(true) {
		const _serverName = ns.args.shift()
		const _threads = ns.args.length > 0 ? ns.args.shift() : 1
		const servers = _serverName ? [_serverName] : JSON.parse(ns.read(SERVERS_PATH))
		const start = Date.now()
		for(let serverName of servers) {
			let server = ns.getServer(serverName)
			if(server.moneyMax > 0) {
				let player = ns.getPlayer()
				// const before = server.moneyAvailable
				// await ns.grow(serverName, {threads})
				// server = ns.getServer(serverName)
				// const after = server.moneyAvailable
				// ns.print(`\nBefore: ${before}\nAfter: ${after}\n`)
				let goal = server.moneyMax
				let threads = _threads
				let multiplier = 1
				let threadz
				let moneyThreadz = 0 
				let moneyThreads = 0 

				for(let i = 0; i < 1000; i += 1) {
					let log = `\n${serverName}\n`
					log += `  threads: ${threads}\n`
					multiplier = server.moneyMax / threads
					log += `  multiplier: ${multiplier}\n`
					// threads = (server.moneyMax / multiplier) - 1
					threadz = ns.growthAnalyze(serverName, multiplier, 1)
					log += `  threadz: ${threadz}\n`
					moneyThreadz = threadz * multiplier
					log += `  moneyThreadz: ${moneyThreadz}\n`
					moneyThreads = threads * multiplier
					log += `  moneyThreads: ${moneyThreads}\n`
					const diff = threadz - threads
					log += `  diff: ${diff}\n\n`
					if(threads >= threadz && moneyThreads >= goal) {
						if(diff < -2) {
							threads -= Math.max(diff + 1, 0)
						} else {
							ns.tprint(log)
							break
						}
					}
					// threads += diff >= 4000 ? 500 : diff >= 2000 ? 250 : diff >= 1000 ? 100 : diff >= 200 ? 10 : diff >= 100 ? 5: diff >= 50 ? 2 : 1
					threads += Math.floor(diff / 2) || 1
					if(i % 100 === 0) {
						ns.tprint(log)
					}
					// await ns.sleep(10)
				}
				ns.tprint(`${threads} needed to increase server from ${1} to ${server.moneyMax}`)		
				// await ns.sleep(100)
			}
		}
		const end = Date.now()
		ns.tprint(`Duration: ${ns.nFormat(end - start, '0.00')}`)
	}
}