import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  let server = ns.getServer('n00dles')
  let mult = server.serverGrowth || 1
  ns.tprint(ns.growthAnalyze(server.hostname, 350000, 1))
  ns.tprint(1/ns.hackAnalyze(server.hostname))
  // ns.tprint(ns.weakenAnalyze())
}
