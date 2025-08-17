/** @param {NS} ns **/
export async function main(ns) {
    const target = ns.args[0];
	const threads = ns.args[1];
	while(true) {
		ns.print(`Will finish at ${new Date(Date.now() + ns.getGrowTime(target)).toLocaleTimeString()}`)
		await ns.grow(target, { threads, stock: true })
	}
}