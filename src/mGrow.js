/** @param {NS} ns */
export async function main(ns) {
	let [target, t = null] = ns.args
	const server = ns.getServer(target)

	while(true) {
		let home = ns.getServer()
		let {maxRam, ramUsed} = home
		let availableRam = maxRam - ramUsed - 5.05

		let scriptCost = ns.getScriptRam('grow.js')
		let threads = t !== null ? t :Math.floor(availableRam / scriptCost)
		// ns.tprint(threads)
		let time = Math.ceil(ns.getGrowTime(target)) + 100
		ns.exec('grow.js', home.hostname, {threads: threads - 1}, target, threads -1)
		await ns.sleep(time)
	}
}