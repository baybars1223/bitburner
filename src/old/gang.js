//#region Global Defs
const NAMES_LIST_PATH = '/old/lists/gangMemberNames.txt'
const EQUIPMENT_PATH = '/old/lists/gangEquipment.txt'

const STR = 'str'
const DEF = 'def'
const DEX = 'dex'
const AGI = 'agi'
const CHA = 'cha'
const HACK = 'hack'

const ALL_STATS = [
    STR,
    DEF,
    DEX,
    AGI,
    CHA,
    HACK,
]

const COMBAT_STATS = ALL_STATS.slice(0, -2)

let namesList = []

const ALL_AUGMENTS = [
    "Bionic Arms",
    "Bionic Legs",
    "Bionic Spine",
    "BrachiBlades",
    "Nanofiber Weave",
    "Synthetic Heart",
    "Synfibril Muscle",
    "Graphene Bone Lacings",
    "BitWire",
    "Neuralstimulator",
    "DataJack"
]

const COMBAT_AUGMENTS = ALL_AUGMENTS.slice(0, -3)
const HACKING_AUGMENTS = ALL_AUGMENTS.slice(-3)


//#endregion

//#region Recruit
/** @param {NS} ns **/
const tryRecruit = (ns, names) => {
    if(names.length > 0) {
        const name = names.shift()
        let ok = ns.gang.recruitMember(name)
        if(!ok) {
            return tryRecruit(ns, names)
        }
        return {ok, name}
    } else {
        ns.tprint('Out of names...')
    }

}

/** @param {NS} ns **/
const recruit = (ns, num = 50) => {
    namesList = JSON.parse(ns.read(NAMES_LIST_PATH))
    ns.tprint(namesList.length)
    ns.tprint(JSON.stringify(namesList))
    namesList.sort((a,b) => {
        let rng = Math.random() - Math.random()
        return rng > 0 ? 1 : rng == 0 ? 0 : -1
    })
    ns.tprint(JSON.stringify(namesList))
    let canRecruit = ns.gang.canRecruitMember()
    ns.tprint(`Can Recruit: ${canRecruit}`)
    if(canRecruit) {
        for(let i = 0; i < num; i+= 1) {
            let {ok, name} = tryRecruit(ns, namesList)
            canRecruit = ns.gang.canRecruitMember()
            if(ok) {
                ns.tprint(`Recruited ${name}`)
            } else {
                i = 1000000
            }
        }
    }
}
//#endregion

// //#region Print Status
// /** @param {NS} ns **/
// const status = (ns) => {
//     ns.tprint(JSON.stringify(ns.gang.getGangInformation(), null, 2))
//     ns.tprint(JSON.stringify(ns.gang.getOtherGangInformation(), null, 2))
//     let memberReadout = ''
//     loopMembers(ns, (member) => {
//         memberReadout += `\n${JSON.stringify(member, null, 1)}`
//     })
//     ns.tprint(memberReadout)
//     ns.tprint(JSON.stringify(ns.gang.getEquipmentNames(), null, 2))
// }
// //#endregion

//#region Augment


/** 
 * @param {NS} ns 
 * @param {"combat"|"hacking"|"all"} cat
 */
const augmentAll = (ns, cat = 'all') => {
    let augs = cat === 'combat' ? COMBAT_AUGMENTS :
               cat === 'hacking' ? HACKING_AUGMENTS :
               cat === 'all' ? ALL_AUGMENTS : []
    let augments = augs.map(name => {
        return {
            name,
            cost: ns.gang.getEquipmentCost(name)
        }
    }).sort((a,b) => a.cost - b.cost)
    // ns.tprint(JSON.stringify(augments, null, 2))
    for(const aug of augments) {
        loopMembers(ns, (member) => {
                ns.gang.purchaseEquipment(member.name, aug.name)
        })
    }
}

//#endregion


//#region Upgrade
/** @param {NS} ns **/
const upgradeAll = (ns, upgradeType = 'Rootkits', upgradeTier = 0) => {
    let equipment = null
    try {
        equipment = JSON.parse(ns.read(EQUIPMENT_PATH))
    } catch {
        ns.tprint(`Failed to parse ${EQUIPMENT_PATH}`)
    }

    if(!!equipment) {
        /** @param {GangMemberInfo} member **/
        /** @param {NS} ns **/
        loopMembers(ns, (member) => {
            upgrade(ns, member, upgradeType, upgradeTier, equipment)
        })
    }
}

