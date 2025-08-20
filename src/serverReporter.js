/** @param {NS} ns */
export async function main(ns) {
	/* array of port numbers for now I think? */
	let clients = []
	let hostData = ""
	let [hostname, port = 0] = ns.args
	if(port === 0) {
		/* lol
		TODO: fix this with service to track and assign ports*/
		port = Math.round((Math.random() * 65534) + 1)
	}
	ns.tprint(`Hostname: ${hostname}\nPort: ${port}`)

	while(true) {
		let portInput
		let spamCounter = 0
		/* TODO: is there a more elegant way to prevent script getting blocked by spammy client? */
		while(spamCounter <= 50) {
			portInput = ns.readPort(port)
			if(portInput !== "NULL PORT DATA" && portInput !== null) {
				let idx = clients.findIndex(client => client === portInput)
				if(idx === -1){
					clients.push(portInput)
				} else {
					let deletedClient = clients.splice(idx, 1)
					ns.writePort(deletedClient, `You have unsubscribed from ${port} (server reports)`)
				}
				spamCounter += 1
			} else {
				spamCounter = 51
			}
		}

		hostData = ns.getServer(hostname)
		for(const client of clients) {
			ns.writePort(client, hostData)
		}
		await ns.sleep(100)
	}
}