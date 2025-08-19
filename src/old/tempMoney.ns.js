/** @param {NS} ns **/
import { describeHost } from '/old/util/server.ns'

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

export async function main(ns) {
    const logPath = ns.args.length > 1 ? ns.args[1] : 'money.txt'
    try {
        let lines = []
        let readout = '\n'
        const servers = JSON.parse(await ns.read('/old/util/servers.txt'))
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
            if((HackingLevel >= RequiredHackingLevel || (ns.args.length > 1 && ns.args[1] === '-a')) && MaxMoney > 0 && MaxMoney >= 1000000000) {
                const lp = {
                    name: Server.padEnd(20),
                    available: ns.nFormat(Math.floor(MoneyAvailable), '0a').padStart(4),
                    max: ns.nFormat(MaxMoney, '0.0a').padEnd(6),
                    fullness: `(${Math.floor(MoneyAvailable / MaxMoney * 100)}% full)`.padEnd(11),
                    growRate: `${Math.floor(GrowTime / 1000 / GrowthRate * 10) / 10}s/growth`,
                    growRateLong: `(${GrowthRate} over ${Math.floor(GrowTime / 1000)}s)`,
                    security: `${ns.nFormat(SecurityLevel, '0.0')} / ${ns.nFormat(MinSecurityLevel, '0.0')} (${ns.nFormat(MinSecurityLevel/SecurityLevel, '0.000')})`
                }
                lp.money = `${lp.available} / ${lp.max}`.padEnd(14)
                const line = `${lp.name} | ${lp.money} ${lp.fullness} | ${lp.security} | ${lp.growRate} ${lp.growRateLong}\n`
                lines.push({line, max: MaxMoney, available: MoneyAvailable, fullness: MoneyAvailable / MaxMoney, security: ns.nFormat(SecurityLevel, '0.0')})
                // readout += `${Server.padEnd(20)} - ${formatNumber(Math.floor(MoneyAvailable))} / ${formatNumber(MaxMoney)} ${`(${Math.floor(MoneyAvailable / MaxMoney * 100)}% full)`.padEnd(11)} | ${Math.floor(GrowTime / 1000 / GrowthRate * 10) / 10}s/growth (${GrowthRate} over ${Math.floor(GrowTime / 1000)}s)\n`
            }
        }
        switch(ns.args[0] || 'm') {
            case 'm':
                lines.sort((a,b) => a.max - b.max)
                break
            case 'a':
                lines.sort((a,b) => a.available - b.available)
                break
            case 'f':
                lines.sort((a,b) => a.fullness - b.fullness)
                break
            case 's':
                lines.sort((a,b) => b.security - a.security)
                break
            default:
                lines.sort((a,b) => a.max - b.max)
                break
        }
        readout = lines.reduce((acc, {line}) => acc + line, readout)
        ns.tprint(readout)
        await ns.write(logPath, readout)
    } catch (e) {
        ns.tprint(e)
    }
}