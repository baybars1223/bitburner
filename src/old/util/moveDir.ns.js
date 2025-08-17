/** @param {NS} ns **/
export async function main(ns) {
	const srcHost = ns.getHostname()
	const srcDir = ns.args[0]
	const targetHost = ns.args[1]

	const files = ns.ls(srcHost, srcDir)
	ns.scp(files, targetHost, srcHost)
}