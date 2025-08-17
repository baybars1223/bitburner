const LISTS = [
    "allServers.txt",
    "serverDescriptions.txt",
    "servers.txt",
    "servers_owned.txt",
    "servers_unowned.tx",
    "servers_workers.txt",
    "spread-targets.txt",
    "spread-workers.txt",
    "weaken-workerList.txt",
    "weaken-workers.txt"
]

const PROGRAMS = [
    { name: "BruteSSH.exe", cost: 0 },
    { name: "FTPCrack.exe", cost: 0 },
    { name: "ServerProfiler.exe", cost: 500e3 },
    { name: "DeepscanV1.exe", cost: 500e3 },
    { name: "relaySMTP.exe", cost: 5e6 },
    { name: "AutoLink.exe", cost: 1e6 },
    { name: "HTTPWorm.exe", cost: 30e6 },
    { name: "DeepscanV2.exe", cost: 25e6 },
    { name: "SQLInject.exe", cost: 250e6 },
    { name: "Formulas.exe", cost: 5e9 }
]

/** @param {NS} ns **/
export async function main(ns) {
    const [all = false] = ns.args
    for(let list of LISTS) {
		ns.rm(`/lists/${list}`)
	}
    const player = ns.getPlayer()
    let funds = player.money
    if(funds > 2e5) {
        ns.singularity.purchaseTor()
        for(let program of PROGRAMS) {
            if(funds > program.cost && (all || funds / 5 > program.cost)) {
                ns.singularity.purchaseProgram(program.name)
                funds -= program.cost
            }
        }
    }
}