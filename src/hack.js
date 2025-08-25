/** @param {NS} ns */
export async function main(ns) {
	const [target, threads = 1] = ns.args
	return ns.hack(target, {threads})
}