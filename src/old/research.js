/** @param {NS} ns */
export async function main(ns) {
	const [_server = "zer0", _threads = null, verbose = false, cores = 1] = ns.args
	let server = ns.getServer(_server)
	let player = ns.getPlayer()
	if(verbose) ns.tprint(`hackChance: ${ns.formatPercent(ns.formulas.hacking.hackChance(server, player))}`)

	// server.moneyAvailable = 0
	// server.moneyAvailable = server.moneyMax * .25

	let growThreads = _threads || ns.formulas.hacking.growThreads(server, player, server.moneyMax, cores)
	
	if(verbose) ns.tprint(`Ideal Grow Threads: ${ns.formulas.hacking.growThreads(server, player, server.moneyMax)}`)
	if(verbose) ns.tprint(`Proposed Grow Threads: ${growThreads}`)
	
	let growthPercent = ns.formulas.hacking.growPercent(server, growThreads, player, cores)
	let hackPercent = ns.formulas.hacking.hackPercent(server, player)
	
	if(verbose) ns.tprint(`growthPercent: ${ns.formatPercent(growthPercent)}`)

	let growFrom = (server.moneyMax / growthPercent)
	if(verbose) ns.tprint(`\$${ns.formatNumber(server.moneyMax, 2)} / ${ns.formatPercent(growthPercent,3)} = Replenish from \$${ns.formatNumber(growFrom, 2)} to full`)
	
	let growTime = ns.formulas.hacking.growTime(server, player)
	let hackTime = ns.formulas.hacking.hackTime(server, player)
	let weakenTime = ns.formulas.hacking.weakenTime(server, player)
	let growHackRatio = growTime / hackTime
	let weakenGrowRatio = weakenTime / growTime
	if(verbose) ns.tprint(`growHackRatio: ${growHackRatio}`)

	let canHackUpTo = 1 -(growFrom / server.moneyMax)
	if(verbose) ns.tprint(`canHackUpTo: ${ns.formatPercent(canHackUpTo, 2)}`)


	if(verbose) ns.tprint(`hackPercent: ${ns.formatPercent(hackPercent)}`)
	let hackThreadsTotal = canHackUpTo / hackPercent
	if(verbose) ns.tprint(`hackThreadsTotal: ${hackThreadsTotal}`)
	let hackThreadsInRatio = hackThreadsTotal/growHackRatio
	if(verbose) ns.tprint(`hackThreadsInRatio: ${hackThreadsInRatio}`)


	let weakenPower = ns.weakenAnalyze(1, cores)
  if(verbose) ns.tprint(`baseWeakenPower: ${weakenPower}`)
	let hackSecurityEffect = ns.hackAnalyzeSecurity(hackThreadsTotal)
	let growSecurityEffect = ns.growthAnalyzeSecurity(growThreads)
	if(verbose) ns.tprint(`hackSecurityEffect: ${hackSecurityEffect}`)
	if(verbose) ns.tprint(`growSecurityEffect: ${growSecurityEffect}`)
	
	let weakenThreads = (hackSecurityEffect + growSecurityEffect) / weakenPower
	if(verbose) ns.tprint(`weakenThreads: ${weakenThreads}`)
	if(verbose) ns.tprint(`weakenGrowRatio: ${weakenGrowRatio}`)
	let weakenThreadsInRation = weakenThreads * weakenGrowRatio
	if(verbose) ns.tprint(`weakenThreadsInRation: ${weakenThreadsInRation}`)

	let paddedGrowThreads = Math.floor(growThreads * 1.1)
	let paddedWeakenThreads = Math.floor(weakenThreadsInRation * 1.1)
	let hedgedHackThreads = Math.floor(hackThreadsInRatio * .9)

	let totalThreads = paddedGrowThreads + paddedWeakenThreads + hedgedHackThreads

	ns.tprint(
		`
${totalThreads} threads total
Commands:

run util/grow.ns.js -t ${paddedGrowThreads} ${server.hostname};
run util/hack.ns.js -t ${Math.floor(hackThreadsInRatio * .9)} ${server.hostname};
run util/weak.ns.js -t ${Math.floor(weakenThreadsInRation * 1.1)} ${server.hostname};
		`
	)
}