/** @param {GangMemberInfo} member **/
/** @param {NS} ns **/
const upgrade = (ns, member, type, _tier, _equipment = null) => {
    let equipment = {}
    try {
        equipment = _equipment !== null ? _equipment : JSON.parse(ns.read(EQUIPMENT_PATH))
    } catch {
        ns.tprint(`Failed to parse ${EQUIPMENT_PATH}`)
    }
    const tier = Math.min(_tier, equipment[type].length - 1)
    ns.tprint(`Type: ${type} | Tier: ${tier}`)
    for(let i = 0; i <= tier; i += 1) {
        const gear = equipment[type][i]
        if(member.upgrades.includes(gear)) {
            ns.tprint(`Member ${member.name} already has ${gear}`)
        } else {
            const ok = ns.gang.purchaseEquipment(member.name, gear)
            const msg = `'${member.name}' ${gear} (${type}, ${tier})`
            ns.tprint(ok ? `Bought ${msg}` : `Couldn't buy ${msg}`)
        }
    }
}

//#endregion

//#region Ascend
/** @param {NS} ns **/
const ascend = (ns, upgrades) => {
    let equipment = null
    try {
        equipment = JSON.parse(ns.read(EQUIPMENT_PATH))
    } catch {
        ns.tprint(`Failed to parse ${EQUIPMENT_PATH}`)
    }

    const memberNames = ns.gang.getMemberNames()
    const members = memberNames.map(n => ns.gang.getMemberInformation(n))
    members.sort((a, b) => a.earnedRespect - b.earnedRespect)
    for(let { name } of members) {
        const ascended = ns.gang.ascendMember(name)
        if(ascended) {
            const member = ns.gang.getMemberInformation(name)
            for(let {type, tier} of upgrades) {
                upgrade(ns, member, type, tier, equipment)
            }
            ns.gang.setMemberTask(member.name, 'Train Combat')
        }
    }
    // ns.tprint(JSON.stringify(members, null, 2))
}

const ascendArgs = (ns, max = '', _upgrades = []) => {
    if(max.length > 0 && max != 0) {
        const parts = max.split('')
        const upgrades = parts.filter(f => !!f).map(p => {
            return { type: convertUpgradeTypeArg(p), tier: 10 }
        })
        ns.tprint(upgrades)
        return upgrades
    } else if (max === 1 && Number.isInteger(_upgrades[0])) {
        return ['a','w','v','r'].map(u => {
            return { type: convertUpgradeTypeArg(u), tier: _upgrades[0] } 
        })
    } else {
        const upgrades = _upgrades.map(a => {
            const parts = a.split('')
            return { type: convertUpgradeTypeArg(parts[0]), tier: parts[1] } 
        })
        ns.tprint(upgrades)
        return upgrades
    }
}
//#endregion

//#region Train
/** @param {NS} ns **/
const train = (ns, _trainingType) => {
    let task = ''
    switch(_trainingType) {
        case 'c':
            task = 'Train Combat'
            break
        case 'p':
            task = 'Train Charisma'
            break
        case 'h':
            task = 'Train Hacking'
            break
    }
        /** @param {GangMemberInfo} member **/
        loopMembers(ns, (member) => {
            ns.gang.setMemberTask(member.name, task)
        })
}
//#endregion

//#region Action
/** @param {NS} ns **/
const action = async(ns, _task, _secondary = 'Train Combat') => {
    ns.disableLog('sleep')
    let task = convertTaskArg(_task)
    loopMembers(ns, (member) => {
        ns.gang.setMemberTask(member.name, task)
    })
    if(task === 'Vigilante Justice') {
        let wanted = true
        while(wanted) {
            await ns.sleep(1000)
            wanted = ns.gang.getGangInformation().wantedLevel > 1
        }
        task = convertTaskArg(_secondary)
        loopMembers(ns, (member) => {
            ns.gang.setMemberTask(member.name, task)
        })
    }
}
//#endregion

