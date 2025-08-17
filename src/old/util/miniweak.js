const LOG_FILE = `/logs/cluster-`
const opts = {
	timeZone: 'CST6CDT',
	hour12: false,
	minute: 'numeric',
	second: 'numeric',
	fractionalSecondDigits: 3
}

const f = (d) => {
	return new Date(d).toLocaleTimeString('en-us', opts)
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')
    const [target, threads, waitUntil = 0, expectedDuration = null, id = 0] = ns.args
	const start = Date.now()
	if(waitUntil > 0) ns.print(`Sleeping until ${new Date(waitUntil).toLocaleTimeString()}...`)
	while(Date.now() < waitUntil) {
		await ns.sleep(0)
	}
	const ranAt = Date.now()
	if(expectedDuration && expectedDuration > 0) ns.print(`Expecting completion at ${new Date(ranAt + expectedDuration).toLocaleTimeString()}...`)
	await ns.weaken(target, { threads })
	const finish = Date.now()
	ns.write(`${LOG_FILE}${target}.txt`, `${id} | WEAK | Diff: ${finish - ranAt - expectedDuration} | Finished: ${f(finish)} | START: ${f(start)} | ATTEMPTED WAIT UNTIL: ${f(waitUntil)} | EXEC: ${f(ranAt)}\n`, 'a')
}