/** @param {NS} ns **/
import { describeHost } from '/old/util/server.ns'

export async function main(ns) {
    const hostname = ns.args[0]
    const logPath = ns.args.length > 1 ? ns.args[1] : 'p.txt'
    try {
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
        const readout = 
`
Server: ${Server} ${Cracked ? '(CRACKED)' : ''}
Money: ${Math.floor(MoneyAvailable)} / ${MaxMoney} (${Math.floor(MoneyAvailable / MaxMoney * 100)}% full)
Security: ${SecurityLevel} (Minimum is ${MinSecurityLevel})
Hacking Level: ${HackingLevel} / ${RequiredHackingLevel}
HackChance: ${Math.floor(HackChance * 100)}%
GrowthRate: ${GrowthRate} GrowTime: ${GrowTime}\n
`
        ns.tprint(readout)
        await ns.write(logPath, readout)
    } catch (e) {
        ns.tprint(e)
    }
}