const HACK_START = 'hack_start'
const HACK_WAIT = 'hack_wait'
const HACK_END = 'hack_end'

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')
	const { hostname } = ns.read('description.txt')
    const [target, threads, wait = 0, id = 0] = ns.args
	await ns.sleep(wait)
	const now = new Date()
	let duration = ns.getHackTime(target)
	let attempts = 0
	while(duration > 300000) {
		attempts += 1
		await ns.tryWritePort(2, JSON.stringify({
			server: hostname,
			target,
			attempts,
			operation: HACK_WAIT
		}))
		await ns.sleep(30000)
		duration = ns.getHackTime(target)
	}
	ns.print(`Hack will finish in ${ns.tFormat(duration)}`)
	ns.print(`Expected finish time is ${new Date(now.valueOf() + duration).toLocaleTimeString()}`)
	await ns.tryWritePort(2, JSON.stringify({
		server: hostname,
		target,
		operation: HACK_START,
		duration: duration 
	}))
	const money = await ns.hack(target, { threads })
	await ns.tryWritePort(2, JSON.stringify({
		server: hostname,
		target,
		stole: ns.nFormat(money, '0.0m'),
		operation: HACK_END,
		endTime: new Date().toLocaleTimeString() 
	}))
}