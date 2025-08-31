/** @param {NS} ns */
export async function main(ns) {
	let [target, t = null, delay = 0] = ns.args
	const server = ns.getServer(target)

	if(delay !== 0) {
		await ns.sleep(delay * 60 * 1000)
	}
	while(true) {
		let home = ns.getServer()
		let {maxRam, ramUsed} = home
		let availableRam = maxRam - ramUsed

		let scriptCost = ns.getScriptRam('hack.js')
		let threads = t !== null ? t :Math.floor(availableRam / scriptCost)
		let time = Math.ceil(ns.getHackTime(target)) + 100
		ns.exec('hack.js', home.hostname, {threads: threads}, target, threads)
		await ns.sleep(time)
	}
}
