/** @param {NS} ns **/
export async function main(ns) {
	let count = ns.hacknet.numNodes()
	let maxCores = count * 16
	let currentCores = 0
	while(currentCores < maxCores) {
		for(let i = 0; i < count; i += 1) {
			ns.hacknet.upgradeCore(i, 1)
		}
		await ns.sleep(30000)
	}
}