//#region Auto
/** @param {NS} ns **/
const auto = async (ns, args) => {
    const [_completionTask = '', _stats = 'chp', flatGoal = 0.5, multGoal = 1.1] = args
    ns.tprint(_completionTask, _stats, flatGoal, multGoal)
    ns.disableLog('sleep')
    ns.disableLog('gang.setMemberTask')
    let oks = {}
    let allOk = false
    const completionTask = convertTaskArg(_completionTask, 'Mug People')
    const stats = [
        ...[...(_stats.toLowerCase().includes('c') ? COMBAT_STATS : [])],
        ...[...(_stats.toLowerCase().includes('h') ? [HACK] : [])],
        ...[...(_stats.toLowerCase().includes('p') ? [CHA] : [])],
    ]
    ns.tprint(`Training: ${stats}`)
    while(!allOk) {
        loopMembers(ns, /** @param {GangMemberInfo} member **/ (member) => {
            if(!oks[member.name]) {
                const ascResult = ns.gang.getAscensionResult(member.name)
                if(ascResult === null) {
                    ns.tprint(`ascResult came back ${JSON.stringify(ascResult)}`)
                }
                let log = `${member.name.padStart(9)} `
                let ok = stats.reduce((acc, stat) => {
                    if(acc) {
                        const flatCheck = ascResult[stat] * member[`${stat}_asc_mult`] - member[`${stat}_asc_mult`] < flatGoal
                        const multCheck = ascResult[stat] < multGoal

                        if(flatCheck || multCheck) {
                            log += `needs to train ${stat.toUpperCase().padEnd(4)} ( `
                            log += flatCheck ? `Flat Inc: ${ns.nFormat((ascResult[stat] * member[`${stat}_asc_mult`]) - member[`${stat}_asc_mult`], '0.00')} < ${flatGoal} = ${(ascResult[stat] * member[`${stat}_asc_mult`]) - member[`${stat}_asc_mult`] < flatGoal}` : ''
                            log += flatCheck && multCheck ? ' | ' : ''
                            log += multCheck ? `Mult Inc: ${ns.nFormat(ascResult[stat], '0.00')} < ${multGoal} = ${ascResult[stat] < multGoal}` : ''
                            log += ' )  '
                            let trainingTask = 'Train '
                            switch(stat) {
                                case STR:
                                case DEF:
                                case DEX:
                                case AGI:
                                    trainingTask += 'Combat'
                                    break
                                case HACK:
                                    trainingTask += 'Hacking'
                                    break
                                case CHA:
                                    trainingTask += 'Charisma'
                                    break
                                default:
                                    throw new Error(`Unknown stat '${stat}' encountered`)
                            }
                            const ass = ns.gang.setMemberTask(member.name, trainingTask)
                            if(ass) {
                                log += `Assigned to '${trainingTask}'`
                            } else {
                                ns.tprint(`ERROR: Failed to assign gang member '${member.name}' to task '${trainingTask}'`)
                            }
                            return false
                        } 
                        return true
                    }
                    return acc
                }, !!ascResult)
                oks[member.name] = ok
                if(ok) {
                    const ass = ns.gang.setMemberTask(member.name, completionTask)
                    if(ass) {
                        log += `assigned to '${completionTask}'`
                    } else {
                        ns.tprint(`ERROR: Failed to assign gang member '${member.name}' to task '${completionTask}'`)
                    }
                }
                ns.print(log)
            }
        })
        allOk = Object.values(oks).reduce((acc, cur) => {
            return acc && cur
        }, true)
        ns.print(`Sleeping until ${new Date(Date.now() + 5001).toLocaleTimeString()}`)
        await ns.sleep(5001)
    }
}
//#endregion

//#region Territory
/** @param {NS} ns **/
const watchTerritory = async (ns, a = 'Human Trafficking') => {
    ns.disableLog('sleep')
    let territory = ns.gang.getGangInformation().territory
    while(territory < 1) {
        await ns.sleep(60000)
        territory = ns.gang.getGangInformation().territory
    }
    ns.gang.setTerritoryWarfare(false)
    return action(ns, a)
}
//#endregion


//#region Helpers
/** @param {NS} ns **/
const loopMembers = (ns, cb) => {
    const memberNames = ns.gang.getMemberNames()
    for(const name of memberNames) {
        const member = ns.gang.getMemberInformation(name)
        cb(member)
    }
}

