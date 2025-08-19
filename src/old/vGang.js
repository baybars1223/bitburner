//#region Global Defs
const NAMES_LIST_PATH = '/old/lists/gangMemberNames.txt'
const EQUIPMENT_PATH = '/old/lists/gangEquipment.txt'

const STR = 'strength'
const DEF = 'defense'
const DEX = 'dexterity'
const AGI = 'agility'
const CHA = 'charisma'
const HACK = 'hacking'

const ALL_STATS = [
    STR,
    DEF,
    DEX,
    AGI,
    CHA,
    HACK,
]

const COMBAT_STATS = ALL_STATS.slice(0, -2)
const HOMICIDE_STATS = ALL_STATS.slice(0, 2)

let namesList = []
//#endregion

//#region Status
/** @param {NS} ns **/
function printStatus(ns, idx) {
    const augsInstalled = ns.sleeve.getSleeveAugmentations(idx)
    // ns.tprint(`getSleeveAugmentations:\n${JSON.stringify(augsInstalled, null, 2)}`)
    const augsAvail = ns.sleeve.getSleevePurchasableAugs(idx).filter(aug => !augsInstalled.find(a => a.name == aug.name) )
    ns.tprint(`getSleevePurchasableAugs:\n${JSON.stringify(augsAvail, null, 2)}`)
    const {info, stats, task} = SleeveData.fetch(ns, idx)
    // const info = ns.sleeve.getInformation(idx)
    ns.tprint(`getInformation:\n${JSON.stringify(info, null, 2)}`)
    // const stats = ns.sleeve.getSleeveStats(idx)
    ns.tprint(`getSleeveStats:\n${JSON.stringify(stats, null, 2)}`)
    // const task = ns.sleeve.getTask(idx)
    ns.tprint(`getTask:\n${JSON.stringify(task, null, 2)}`)
}

//#endRegion

//#region Train
/** @param {NS} ns **/
const train = async (ns, args = []) => {
    const [ goal = 200 ] = args
    const slvFinished = []
    for(let i = 0; i < ns.sleeve.getNumSleeves(); i += 1) {
        slvFinished.push(false)
    }
    while(true) {      
        loopSleeves(ns, /** @param {SleeveData} slv */ (slv) => {
            if(!slvFinished[slv.index]) {
                let g = 10
                let working = false
                while(g < goal) {
                    for(let stat of HOMICIDE_STATS) {
                        if(slv.stats[stat] < g) {
                            ns.sleeve.setToGymWorkout(slv.index, 'powerhouse gym', stat)
                            working = true
                            break
                        }
                    }
                    if(working) break
                    g += 10
                }
                if(g > goal) {
                    ns.tprint(`${g} > ${goal}`)
                    ns.sleeve.setToCommitCrime(slv.index, 'Homicide')
                    slvFinished[slv.index] = true
                }
            } else {
                ns.tprint(`${slv.index} finished`)
            }
        })
        if(slvFinished.reduce((acc, cur) => acc && cur, true)) {
            return 'all done'
        }
        await ns.sleep(10000)
    }
}
//#endregion

//#region Upgrade
/** @param {NS} ns **/
const upgradeAll = async (ns, limit) => {
    return loopSleevesAsync(ns, async ({index, upgrades}) => {
        let augs = upgrades.avail.slice().sort((a, b) => a.cost - b.cost)
        // ns.tprint(JSON.stringify(augs, null, 2))
        let bill = 0
        let purchases = []
        for(let i = 0; i < upgrades.avail.length && bill < limit; i += 1) {
            let { name, cost } = augs[i]
            if(bill + cost < limit) {
                purchases.push(name)
                bill += cost
            }
        }
        let msg = `It will cost ${ns.nFormat(bill, '0.00a')} to buy ${purchases.length} augmentations for Sleeve ${index}`
        let ok = await ns.prompt(msg)
        if(ok) {
            purchases.forEach(p => {
                ns.sleeve.purchaseSleeveAug(index, p)
            })
        }
        // const augsInstalled = ns.sleeve.getSleeveAugmentations(idx)
        // ns.tprint(`getSleeveAugmentations:\n${JSON.stringify(augsInstalled, null, 2)}`)
        // const augsAvail = ns.sleeve.getSleevePurchasableAugs(idx).filter(aug => !augsInstalled.find(a => a.name == aug.name) )
        // ns.gang.setMemberTask(member.name, convertTaskArg(task))
    })
}
//#endregion

