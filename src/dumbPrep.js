import { NS } from "@ns";

/**
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
    let [target, threads] = ns.args
    let count = 0
    
    while (true) {
        if(count % 2 === 0) {
            await ns.weaken(target, {threads})
        } else {
            await ns.grow(target, {threads})
        }
        count += 1
    }
}