const loopMembersAsync = async (ns, cb) => {
    const memberNames = ns.gang.getMemberNames()
    for(const name of memberNames) {
        const member = ns.gang.getMemberInformation(name)
        await cb(member)
    }
}

const convertUpgradeTypeArg = (upgradeType) => {
    switch(upgradeType) {
        case 'Weapons':
        case 'weapons':
        case 'w':
            return 'Weapons'
        case 'Armor':
        case 'armor':
        case 'a':
            return 'Armor'
        case 'Vehicles':
        case 'vehicles':
        case 'v':
            return 'Vehicles'
        case 'Rootkits':
        case 'rootkits':
        case 'r':
            return 'Rootkits'
        default:
            return 'Rootkits'
    }
}



const convertTaskArg = (taskArg, def = 'Train Charisma') => {
    switch(taskArg) {
        case 'Unassigned':
        case 'u':
            return 'Unassigned'
        case 'Vigilante Justice':
        case 'vj':
            return 'Vigilante Justice'
        case 'Train Combat':
        case 'tc':
            return 'Train Combat'
        case 'Train Hacking':
        case 'th':
            return 'Train Hacking'
        case 'Train Charisma':
        case 'tp':
            return 'Train Charisma'
        case 'Territory Warfare':
        case 'tw':
            return 'Territory Warfare'
        case 'Ransomware':
        case 'r':
            return 'Ransomware'
        case 'Phishing':
        case 'p':
            return 'Phishing'
        case 'Identity Theft':
        case 'it':
            return 'Identity Theft'
        case 'DDoS Attacks':
        case 'da':
            return 'DDoS Attacks'
        case 'Plant Virus':
        case 'pv':
            return 'Plant Virus'
        case 'Fraud & Counterfeiting':
        case 'fc':
            return 'Fraud & Counterfeiting'
        case 'Money Laundering':
        case 'ml':
            return 'Money Laundering'
        case 'Cyberterrorism':
        case 'c':
            return 'Cyberterrorism'
        case 'Ethical Hacking':
        case 'eh':
            return 'Ethical Hacking'
        case 'Mug People':
        case 'mp':
            return 'Mug People'
        case 'Deal Drugs':
        case 'dd':
            return 'Deal Drugs'
        case 'Strongarm Civilians':
        case 'sc':
            return 'Strongarm Civilians'
        case 'Run a Con':
        case 'rac':
            return 'Run a Con'
        case 'Armed Robbery':
        case 'ar':
            return 'Armed Robbery'
        case 'Traffick Illegal Arms':
        case 'tia':
            return 'Traffick Illegal Arms'
        case 'Threaten & Blackmail':
        case 'tb':
            return 'Threaten & Blackmail'
        case 'Human Trafficking':
        case 'ht':
            return 'Human Trafficking'
        case 'Terrorism':
        case 't':
            return 'Terrorism'
        default:
            return def
    }
}
//#endregion

//#region Main
/** @param {NS} ns **/
export async function main(ns) {
    if(ns.args.length > 0) {
        const [cmd, ...args] = ns.args
        switch(cmd) {
            case 'new':
            case 'n':
                ns.tprint('Recruiting...')
                recruit(ns, ...args)
                break
            case 'status':
            case 's':
                status(ns)
                break
            case 'upgrade':
            case 'u':
                const upgradeType = args.shift()
                ns.tprint(upgradeType)
                const upgradeTier = args.shift()
                ns.tprint(upgradeTier)
                upgradeAll(ns, convertUpgradeTypeArg(upgradeType), upgradeTier, ...args)
                break
            case 'augment':
            case 'm':
                augmentAll(ns, args.shift())
                break
            case 'train':
            case 't':
                train(ns, args.shift())
                break
            case 'ascend':
            case 'z':
                let max = 'awv'
                if(args.length > 0) {
                    max = args.shift()
                }
                const upgrades = ascendArgs(ns, max, args)
                ascend(ns, upgrades)
                break
            case 'action':
            case 'a':
                await action(ns, args.shift(), args.shift())
                break
            case 'x':
                await watchTerritory(ns, ...args)
                break
            case 'auto':
            case 'o':
                await auto(ns, args)
                break
            default:
                break
        }
    }
    ns.tprint('Exiting Gang Command Runner')
}
//#endregion