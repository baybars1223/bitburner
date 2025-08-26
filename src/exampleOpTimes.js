/** @param {NS} ns */
export async function main(ns) {
    const [target = 'rho-construction', threads = 1] = ns.args;
    let server = ns.getServer(target);
    let player = ns.getPlayer();
		let home = ns.getServer()
    // ns.tprint(server)
    let str = '\n';
    str += `cur(${server.hackDifficulty}):${ns.formatNumber(ns.formulas.hacking.hackTime(server, player) / 1000, 1)}\n`;
    server.hackDifficulty = server.minDifficulty;
    str += `min(${server.hackDifficulty}):${ns.formatNumber(ns.formulas.hacking.hackTime(server, player) / 1000, 1)}\n`;
    for (let i = 1; i <= 10; i += 1) {
        server.hackDifficulty = i * 2.5;
        let hTime = ns.formatNumber(ns.formulas.hacking.hackTime(server, player) / 1000, 1);
        let gTime = ns.formatNumber(ns.formulas.hacking.growTime(server, player) / 1000, 1);
        let wTime = ns.formatNumber(ns.formulas.hacking.weakenTime(server, player) / 1000, 1);
				let gAmount = ns.formatNumber(ns.formulas.hacking.growAmount(server, player, threads, home.cpuCores), 1)
				let wAmount = ns.weakenAnalyze(threads, home.cpuCores)
				// let g = ns.formulas.hacking.g

        str += `${server.hackDifficulty}:\tHack: ${hTime} Grow: ${gTime} Weaken: ${wTime}\n`;
        str += `\tGrow: ${gAmount} Weaken: ${wAmount}\n`;
        // str += `\tg/h: ${ns.formatNumber(gTime/hTime, 1)} w/h: ${ns.formatNumber(wTime/hTime, 1)} w/g: ${ns.formatNumber(wTime/gTime, 1)}\n`
        // str += `${server.hackDifficulty}:\tHack: ${hTime} Grow: ${gTime} Weaken: ${wTime}\n\tg/h: ${ns.formatNumber(gTime/hTime, 1)} w/h: ${ns.formatNumber(wTime/hTime, 1)} w/g: ${ns.formatNumber(wTime/gTime, 1)}\n`
    }
    ns.tprint(str);
}