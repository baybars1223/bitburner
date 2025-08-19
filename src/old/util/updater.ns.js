import {updateHost} from '/old/util/server.ns'

const SERVER_LIST = '/old/lists/servers_unowned.txt'

const LOG_FILE = '/old/logs/updater.txt'

/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args.length > 0 ? ns.args[0] : 'foodnstuff'
	try {
		while(true) {
			const start = Date.now()
			const servers = JSON.parse(await ns.read(SERVER_LIST))
			for(const hostname of servers) {
				await updateHost(ns, target, hostname)
			}
			const end = Date.now()
			const duration = end - start
			const msg = `[${new Date(end).toLocaleString()}] Update Complete. Duration: ${duration}\n`
			await ns.write(LOG_FILE, msg, 'a')
			ns.print(msg)
			await ns.sleep(60000 - duration)
		}
	} catch (e) {
		const msg = e.message || e
		ns.tprint(msg)
		ns.tprint(typeof e)
		ns.tprint(Object.entries(e))
	}

}