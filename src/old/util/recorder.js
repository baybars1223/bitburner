const SERVERS_PATH = '/lists/serverDescriptions.txt'

/** @param {NS} ns **/
export async function main(ns) {
	while(true) {	
		try {
			const detectedHosts = ns.scan('home')
			const descriptions = detectedHosts.map(h => ns.getServer(h))
			await ns.write(SERVERS_PATH, JSON.stringify(descriptions), 'w')
			// ns.tprint(JSON.parse(ns.read(SERVERS_PATH)))
		} catch (e) {
			ns.tprint(e)
		} finally {
			await ns.sleep(100)
		}
	}
}