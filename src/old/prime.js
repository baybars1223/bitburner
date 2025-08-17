/** @param {NS} ns **/
export async function main(ns) {
	await ns.sleep(2000)
	while(true) {
		if(!ns.isBusy()) {
			ns.commitCrime('Homicide')
		}
		await ns.sleep(500)
	}
}