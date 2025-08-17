import { describeHost } from '/util/server.ns'
const SERVERS_PATH = '/lists/servers.txt'

function formatNumber(num) {
    const endings = ['K', 'M', 'B', 'T']
    let n = num
    let e = ''
    for(let i = 0; i < endings.length; i += 1) {
        if (n > 1000) {
            n = n / 1000
            e = endings[i]
        }
    }
    return `${Math.floor(n * 10) / 10}${e}`.padEnd(6)
}

/** @param {NS} ns **/
export async function main(ns) {
    const logPath = ns.args.length > 0 ? ns.args[0] : 'money.txt'
    try {
        let lines = []
        let readout = '\n'
        const servers = JSON.parse(await ns.read(SERVERS_PATH))
        // ns.tprint(servers)
        for(const hostname of servers) {
            const server = describeHost(ns, hostname)
            const {
                Server,
                Cracked,
                MoneyAvailable,
                MaxMoney,
                SecurityLevel,
                MinSecurityLevel,
                ServerRam,
                ScriptRam,
                HackingLevel,
                RequiredHackingLevel,
                RequiredPorts,
                HackChance,
                GrowthRate,
                GrowTime,
            } = server
            if((HackingLevel >= RequiredHackingLevel || (ns.args.length > 1 && ns.args[1] === '-a')) && MaxMoney > 0) {
                const line = `${Server.padEnd(20)} | ${ (SecurityLevel/MinSecurityLevel === 1 ? ' Weakened ' : `${(Math.floor(SecurityLevel * 100) / 100).toString().padStart(4)} / ${(MinSecurityLevel).toString().padEnd(3)}`).padEnd(11)}| ${RequiredHackingLevel.toString().padStart(4)} Hacking Skill | ${ns.nFormat(ns.hackAnalyzeChance(Server), '0.0%')}\n`
                lines.push({line, sec: SecurityLevel / MinSecurityLevel})
                // readout += `${Server.padEnd(20)} - ${formatNumber(Math.floor(MoneyAvailable))} / ${formatNumber(MaxMoney)} ${`(${Math.floor(MoneyAvailable / MaxMoney * 100)}% full)`.padEnd(11)} | ${Math.floor(GrowTime / 1000 / GrowthRate * 10) / 10}s/growth (${GrowthRate} over ${Math.floor(GrowTime / 1000)}s)\n`
            }
        }
        lines.sort((a,b) => a.sec - b.sec)
        readout = lines.reduce((acc, {line}) => acc + line, readout)
        ns.tprint(readout)
        await ns.write(logPath, readout)
    } catch (e) {
        ns.tprint(e)
    }
}