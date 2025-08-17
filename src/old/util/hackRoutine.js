const OPERATION = 'hack'

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')
	const { hostname } = ns.read('description.txt')
    const target = ns.args[0];
	const threads = ns.args[1];
	while(true) {

		const now = new Date()
		ns.print(`Now: ${now.toLocaleTimeString()}`)
		let duration = ns.getHackTime(target)
		while(duration > 300000) {
			await ns.sleep(60000)
			duration = ns.getHackTime(target)
		}
		ns.print(`Hack will finish in ${ns.tFormat(duration)}`)
		ns.print(`Expected finish time is ${new Date(now.valueOf() + duration).toLocaleTimeString()}`)
		await ns.tryWritePort(1, JSON.stringify({
			server: hostname,
			target,
			operation: OPERATION,
			duration: duration 
		}))
		await ns.hack(target, { threads })
		const sleepTime = 300000
		ns.print(`Sleeping for ${ns.tFormat(sleepTime)}`)
		await ns.sleep(sleepTime)
	}
}