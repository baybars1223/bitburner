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
	ns.disableLog('getServerMoneyAvailable')
    const [target, threads, waitUntil = 0, expectedDuration = null, id = 0] = ns.args
	const start = Date.now()
	if(waitUntil > 0) ns.print(`Sleeping until ${new Date(waitUntil).toLocaleTimeString()}...`)
	while(Date.now() < waitUntil) {
		await ns.sleep(0)
	}
	// const sec = Math.floor(ns.getServerSecurityLevel(target))
	// const min = ns.getServerMinSecurityLevel(target)
	// if(sec !== min) {
	// 	ns.tprint(`Oops, security desync: ${sec} / ${min}`)
	// }
	const ranAt = Date.now()
	// const desiredEnd = waitUntil + expectedDuration
	// const predictedEnd = Date.now() + expectedDuration
	// if(expectedDuration && predictedEnd <= desiredEnd + 10) {
	ns.print(`Current money for ${target} is ${ns.formatNumber(ns.getServerMoneyAvailable(target),6)}`)
	await ns.grow(target, { threads, stock: true })
	ns.print(`Current money for ${target} is ${ns.formatNumber(ns.getServerMoneyAvailable(target),6)}`)
	// ns.tprint(`Current money for ${target} is ${ns.formatNumber(ns.getServerMoneyAvailable(target),1)} (after grow)`)
	const finish = Date.now()
	ns.write(`${LOG_FILE}${target}.txt`, `${id} | GROW | Diff: ${finish - ranAt - expectedDuration} | Finished: ${f(finish)} | START: ${f(start)} | ATTEMPTED WAIT UNTIL: ${f(waitUntil)} | EXEC: ${f(ranAt)}\n`, 'a')
	// } else {
	// 	// await ns.write(`${LOG_FILE}${target}.txt`, `${id} | GROW | Gap: ${ns.tFormat(predictedEnd - desiredEnd, true)} \n`, 'a')
	// 	ns.tprint(`SKIP GROW | ${id} | Gap: ${ns.tFormat(predictedEnd - desiredEnd, true)}`)
	// }
}