// //#region Auto
// /** @param {NS} ns **/
// const auto = async (ns, task) => {
//     let oks = []
//     let allOk = false
//     while(!allOk) {
//         oks = []
//         loopSleeves(ns, /** @param {GangMemberInfo} member **/ (member) => {
//             const ascResult = ns.gang.getAscensionResult(member.name)
//             if(ascResult === null) {
//                 ns.tprint(`ascResult came back ${JSON.stringify(ascResult)}`)
//             }
//             const ok = COMBAT_STATS.reduce((acc, stat) => {
//                 return acc && ascResult[stat] > 1.5
//             }, !!ascResult)
//             oks.push(ok)
//             if(ok) {
//                 ns.gang.setMemberTask(member.name, 'Mug People')
//             } else {
//                 ns.gang.setMemberTask(member.name, 'Train Combat')
//             }
//         })
//         allOk = oks.reduce((acc, cur) => acc && cur, true)
//         await ns.sleep(10000)
//     }
// }
// //#endregion

//#region Helpers

class SleeveData {
    /** 
     * @param {NS} ns 
     * @param {SleeveInformation} info 
     * @param {SleeveSkills} stats
     * @param {SleeveTask} task
     */
    constructor(ns, index, info, stats, task, installed, avail) {
        this.ns = ns
        this.index = index
        this.info = info
        this.stats = stats
        this.task = task
        this.upgrades = {
            current: installed,
            avail
        }
    }

    /** @param {NS} ns **/
    static fetch(ns, idx) {
        const info = ns.sleeve.getInformation(idx)
        const stats = ns.sleeve.getSleeveStats(idx)
        const task = ns.sleeve.getTask(idx)
        const installed = ns.sleeve.getSleeveAugmentations(idx)
        const avail = ns.sleeve.getSleevePurchasableAugs(idx).filter(aug => !installed.find(a => a.name == aug.name) )
        return new SleeveData(ns, idx, info, stats, task, installed, avail)
    }
}

/** @param {NS} ns **/
const loopSleeves = (ns, cb) => {
    const sleeveCount = ns.sleeve.getNumSleeves()
    for(let i = 0; i < sleeveCount; i += 1) {
        const slv = SleeveData.fetch(ns, i)
        cb(slv)
    }
}

const loopSleevesAsync = async (ns, cb) => {
    const sleeveCount = ns.sleeve.getNumSleeves()
    for(let i = 0; i < sleeveCount; i += 1) {
        const slv = SleeveData.fetch(ns, i)
        await cb(slv)
    }
}

/** @param {NS} ns **/
function sync(ns, idx) {
    ns.sleeve.setToSynchronize
}

/** @param {NS} ns **/
async function command(ns, cmd, args) {
    switch(cmd) {
        case 'sync':
        case 's':
            const [select = 'a', defAction = 'r', ...a] = args
            if(select == 'a') {
                loopSleeves(ns, )
            }
            break
        case 'info':
        case 'i':
            printStatus(ns, ...args)
            break
        case 'upgrade':
        case 'u':

            const player = ns.getPlayer()
            const limit = Math.floor(player.money / (args.shift() || 100))
            ns.tprint(limit)
            await upgradeAll(ns, limit)
            break
        case 'train':
        case 't':
            const ok = await train(ns, args.shift())
            ns.tprint(ok)
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
            action(ns, args.shift())
            break
        case 'auto':
        case 'o':
            await auto(ns, args)
            break
        default:
            break
    }
}
//#endregion

//#region Main
/** @param {NS} ns **/
export async function main(ns) {
    if(ns.args.length > 0) {
        const [cmd, ...args] = ns.args
        await command(ns, cmd, args)
    }
    ns.tprint('Exiting Gang Command Runner')
}
//#endregion