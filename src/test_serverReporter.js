/** @param {NS} ns */
export async function main(ns) {
	let [targetPort, myPort = 0] = ns.args
	if(myPort === 0) {
		/* lol
		TODO: fix this with service to track and assign ports*/
		myPort = Math.round((Math.random() * 65534) + 1)
	}
	ns.tprint(`Target Port: ${targetPort}\nMy Port: ${myPort}`)
	ns.writePort(targetPort, myPort)

	while(true) {
		let portInput
		let spamCounter = 0
		/* TODO: is there a more elegant way to prevent script getting blocked by spammy client? */
		while(spamCounter <= 50) {
			portInput = ns.readPort(myPort)
			if(portInput !== "NULL PORT DATA" && portInput !== null) {
				ns.tprint(portInput)
			} else {
				spamCounter = 51
			}
		}

		await ns.sleep(1000)
	}
}