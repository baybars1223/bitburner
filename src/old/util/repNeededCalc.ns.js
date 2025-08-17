/** @param {NS} ns **/
export async function main(ns) {
	const targetFavor = ns.args[0]
	let rep = ns.args[1] || 0
	let favor = Math.floor(Math.log((rep + 25000) / 25500) / Math.log(1.02) + 1);
	while(favor < targetFavor) {
		rep += 1000
		favor = Math.floor(Math.log((rep + 25000) / 25500) / Math.log(1.02) + 1);
	}
	ns.tprint(`Need ~${ns.nFormat(Math.floor(rep), '0.0a')} reputation for ${favor} favor`)
}