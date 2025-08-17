/** @param {NS} ns **/
export async function main(ns) {
	const host = ns.getHostname()
	const dir = ns.args[0]

	const files = ns.ls(host, dir)
	for(const file of files) {
		ns.tprint(ns.rm(file, host))
	}
}