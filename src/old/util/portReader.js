/** @param {NS} ns **/
export async function main(ns) {
	const port = ns.args[0]
	ns.disableLog('sleep')
	// ns.disableLog('readPort')
    while(true) {
		const data = ns.readPort(port)
		if(data != 'NULL PORT DATA') {
			ns.print(data)
		}
		await ns.sleep(100)
	}
}