import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	const CompanyName = ns.enums.CompanyName
  const FactionName = ns.enums.FactionName
  const companies = [CompanyName.AeroCorp, CompanyName.AlphaEnterprises, CompanyName.BachmanAndAssociates, CompanyName.BladeIndustries, CompanyName.CarmichaelSecurity, CompanyName.CIA, CompanyName.ClarkeIncorporated, CompanyName.CompuTek, CompanyName.DefComm, CompanyName.DeltaOne, CompanyName.ECorp, CompanyName.FoodNStuff, CompanyName.FourSigma, CompanyName.FulcrumTechnologies, CompanyName.GalacticCybersystems, CompanyName.GlobalPharmaceuticals, CompanyName.HeliosLabs, CompanyName.IcarusMicrosystems, CompanyName.JoesGuns, CompanyName.KuaiGongInternational, CompanyName.LexoCorp, CompanyName.MegaCorp, CompanyName.NetLinkTechnologies, CompanyName.NoodleBar, CompanyName.NovaMedical, CompanyName.NSA, CompanyName.NWO, CompanyName.OmegaSoftware, CompanyName.OmniaCybersystems, CompanyName.OmniTekIncorporated, CompanyName.Police, CompanyName.RhoConstruction, CompanyName.SolarisSpaceSystems, CompanyName.StormTechnologies, CompanyName.SysCoreSecurities, CompanyName.UniversalEnergy, CompanyName.VitaLife, CompanyName.WatchdogSecurity, ]
  const factions = ["Aevum", "Bachman & Associates", "BitRunners", "Bladeburners", "Blade Industries", "Chongqing", "Church of the Machine God", "Clarke Incorporated", "CyberSec", "Daedalus", "ECorp", "Four Sigma", "Fulcrum Secret Technologies", "Illuminati", "Ishima", "KuaiGong International", "MegaCorp", "Netburners", "New Tokyo", "NiteSec", "NWO", "OmniTek Incorporated", "Sector-12", "Shadows of Anarchy", "Silhouette", "Slum Snakes", "Speakers for the Dead", "Tetrads", "The Black Hand", "The Covenant", "The Dark Army", "The Syndicate", "Tian Di Hui", "Volhaven"]
  const filtered = companies.filter((value) => factions.findIndex((faction) => value === faction) !== -1)
  
  const augmentations:Map<string, string[]> = new Map<string, string[]>()
	for (let company of filtered) {
    const offeredAugs = ns.singularity.getAugmentationsFromFaction(company)
    for (let aug of offeredAugs) {
      let a = augmentations.get(aug)
      if(augmentations.get(aug) == undefined) {
        augmentations.set(aug, [company])
      } else {
        let current = augmentations.get(aug) || []
        current.push(company)
        augmentations.set(aug, current)
      }
    }  
	}
  let entries = augmentations.entries()
  let arr = entries.toArray()
  let sorted = arr.sort(([augA, companiesA], [augB, companiesB]) => companiesA.length - companiesB.length)
  
  ns.tprint(sorted)
}

