/** @param {NS} ns **/
export async function main(ns) {
    const target = ns.args[0];
	const threads = ns.args[1];
	while(true) {
		ns.print(`Will finish at ${new Date(Date.now() + ns.getWeakenTime(target)).toLocaleTimeString()}`)
		await ns.weaken(target, { threads })
	}
}