/** @param {NS} ns */
export async function main(ns) {
	const [hostname] = ns.args
	let files = [...ns.ls('home', 'util'), ...ns.ls('home', 'lists'), "clusterMKI.js"]
	ns.scp(files, hostname, 'home')
}