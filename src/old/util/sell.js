const SCRIPT_PATH = '/util/moveDir.ns'

/** @param {NS} ns **/
export async function main(ns) {
	const [hostname, num = 0, startAt = '', ] = ns.args
	try {
		const killed = ns.killall(hostname)
		if(killed) {
			if(ns.getServerUsedRam(hostname) === 0) {
				deleted = ns.deleteServer(hostname)
			}
		} else {
			deleted = ns.deleteServer(hostname)
		}
		ns.tprint(`${hostname} deleted: ${deleted}`)
	} catch (e) {
		ns.tprint(e)
	}
}