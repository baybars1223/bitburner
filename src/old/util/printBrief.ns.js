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
    const logPath = ns.args.length > 0 ? ns.args[0] : 'brief.txt'
    try {
        const servers = JSON.parse(await ns.read('/old/util/servers.txt'))
        ns.tprint(servers)
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
            if(HackingLevel > RequiredHackingLevel || (ns.args.length > 1 && ns.args[1] === '-a')) {
            const readout = 
`
Server: ${Server} ${Cracked ? '(CRACKED)' : ''}
Money: ${formatNumber(Math.floor(MoneyAvailable))} / ${formatNumber(MaxMoney)} (${Math.floor(MoneyAvailable / MaxMoney * 100)}% full)
Security: ${SecurityLevel} (Minimum is ${MinSecurityLevel})
Hacking Level: ${HackingLevel} / ${RequiredHackingLevel}
HackChance: ${Math.floor(HackChance * 100)}%
GrowthRate: ${GrowthRate} GrowTime: ${GrowTime}\n
`
            ns.tprint(readout)
            await ns.write(logPath, readout)
            }
        }
    } catch (e) {
        ns.tprint(e)
    }
}