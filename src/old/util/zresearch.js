/** @param {NS} ns */
export async function main(ns) {
	ns.tprint(ns.heart.break())
	let server = ns.getServer("zer0")
	let player = ns.getPlayer()
	// server.moneyAvailable = 0
	server.moneyAvailable = server.moneyMax * .25
	let threads = 1900
	// ns.tprint(`growPercent: ${ns.formatPercent(ns.formulas.hacking.growPercent(server, 1, player, 1))}`)
	// ns.tprint(`growPercent: ${ns.formatPercent(ns.formulas.hacking.growPercent(server, 10, player, 1))}`)
	// ns.tprint(`growPercent: ${ns.formatPercent(ns.formulas.hacking.growPercent(server, 100, player, 1))}`)
	// ns.tprint(`growPercent: ${ns.formatPercent(ns.formulas.hacking.growPercent(server, 1000, player, 1))}`)
	let maxGrowth = ns.formulas.hacking.growPercent(server, threads, player, 1) - 1
	ns.tprint(`maxGrowth: ${maxGrowth}`)
	let singleHack = ns.formulas.hacking.hackPercent(server, player)
	ns.tprint(`maxHackThreads: ${maxGrowth/singleHack}`)
	let xGrowth = ns.formulas.hacking.growPercent(server, threads, player, 1) - 1
	ns.tprint(`maxGrowth: ${maxGrowth}`)
	let xsingleHack = ns.formulas.hacking.hackPercent(server, player)
	ns.tprint(`maxHackThreads: ${maxGrowth/singleHack}`)
	let growth = ns.formulas.hacking.growPercent(server, threads, player, 1)
	ns.tprint(`growPercent: ${growth - 1}`)
	ns.tprint(`${server.moneyMax} / ${growth} = ${server.moneyMax / growth}`)
	let y = 1 -((server.moneyMax / growth) / server.moneyMax)
	ns.tprint(y)
	let z = y / ns.formulas.hacking.hackPercent(server, player)
	ns.tprint(z)
	ns.tprint(`hackPercent: ${ns.formulas.hacking.hackPercent(server, player)}`)
	ns.tprint(`growPercent: ${ns.formatPercent(growth)}`)
	ns.tprint(`growThreads: ${ns.formulas.hacking.growThreads(server, player, server.moneyMax)}`)
	ns.tprint(`hackChance: ${ns.formatPercent(ns.formulas.hacking.hackChance(server, player))}`)
	// ns.tprint(`hackExp: ${ns.formulas.hacking.hackExp(server, player)}`)
	ns.tprint(`hackPercent: ${ns.formatPercent(ns.formulas.hacking.hackPercent(server, player))}`)
	ns.tprint(`weakenTime: ${ns.tFormat(ns.formulas.hacking.weakenTime(server, player))}`)
	ns.tprint(`growTime: ${ns.tFormat(ns.formulas.hacking.growTime(server, player))}`)
	ns.tprint(`hackTime: ${ns.tFormat(ns.formulas.hacking.hackTime(server, player))}`)
  ns.tprint(`weakenAnalyze: ${ns.weakenAnalyze(1)}`)
	ns.tprint(`hackAnalyzeSecurity: ${ns.hackAnalyzeSecurity(88, server.hostname)}`)
	ns.tprint(`growthAnalyzeSecurity: ${ns.growthAnalyzeSecurity(threads, server.hostname)}`)
}