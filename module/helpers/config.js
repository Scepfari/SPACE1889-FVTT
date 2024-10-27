export const SPACE1889 = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
 SPACE1889.abilities = {
	"str": "SPACE1889.AbilityStr",
	"dex": "SPACE1889.AbilityDex",
	"con": "SPACE1889.AbilityCon",
	"int": "SPACE1889.AbilityInt",
	"wil": "SPACE1889.AbilityWil",
	"cha": "SPACE1889.AbilityCha"
};

SPACE1889.abilityAbbreviations = {
	"str": "SPACE1889.AbilityStrAbbr",
	"dex": "SPACE1889.AbilityDexAbbr",
	"con": "SPACE1889.AbilityConAbbr",
	"int": "SPACE1889.AbilityIntAbbr",
	"wil": "SPACE1889.AbilityWilAbbr",
	"cha": "SPACE1889.AbilityChaAbbr"
};

SPACE1889.secondaries = {
	"size": "SPACE1889.SecondaryAttributeSiz",
	"move": "SPACE1889.SecondaryAttributeMov",
	"perception": "SPACE1889.SecondaryAttributePer",
	"initiative": "SPACE1889.SecondaryAttributeIni",
	"defense": "SPACE1889.SecondaryAttributeDef",
	"stun": "SPACE1889.SecondaryAttributeStu"
};

SPACE1889.itemTypes = {
	"ammunition": "ITEM.TypeAmmunition",
	"archetype": "ITEM.TypeArchetype",
	"armor": "ITEM.TypeArmor",
	"container": "ITEM.TypeContainer",
	"currency": "ITEM.TypeCurrency",
	"extended_action": "ITEM.TypeExtended_action",
	"damage": "ITEM.TypeDamage",
	"item": "ITEM.TypeItem",
	"language": "ITEM.TypeLanguage",
	"lightSource": "ITEM.TypeLightsource",
	"motivation": "ITEM.TypeMotivation",
	"resource": "ITEM.TypeResource",
	"skill": "ITEM.TypeSkill",
	"specialization": "ITEM.TypeSpecialization",
	"species": "ITEM.TypeSpecies",
	"talent": "ITEM.TypeTalent",
	"vision": "ITEM.TypeVision",
	"weakness": "ITEM.TypeWeakness",
	"weapon": "ITEM.TypeWeapon"
}

SPACE1889.skillUnderlyingAttribute = [
	["akrobatik", "dex"],
	["anthropologie", "int"],
	["apotheker", "int"],
	["architektur", "int"],
	["astronomie", "int"],
	["aetherschiffe", "dex"],
	["ballons", "dex"],
	["bildhauerei", "int"],
	["biologie", "int"],
	["bohrgeraete", "dex"],
	["buehnenkunst", "cha"],
	["buerokratie", "int"],
	["chemie", "int"],
	["diplomatie", "cha"],
	["einschuechtern", "cha"],
	["elektriker", "int"],
	["empathie", "int"],
	["ermittlung", "int"],
	["fahren", "dex"],
	["flugautos", "dex"],
	["flugschiffe", "dex"],
	["fokussieren", "wil"],
	["fotographie", "int"],
	["gassenwissen", "cha"],
	["gaunerei", "dex"],
	["geologie", "int"],
	["geschichte", "int"],
	["geschuetze", "int"],
	["heimlichkeit", "dex"],
	["ingenieurswesen", "int"],
	["jura", "int"],
	["kenner", "int"],
	["komposition", "int"],
	["kriegsfuehrung", "int"],
	["kristalltechnologie", "int"],
	["landwirtschaft", "int"],
	["linguistik", "int"],
	["literatur", "int"],
	["malerei", "int"],
	["marsGeschichte", "int"],
	["marsTheologie", "int"],
	["mathematik", "int"],
	["mechaniker", "int"],
	["medizin", "int"],
	["metallurgie", "int"],
	["nahkampf", "str"],
	["panzerlaeufer", "dex"],
	["personenflug", "dex"],
	["philosophie", "int"],
	["physik", "int"],
	["primitiverFernkampf", "dex"],
	["reiten", "dex"],
	["schiffe", "dex"],
	["schmied", "int"],
	["schreiner", "int"],
	["schriftstellerei", "int"],
	["schusswaffen", "dex"],
	["schwindeln", "cha"],
	["spielen", "int"],
	["sportlichkeit", "str"],
	["sprengstoffe", "int"],
	["theologie", "int"],
	["tierhaltung", "cha"],
	["uboote", "dex"],
	["ueberleben", "int"],
	["volkswirtschaft", "int"],
	["waffenlos", "str"]
];


SPACE1889.skillGroups = {
	'': "-",
	akademischesWissen: "SPACE1889.SkillGroupAkaWissen",
	handwerk: "SPACE1889.SkillGroupHandwerk",
	kunst: "SPACE1889.SkillGroupKunst",
	naturwissenschaft: "SPACE1889.SkillGroupNaturWissen",
	spezielleFahrzeuge: "SPACE1889.SkillGroupSpezFahrzeuge"
};

SPACE1889.skillGroupDescriptions = {
	akademischesWissen: "SPACE1889.SkillGroupDescAkaWissen",
	handwerk: "SPACE1889.SkillGroupDescHandwerk",
	kunst: "SPACE1889.SkillGroupDescKunst",
	naturwissenschaft: "SPACE1889.SkillGroupDescNaturWissen",
	spezielleFahrzeuge: "SPACE1889.SkillGroupDescSpezFahrzeuge"
};

SPACE1889.skillGroupUnderlyingAttribute = {
	akademischesWissen: "int",
	handwerk: "int",
	kunst: "int",
	naturwissenschaft: "int",
	spezielleFahrzeuge: "dex"
}

SPACE1889.nonGroupSkills = {
	"akrobatik": "SPACE1889.SkillAkrobatik",
	"buehnenkunst": "SPACE1889.SkillBuehnenkunst",
	"buerokratie": "SPACE1889.SkillBuerokratie",
	"diplomatie": "SPACE1889.SkillDiplomatie",
	"einschuechtern": "SPACE1889.SkillEinschuechtern",
	"empathie": "SPACE1889.SkillEmpathie",
	"ermittlung": "SPACE1889.SkillErmittlung",
	"fahren": "SPACE1889.SkillFahren",
	"fokussieren": "SPACE1889.SkillFokussieren",
	"gassenwissen": "SPACE1889.SkillGassenwissen",
	"gaunerei": "SPACE1889.SkillGaunerei",
	"geschuetze": "SPACE1889.SkillGeschuetze",
	"heimlichkeit": "SPACE1889.SkillHeimlichkeit",
	"kenner": "SPACE1889.SkillKenner",
	"kriegsfuehrung": "SPACE1889.SkillKriegsfuehrung",
	"linguistik": "SPACE1889.SkillLinguistik",
	"medizin": "SPACE1889.SkillMedizin",
	"nahkampf": "SPACE1889.SkillNahkampf",
	"primitiverFernkampf": "SPACE1889.SkillPrimitiverFernkampf",
	"reiten": "SPACE1889.SkillReiten",
	"schusswaffen": "SPACE1889.SkillSchusswaffen",
	"schwindeln": "SPACE1889.SkillSchwindeln",
	"spielen": "SPACE1889.SkillSpielen",
	"sportlichkeit": "SPACE1889.SkillSportlichkeit",
	"sprengstoffe": "SPACE1889.SkillSprengstoffe",
	"tierhaltung": "SPACE1889.SkillTierhaltung",
	"uboote": "SPACE1889.SkillUboote",
	"ueberleben": "SPACE1889.SkillUeberleben",
	"waffenlos": "SPACE1889.SkillWaffenlos"
};

SPACE1889.combatSkills = {
	"none": "-",
	"geschuetze": "SPACE1889.SkillGeschuetze",
	"nahkampf": "SPACE1889.SkillNahkampf",
	"primitiverFernkampf": "SPACE1889.SkillPrimitiverFernkampf",
	"schusswaffen": "SPACE1889.SkillSchusswaffen",
	"sportlichkeit": "SPACE1889.SkillSportlichkeit",
	"sprengstoffe": "SPACE1889.SkillSprengstoffe",
	"waffenlos": "SPACE1889.SkillWaffenlos"
}

SPACE1889.pilotSkills = {
	"aetherschiffe": "SPACE1889.SkillAetherschiffe",
	"ballons": "SPACE1889.SkillBallons",
	"bohrgeraete": "SPACE1889.SkillBohrgeraete",
	"fahren": "SPACE1889.SkillFahren",
	"flugautos": "SPACE1889.SkillFlugautos",
	"flugschiffe": "SPACE1889.SkillFlugschiffe",
	"panzerlaeufer": "SPACE1889.SkillPanzerlaeufer",
	"personenflug": "SPACE1889.SkillPersonenflug",
	"reiten": "SPACE1889.SkillReiten",
	"schiffe": "SPACE1889.SkillSchiffe",
	"uboote": "SPACE1889.SkillUboote"
}

SPACE1889.combatSpecializations ={
	"none": "-",
	"archaisch": "SPACE1889.SpeciSkillArchaisch",
	"artillerie": "SPACE1889.SpeciSkillArtillerie",
	"armbrust": "SPACE1889.SpeciSkillArmbrust",
	"aexte": "SPACE1889.SpeciSkillAexte",
	"blasrohr": "SPACE1889.SpeciSkillBlasrohr",
	"bogen": "SPACE1889.SpeciSkillBogen",
	"bomben": "SPACE1889.SpeciSkillBomben",
	"feuerlanze": "SPACE1889.SpeciSkillFeuerlanze",
	"gewehr": "SPACE1889.SpeciSkillGewehr",
	"kanonen": "SPACE1889.SpeciSkillKanonen",
	"knueppel": "SPACE1889.SpeciSkillKnueppel",
	"maschinengewehre": "SPACE1889.SpeciSkillMaschinengewehre",
	"messer": "SPACE1889.SpeciSkillMesser",
	"pistole": "SPACE1889.SpeciSkillPistole",
	"raketen": "SPACE1889.SpeciSkillRaketen",
	"schlaege": "SPACE1889.SpeciSkillSchlaege",
	"schleuder": "SPACE1889.SpeciSkillSchleuder",
	"schrotgewehr": "SPACE1889.SpeciSkillSchrotgewehr",
	"schwerter": "SPACE1889.SpeciSkillSchwerter",
	"speere": "SPACE1889.SpeciSkillSpeere",
	"werfen": "SPACE1889.SpeciSkillWerfen",
	"wurfnetz": "SPACE1889.SpeciSkillWurfnetz"
}

SPACE1889.damageTypes ={
	"nonLethal": "SPACE1889.NonLethal",
	"lethal": "SPACE1889.Lethal",
	"both": "SPACE1889.LethalOrNonLethal"
}

SPACE1889.noComboDamageTypes ={
	"nonLethal": "SPACE1889.NonLethal",
	"lethal": "SPACE1889.Lethal"
}

SPACE1889.damageTypeAbbreviations ={
	"nonLethal": "SPACE1889.NonLethalAbbr",
	"lethal": "SPACE1889.LethalAbbr",
	"both": "SPACE1889.LethalOrNonLethalAbbr"
}

SPACE1889.vehicleDamageTypes = {
	"nonLethal": "SPACE1889.NonLethal",
	"lethal": "SPACE1889.Lethal",
	"controls": "SPACE1889.Controls",
	"propulsion": "SPACE1889.Propulsion",
	"guns": "SPACE1889.Guns",
	"crew": "SPACE1889.VehicleCrew"
}

SPACE1889.vehicleDamageTypeAbbreviations = {
	"nonLethal": "SPACE1889.NonLethalAbbr",
	"lethal": "SPACE1889.LethalAbbr",
	"controls": "SPACE1889.ControlsAbbr",
	"propulsion": "SPACE1889.PropulsionAbbr",
	"guns": "SPACE1889.GunsAbbr",
	"crew": "SPACE1889.CrewAbbr"
}

SPACE1889.preConditionTypes = {
	"nothing": "-",
	"actor": "SPACE1889.PreConTypeActor",
	"primary": "SPACE1889.PreConTypePrimary",
	"secondary": "SPACE1889.PreConTypeSecondary",
	"skill": "SPACE1889.Skill",
	"specialization": "SPACE1889.Specialization",
	"species": "SPACE1889.PreConTypeSpecies",
	"talent": "SPACE1889.Talent",
	"weakness": "SPACE1889.PreConTypeWeakness"
};

SPACE1889.archetypes = {
	"abenteurer": "SPACE1889.ArchetypeAbenteurer",
	"abenteurerin": "SPACE1889.ArchetypeAbenteurerin",
	"adlige": "SPACE1889.ArchetypeAdlige",
	"adliger": "SPACE1889.ArchetypeAdliger",
	"akademiker": "SPACE1889.ArchetypeAkademiker",
	"akademikerin": "SPACE1889.ArchetypeAkademikerin",
	"anfuehrer": "SPACE1889.ArchetypeAnfuehrer",
	"anfuehrerin": "SPACE1889.ArchetypeAnfuehrerin",
	"arbeiter": "SPACE1889.ArchetypeArbeiter",
	"arbeiterin": "SPACE1889.ArchetypeArbeiterin",
	"artefakt": "SPACE1889.ArchetypeArtefakt",
	"arzt": "SPACE1889.ArchetypeArzt",
	"aerztin": "SPACE1889.ArchetypeAerztin",
	"ausgestossene": "SPACE1889.ArchetypeAusgestossene",
	"ausgestossener": "SPACE1889.ArchetypeAusgestossener",
	"barbar": "SPACE1889.ArchetypeBarbar",
	"barbarin": "SPACE1889.ArchetypeBarbarin",
	"beamter": "SPACE1889.ArchetypeBeamter",
	"beamtin": "SPACE1889.ArchetypeBeamtin",
	"beruehmtheit": "SPACE1889.ArchetypeBeruehmtheit",
	"betrueger": "SPACE1889.ArchetypeBetrueger",
	"betruegerin": "SPACE1889.ArchetypeBetruegerin",
	"diener": "SPACE1889.ArchetypeDiener",
	"dienerin": "SPACE1889.ArchetypeDienerin",
	"durchschnittsmensch": "SPACE1889.ArchetypeDurchschnittsmensch",
	"entdecker": "SPACE1889.ArchetypeEntdecker",
	"entdeckerin": "SPACE1889.ArchetypeEntdeckerin",
	"geldgeber": "SPACE1889.ArchetypeGeldgeber",
	"geldgeberin": "SPACE1889.ArchetypeGeldgeberin",
	"gesetzeshueter": "SPACE1889.ArchetypeGesetzeshueter",
	"gesetzeshueterin": "SPACE1889.ArchetypeGesetzeshueterin",
	"handelsreisender": "SPACE1889.ArchetypeHandelsreisender",
	"handelsreisende": "SPACE1889.ArchetypeHandelsreisende",
	"haendler": "SPACE1889.ArchetypeHaendler",
	"haendlerin": "SPACE1889.ArchetypeHaendlerin",
	"heiler": "SPACE1889.ArchetypeHeiler",
	"heilerin": "SPACE1889.ArchetypeHeilerin",
	"hochstapler": "SPACE1889.ArchetypeHochstapler",
	"hochstaplerin": "SPACE1889.ArchetypeHochstaplerin",
	"jaeger": "SPACE1889.ArchetypeJaeger",
	"jaegerin": "SPACE1889.ArchetypeJaegerin",
	"konstrukteur": "SPACE1889.ArchetypeKonstrukteur",
	"konstrukteurin": "SPACE1889.ArchetypeKonstrukteurin",
	"kaempfer": "SPACE1889.ArchetypeKaempfer",
	"kaempferin": "SPACE1889.ArchetypeKaempferin",
	"kuenstler": "SPACE1889.ArchetypeKuenstler",
	"kuenstlerin": "SPACE1889.ArchetypeKuenstlerin",
	"lehrmeister": "SPACE1889.ArchetypeLehrmeister",
	"lehrmeisterin": "SPACE1889.ArchetypeLehrmeisterin",
	"missionar": "SPACE1889.ArchetypeMissionar",
	"missionarin": "SPACE1889.ArchetypeMissionarin",
	"moench": "SPACE1889.ArchetypeMoench",
	"mystiker": "SPACE1889.ArchetypeMystiker",
	"mystikerin": "SPACE1889.ArchetypeMystikerin",
	"nomade": "SPACE1889.ArchetypeNomade",
	"nomadin": "SPACE1889.ArchetypeNomadin",
	"nonne": "SPACE1889.ArchetypeNonne",
	"okkultist": "SPACE1889.ArchetypeOkkultist",
	"okkultistin": "SPACE1889.ArchetypeOkkultistin",
	"pionier": "SPACE1889.ArchetypePionier",
	"pionierin": "SPACE1889.ArchetypePionierin",
	"rebell": "SPACE1889.ArchetypeRebell",
	"rebellin": "SPACE1889.ArchetypeRebellin",
	"reporter": "SPACE1889.ArchetypeReporter",
	"reporterin": "SPACE1889.ArchetypeReporterin",
	"schamane": "SPACE1889.ArchetypeSchamane",
	"schamanin": "SPACE1889.ArchetypeSchamanin",
	"soldat": "SPACE1889.ArchetypeSoldat",
	"soldatin": "SPACE1889.ArchetypeSoldatin",
	"spion": "SPACE1889.ArchetypeSpion",
	"spionin": "SPACE1889.ArchetypeSpionin",
	"stammesangehoerige": "SPACE1889.ArchetypeStammesangehoerige",
	"stammesangehoeriger": "SPACE1889.ArchetypeStammesangehoeriger",
	"techniker": "SPACE1889.ArchetypeTechniker",
	"technikerin": "SPACE1889.ArchetypeTechnikerin",
	"tiermensch": "SPACE1889.ArchetypeTiermensch",
	"ueberlebender": "SPACE1889.ArchetypeUeberlebender",
	"ueberlebende": "SPACE1889.ArchetypeUeberlebende",
	"vagabund": "SPACE1889.ArchetypeVagabund",
	"vagabundin": "SPACE1889.ArchetypeVagabundin",
	"verbrecher": "SPACE1889.ArchetypeVerbrecher",
	"verbrecherin": "SPACE1889.ArchetypeVerbrecherin",
	"waechter": "SPACE1889.ArchetypeWaechter",
	"waechterin": "SPACE1889.ArchetypeWaechterin",
	"wettkaempfer": "SPACE1889.ArchetypeWettkaempfer",
	"wettkaempferin": "SPACE1889.ArchetypeWettkaempferin",
	"wissenschaftler": "SPACE1889.ArchetypeWissenschaftler",
	"wissenschaftlerin": "SPACE1889.ArchetypeWissenschaftlerin"
};

SPACE1889.species = {
	"druoBethang": "SPACE1889.SpeciesDruoBethang",
	"hochlandmarsianer": "SPACE1889.SpeciesHochlandmarsianer",
	"huegelmarsianer": "SPACE1889.SpeciesHuegelmarsianer",
	"kanalmarsianer": "SPACE1889.SpeciesKanalmarsianer",
	"mensch": "SPACE1889.SpeciesMensch",
	"napidrobet": "SPACE1889.SpeciesNapiDrobet",
	"ornumDrobet": "SPACE1889.SpeciesOrnumDrobet",
	"sumpfmarsianer": "SPACE1889.SpeciesSumpfmarsianer",
	"selenit": "SPACE1889.SpeciesSelenit",
	"venusianer": "SPACE1889.SpeciesVenusianer",
	"konstrukt": "SPACE1889.SpeciesKonstrukt"
};

SPACE1889.motivations = {
	"anstand": "SPACE1889.MotivationAnstand",
	"bewahren": "SPACE1889.MotivationBewahren",
	"choleriker": "SPACE1889.MotivationCholeriker",
	"ehre": "SPACE1889.MotivationEhre",
	"entdeckung": "SPACE1889.MotivationEntdeckung",
	"flucht": "SPACE1889.MotivationFlucht",
	"freiheit": "SPACE1889.MotivationFreiheit",
	"fortschrittsglaube": "SPACE1889.MotivationFortschrittsglaube",
	"fuehrsorge": "SPACE1889.MotivationFuehrsorge",
	"geheimniskraemerei": "SPACE1889.MotivationGeheimniskraemerei",
	"gerechtigkeit": "SPACE1889.MotivationGerechtigkeit",
	"gewinn": "SPACE1889.MotivationGewinn",
	"glaube": "SPACE1889.MotivationGlaube",
	"hoffnung": "SPACE1889.MotivationHoffnung",
	"liebe": "SPACE1889.MotivationLiebe",
	"macht": "SPACE1889.MotivationMacht",
	"melancholiker": "SPACE1889.MotivationMelancholiker",
	"perfektion": "SPACE1889.MotivationPerfektion",
	"pflicht": "SPACE1889.MotivationPflicht",
	"provokation": "SPACE1889.MotivationProvokation",
	"phlegmatiker": "SPACE1889.MotivationPhlegmatiker",
	"rache": "SPACE1889.MotivationRache",
	"ruhm": "SPACE1889.MotivationRuhm",
	"sanguiniker": "SPACE1889.MotivationSanguiniker",
	"schoepfung": "SPACE1889.MotivationSchoepfung",
	"suehne": "SPACE1889.MotivationSuehne",
	"tradition": "SPACE1889.MotivationTradition",
	"ueberleben": "SPACE1889.MotivationUeberleben",
	"vermaechtnis": "SPACE1889.MotivationVermaechtnis",
	"weisheit": "SPACE1889.MotivationWeisheit",
	"zerstoerung": "SPACE1889.MotivationZerstoerung"
};

SPACE1889.resources = {
	"artefakt": "SPACE1889.ResourceArtefakt",
	"beziehungen": "SPACE1889.ResourceBeziehungen",
	"gefolge": "SPACE1889.ResourceGefolge",
	"goenner": "SPACE1889.ResourceGoenner",
	"rang": "SPACE1889.ResourceRang",
	"verbuendeter": "SPACE1889.ResourceVerbuendeter"
};

SPACE1889.storageLocations = {
	"koerper": "SPACE1889.StorageLocationKoerper",
	"rucksack": "SPACE1889.StorageLocationRucksack",
	"lager": "SPACE1889.StorageLocationLager",
};

SPACE1889.storageLocationAbbreviations = {
	"koerper": "SPACE1889.StorageLocationKoerperAbbr",
	"rucksack": "SPACE1889.StorageLocationRucksackAbbr",
	"lager": "SPACE1889.StorageLocationLagerAbbr",
};

SPACE1889.allStorageLocations = {
	"koerper": "SPACE1889.StorageLocationKoerper",
	"rucksack": "SPACE1889.StorageLocationRucksack",
	"lager": "SPACE1889.StorageLocationLager",
	"mounted": "SPACE1889.StorageLocationMounted"
};

SPACE1889.allStorageLocationsAbbreviations = {
	"koerper": "SPACE1889.StorageLocationKoerperAbbr",
	"rucksack": "SPACE1889.StorageLocationRucksackAbbr",
	"lager": "SPACE1889.StorageLocationLagerAbbr",
	"mounted": "SPACE1889.StorageLocationMountedAbbr",
};

SPACE1889.vehicleStorageLocations = {
	"mounted": "SPACE1889.StorageLocationMounted",
	"lager": "SPACE1889.StorageLocationLager",
};

SPACE1889.vehicleStorageLocationAbbreviations = {
	"mounted": "SPACE1889.StorageLocationMountedAbbr",
	"lager": "SPACE1889.StorageLocationLagerAbbr",
};

SPACE1889.languageOrigins = {
	"erde": "SPACE1889.LanguageOriginErde",
	"hochlandmarsianisch": "SPACE1889.LanguageOriginHochlandmarsianisch",
	"huegelmarsianisch": "SPACE1889.LanguageOriginHuegelmarsianisch",
	"kanalmarsianisch": "SPACE1889.LanguageOriginKanalmarsianisch",
	"luna": "SPACE1889.LanguageOriginLuna",
	"mars": "SPACE1889.LanguageOriginMars",
	"merkur": "SPACE1889.LanguageOriginMerkur",
	"phaeton": "SPACE1889.LanguageOriginPhaeton",
	"venus": "SPACE1889.LanguageOriginVenus" 
}

SPACE1889.familyOflanguages = {
	"afroasiatisch": "SPACE1889.FamilyOfLanguagesAfroasiatisch",
	"alaanawaak": "SPACE1889.FamilyOfLanguagesAlaanawaak",
	"algisch": "SPACE1889.FamilyOfLanguagesAlgisch",
	"arcadisch": "SPACE1889.FamilyOfLanguagesArcadisch",
	"aru": "SPACE1889.FamilyOfLanguagesAru",
	"athapaskisch": "SPACE1889.FamilyOfLanguagesAthapaskisch",
	"australisch": "SPACE1889.FamilyOfLanguagesAustralisch",
	"austroasiatisch": "SPACE1889.FamilyOfLanguagesAustroasiatisch",
	"austronesisch": "SPACE1889.FamilyOfLanguagesAustronesisch",
	"bantu": "SPACE1889.FamilyOfLanguagesBantu",
	"bootnai": "SPACE1889.FamilyOfLanguagesBootnai",
	"boreaanisch": "SPACE1889.FamilyOfLanguagesBoreaanisch",
	"dioumbranisch": "SPACE1889.FamilyOfLanguagesDioumbranisch",
	"dravidisch": "SPACE1889.FamilyOfLanguagesDravidisch",
	"drobetisch": "SPACE1889.FamilyOfLanguagesDrobetisch",
	"eiskrabbensprache": "SPACE1889.FamilyOfLanguagesEiskrabbensprache",
	"finnougrisch": "SPACE1889.FamilyOfLanguagesFinnougrisch",
	"gaaryani": "SPACE1889.FamilyOfLanguagesGaaryani",
	"gaashwaan": "SPACE1889.FamilyOfLanguagesGaashwaan",
	"germanisch": "SPACE1889.FamilyOfLanguagesGermanisch",
	"griechisch": "SPACE1889.FamilyOfLanguagesGriechisch",
	"indoarisch": "SPACE1889.FamilyOfLanguagesIndoarisch",
	"iranisch": "SPACE1889.FamilyOfLanguagesIranisch",
	"japanischryukyu": "SPACE1889.FamilyOfLanguagesJapanischryukyu",
	"keltisch": "SPACE1889.FamilyOfLanguagesKeltisch",
	"khallan": "SPACE1889.FamilyOfLanguagesKhallan",
	"koreanisch": "SPACE1889.FamilyOfLanguagesKoreanisch",
	"kuschitisch": "SPACE1889.FamilyOfLanguagesKuschitisch",
	"mayanisch": "SPACE1889.FamilyOfLanguagesMayanisch",
	"moabitisch": "SPACE1889.FamilyOfLanguagesMoabitisch",
	"nigerkongo": "SPACE1889.FamilyOfLanguagesNigerkongo",
	"nilosaharanisch": "SPACE1889.FamilyOfLanguagesNilosaharanisch",
	"romanisch": "SPACE1889.FamilyOfLanguagesRomanisch",
	"rugoraant": "SPACE1889.FamilyOfLanguagesRugoraant",
	"selenitisch": "SPACE1889.FamilyOfLanguagesSelenitisch",
	"semitisch": "SPACE1889.FamilyOfLanguagesSemitisch",
	"sinotibetisch": "SPACE1889.FamilyOfLanguagesSinotibetisch",
	"slawisch": "SPACE1889.FamilyOfLanguagesSlawisch",
	"syrtanisch": "SPACE1889.FamilyOfLanguagesSyrtanisch",
	"taikadai": "SPACE1889.FamilyOfLanguagesTaikadai",
	"tempes": "SPACE1889.FamilyOfLanguagesTempes",
	"tossianisch": "SPACE1889.FamilyOfLanguagesTossianisch",
	"tuerkisch": "SPACE1889.FamilyOfLanguagesTuerkisch",
	"utoaztekisch": "SPACE1889.FamilyOfLanguagesUtoaztekisch",
	"venusisch": "SPACE1889.FamilyOfLanguagesVenusisch"
};

SPACE1889.languages = {
	"no": "-",
	"aerianisch": "SPACE1889.LanguageAerianisch",
	"aethani": "SPACE1889.LanguageAethani",
	"afrikaans": "SPACE1889.LanguageAfrikaans",
	"akkadisch": "SPACE1889.LanguageAkkadisch",
	"alaanawaak": "SPACE1889.LanguageAlaanawaak",
	"altphaetonisch": "SPACE1889.LanguageAltphaetonisch",
	"altaegyptisch": "SPACE1889.LanguageAltaegyptisch",
	"altgriechisch": "SPACE1889.LanguageAltgriechisch",
	"althebraeisch": "SPACE1889.LanguageAlthebraeisch",
	"altkirchenslawisch": "SPACE1889.LanguageAltkirchenslawisch",
	"amaash": "SPACE1889.LanguageAmaash",
	"apache": "SPACE1889.LanguageApache",
	"arabisch": "SPACE1889.LanguageArabisch",
	"aramaeisch": "SPACE1889.LanguageAramaeisch",
	"arapaho": "SPACE1889.LanguageArapaho",
	"arcadisch": "SPACE1889.LanguageArcadisch",
	"aserbaidschanisch": "SPACE1889.LanguageAserbaidschanisch",
	"avestisch": "SPACE1889.LanguageAvestisch",
	"aymara": "SPACE1889.LanguageAymara",
	"aztekisch": "SPACE1889.LanguageAztekisch",
	"bengali": "SPACE1889.LanguageBengali",
	"blackfoot": "SPACE1889.LanguageBlackfoot",
	"bretonisch": "SPACE1889.LanguageBretonisch",
	"boehmischTschechisch": "SPACE1889.LanguageBoehmischTschechisch",
	"bulgarisch": "SPACE1889.LanguageBulgarisch",
	"cebreni": "SPACE1889.LanguageCebreni",
	"cheyenne": "SPACE1889.LanguageCheyenne",
	"comanche": "SPACE1889.LanguageComanche",
	"cree": "SPACE1889.LanguageCree",
	"cydonisch": "SPACE1889.LanguageCydonisch",
	"daenisch": "SPACE1889.LanguageDaenisch",
	"deutsch": "SPACE1889.LanguageDeutsch",
	"dinka": "SPACE1889.LanguageDinka",
	"edenti": "SPACE1889.LanguageEdenti",
	"eiskrabbensprache": "SPACE1889.LanguageEiskrabbensprache",
	"englisch": "SPACE1889.LanguageEnglisch",
	"estnisch": "SPACE1889.LanguageEstnisch",
	"euxine": "SPACE1889.LanguageEuxine",
	"finnisch": "SPACE1889.LanguageFinnisch",
	"franzoesisch": "SPACE1889.LanguageFranzoesisch",
	"fulfulde": "SPACE1889.LanguageFulfulde",
	"gaashwaan": "SPACE1889.LanguageGaashwaan",
	"gallisch": "SPACE1889.LanguageGallisch",
	"garawa": "SPACE1889.LanguageGarawa",
	"griechisch": "SPACE1889.LanguageGriechisch",
	"gunwinyguan": "SPACE1889.LanguageGunwinyguan",
	"hebraeisch": "SPACE1889.LanguageHebraeisch",
	"hellanisch": "SPACE1889.LanguageHellanisch",
	"hespesianisch": "SPACE1889.LanguageHespesianisch",
	"hindi": "SPACE1889.LanguageHindi",
	"hochoenotrisch": "SPACE1889.LanguageHochoenotrisch",
	"hopi": "SPACE1889.LanguageHopi",
	"hupa": "SPACE1889.LanguageHupa",
	"igbo": "SPACE1889.LanguageIgbo",
	"ilokano": "SPACE1889.LanguageIlokano",
	"irisch": "SPACE1889.LanguageIrisch",
	"isan": "SPACE1889.LanguageIsan",
	"islaendisch": "SPACE1889.LanguageIslaendisch",
	"jiddisch": "SPACE1889.LanguageJiddisch",
	"italienisch": "SPACE1889.LanguageItalienisch",
	"japanisch": "SPACE1889.LanguageJapanisch",
	"jaqaru": "SPACE1889.LanguageJaqaru",
	"java": "SPACE1889.LanguageJava",
	"kannada": "SPACE1889.LanguageKannada",
	"kantonesisch": "SPACE1889.LanguageKantonesisch",
	"kasachisch": "SPACE1889.LanguageKasachisch",
	"kekchi": "SPACE1889.LanguageKekchi",
	"khallan": "SPACE1889.LanguageKhallan",
	"khmer": "SPACE1889.LanguageKhmer",
	"koline": "SPACE1889.LanguageKoline",
	"koptisch": "SPACE1889.LanguageKoptisch",
	"koreanisch": "SPACE1889.LanguageKoreanisch",
	"kurdisch": "SPACE1889.LanguageKurdisch",
	"lango": "SPACE1889.LanguageLango",
	"latein": "SPACE1889.LanguageLatein",
	"luo": "SPACE1889.LanguageLuo",
	"malaiisch": "SPACE1889.LanguageMalaiisch",
	"malayalam": "SPACE1889.LanguageMalayalam",
	"mandarin": "SPACE1889.LanguageMandarin",
	"massai": "SPACE1889.LanguageMassai",
	"mayathan": "SPACE1889.LanguageMayathan",
	"memnitisch": "SPACE1889.LanguageMemnitisch",
	"meroisch/soomvanli": "SPACE1889.LanguageMeroisch/soomvanli",
	"min": "SPACE1889.LanguageMin",
	"nagaaryani": "SPACE1889.LanguageNagaaryani",
	"napisch": "SPACE1889.LanguageNapisch",
	"naraIma": "SPACE1889.LanguageNaraIma",
	"navajo": "SPACE1889.LanguageNavajo",
	"nepali": "SPACE1889.LanguageNepali",
	"nepenthesisch": "SPACE1889.LanguageNepenthesisch",
	"niederlaendisch": "SPACE1889.LanguageNiederlaendisch",
	"noachisch": "SPACE1889.LanguageNoachisch",
	"norwegisch": "SPACE1889.LanguageNorwegisch",
	"nyanya": "SPACE1889.LanguageNyanya",
	"ornumisch": "SPACE1889.LanguageOrnumisch",
	"oromo": "SPACE1889.LanguageOromo",
	"pamanyungan": "SPACE1889.LanguagePamanyungan",
	"panjabi": "SPACE1889.LanguagePanjabi",
	"parhooni/gaaryani": "SPACE1889.LanguageParhooni/gaaryani",
	"parthisch": "SPACE1889.LanguageParthisch",
	"paschtu": "SPACE1889.LanguagePaschtu",
	"persisch": "SPACE1889.LanguagePersisch",
	"phoenizisch": "SPACE1889.LanguagePhoenizisch",
	"polnisch": "SPACE1889.LanguagePolnisch",
	"portugiesisch": "SPACE1889.LanguagePortugiesisch",
	"protomaya": "SPACE1889.LanguageProtomaya",
	"rajasthani": "SPACE1889.LanguageRajasthani",
	"kashmiri": "SPACE1889.LanguageKashmiri",
	"rumaenisch": "SPACE1889.LanguageRumaenisch",
	"russisch": "SPACE1889.LanguageRussisch",
	"ryukyu": "SPACE1889.LanguageRyukyu",
	"samisch": "SPACE1889.LanguageSamisch",
	"sanskrit": "SPACE1889.LanguageSanskrit",
	"schottischgaelisch": "SPACE1889.LanguageSchottischgaelisch",
	"schwedisch": "SPACE1889.LanguageSchwedisch",
	"selenitisch": "SPACE1889.LanguageSelenitisch",
	"serbisch": "SPACE1889.LanguageSerbisch",
	"shona": "SPACE1889.LanguageShona",
	"shoshoni": "SPACE1889.LanguageShoshoni",
	"somali": "SPACE1889.LanguageSomali",
	"songaaryani": "SPACE1889.LanguageSongaaryani",
	"spanisch": "SPACE1889.LanguageSpanisch",
	"sunda": "SPACE1889.LanguageSunda",
	"swahili": "SPACE1889.LanguageSwahili",
	"tamil": "SPACE1889.LanguageTamil",
	"telugu": "SPACE1889.LanguageTelugu",
	"tempes": "SPACE1889.LanguageTempes",
	"thailaendisch": "SPACE1889.LanguageThailaendisch",
	"tharkisch": "SPACE1889.LanguageTharkisch",
	"tossianisch": "SPACE1889.LanguageTossianisch",
	"tuerkisch": "SPACE1889.LanguageTuerkisch",
	"uigurisch": "SPACE1889.LanguageUigurisch",
	"umbranisch": "SPACE1889.LanguageUmbranisch",
	"ungarisch": "SPACE1889.LanguageUngarisch",
	"urdu": "SPACE1889.LanguageUrdu",
	"usbekisch": "SPACE1889.LanguageUsbekisch",
	"venusisch": "SPACE1889.LanguageVenusisch",
	"vietnamesisch": "SPACE1889.LanguageVietnamesisch",
	"walisisch": "SPACE1889.LanguageWalisisch",
	"wororan": "SPACE1889.LanguageWororan",
	"wu": "SPACE1889.LanguageWu",
	"yoruba": "SPACE1889.LanguageYoruba",
	"zaph": "SPACE1889.LanguageZaph",
	"zhuang": "SPACE1889.LanguageZhuang",
	"zulu": "SPACE1889.LanguageZulu"
};

SPACE1889.weaknessTypes = {
	"koerperlich": "SPACE1889.WeaknessTypeKoerperlich",
	"geistig": "SPACE1889.WeaknessTypeGeistig",
	"sozial": "SPACE1889.WeaknessTypeSozial",
	"sonstige": "SPACE1889.WeaknessTypeSonstige"
};

SPACE1889.publications = {
	"grw": "SPACE1889.PublicationGrw",
	"ee": "SPACE1889.PublicationEe",
	"luna": "SPACE1889.PublicationLuna",
	"mars": "SPACE1889.PublicationMars",
	"merkur": "SPACE1889.PublicationMerkur",
	"venus": "SPACE1889.PublicationVenus",
	"aev1": "SPACE1889.PublicationAev1",
	"aev2": "SPACE1889.PublicationAev2",
	"aeds": "SPACE1889.PublicationAeds",
	"nsc": "SPACE1889.PublicationNsc",
	"uh": "SPACE1889.PublicationUh",
	"sg": "SPACE1889.PublicationSg"
};


SPACE1889.publicationsAbbreviations = {
	"grw": "SPACE1889.PublicationGrwAbbr",
	"ee": "SPACE1889.PublicationEeAbbr",
	"luna": "SPACE1889.PublicationLunaAbbr",
	"mars": "SPACE1889.PublicationMarsAbbr",
	"merkur": "SPACE1889.PublicationMerkurAbbr",
	"venus": "SPACE1889.PublicationVenusAbbr",
	"aev1": "SPACE1889.PublicationAev1Abbr",
	"aev2": "SPACE1889.PublicationAev2Abbr",
	"aeds": "SPACE1889.PublicationAedsAbbr",
	"nsc": "SPACE1889.PublicationNscAbbr",
	"uh": "SPACE1889.PublicationUhAbbr",
	"sg": "SPACE1889.PublicationSgAbbr"
};

SPACE1889.creatureOrigins = {
	"erde": "SPACE1889.LanguageOriginErde",
	"luna": "SPACE1889.LanguageOriginLuna",
	"mars": "SPACE1889.LanguageOriginMars",
	"merkur": "SPACE1889.LanguageOriginMerkur",
	"phaeton": "SPACE1889.LanguageOriginPhaeton",
	"venus": "SPACE1889.LanguageOriginVenus" 
}

SPACE1889.creatureArchetypes = {
	"dinosaur": "SPACE1889.CreatureTypeDinosaur",
	"insect": "SPACE1889.CreatureTypeInsect",
	"animal": "SPACE1889.CreatureTypeAnimal",
	"plant": "SPACE1889.CreatureTypePlant"
};

SPACE1889.creatureMovementType = {
	"amphibious": "SPACE1889.CreatureMovementTypeAmphibious",
	"flying": "SPACE1889.CreatureMovementTypeFlying",
	"fossorial": "SPACE1889.CreatureMovementTypeFossorial",
	"ground": "SPACE1889.CreatureMovementTypeNormal",
	"swimming": "SPACE1889.CreatureMovementTypeSwimming",
	"jumper": "SPACE1889.CreatureMovementTypeJumper",
	"immobile": "SPACE1889.CreatureMovementTypeImmobile",
	"manylegged": "SPACE1889.CreatureMovementTypeManyLegged"
};

SPACE1889.moneyTypes = {
	"money": "SPACE1889.MoneyTypeMoney",
	"chainMoney": "SPACE1889.MoneyTypeChainMoney",
	"manascha": "SPACE1889.MoneyTypeManascha",
	"valkaarra": "SPACE1889.MoneyTypeValkaarra",
	"burkach": "SPACE1889.MoneyTypeBurkach",
	"aahaarimi": "SPACE1889.MoneyTypeAahaarimi"
};

SPACE1889.weaponCapacityTypes = {
	"default": "",
	"belt": "SPACE1889.WeaponCapacityTypeBelt",
	"strip": "SPACE1889.WeaponCapacityTypeStrip",
	"internal": "SPACE1889.WeaponCapacityTypeInternal",
	"magazine": "SPACE1889.WeaponCapacityTypeMagazine",
	"revolver": "SPACE1889.WeaponCapacityTypeRevolver",
	"powercell": "SPACE1889.WeaponCapacityTypePowercell",
	"chemicalcontainer": "SPACE1889.WeaponCapacityTypeChemicalTank"
}

SPACE1889.weaponCapacityTypesAbbr = {
	"default": "",
	"belt": "SPACE1889.WeaponCapacityTypeBeltAbbr",
	"strip": "SPACE1889.WeaponCapacityTypeStripAbbr",
	"internal": "SPACE1889.WeaponCapacityTypeInternalAbbr",
	"magazine": "SPACE1889.WeaponCapacityTypeMagazineAbbr",
	"revolver": "SPACE1889.WeaponCapacityTypeRevolverAbbr",
	"powercell": "SPACE1889.WeaponCapacityTypePowercellAbbr",
	"chemicalcontainer": "SPACE1889.WeaponCapacityTypeChemicalTankAbbr"
}

SPACE1889.ammunitionCapacityTypes = {
	"default": "",
	"belt": "SPACE1889.WeaponCapacityTypeBelt",
	"strip": "SPACE1889.WeaponCapacityTypeStrip",
	"magazine": "SPACE1889.WeaponCapacityTypeMagazine",
	"powercell": "SPACE1889.WeaponCapacityTypePowercell",
	"chemicalcontainer": "SPACE1889.WeaponCapacityTypeChemicalTank"
}

SPACE1889.weaponAmmunitionTypes = {
	"default": "",
	"arrows": "SPACE1889.AmmunitionTypeArrows",
	"bolts": "SPACE1889.AmmunitionTypeBolts",
	"darts": "SPACE1889.AmmunitionTypeDarts",
	"stones": "SPACE1889.AmmunitionTypeStones",
	"bullets": "SPACE1889.AmmunitionTypeBullets",
	"catridges": "SPACE1889.AmmunitionTypeCartridges",
	"grenades": "SPACE1889.AmmunitionTypeGrenades",
	"power": "SPACE1889.AmmunitionTypePower",
	"chemicals": "SPACE1889.AmmunitionTypeChemicals"
}

SPACE1889.weaponHand = {
	"none": "SPACE1889.WeaponUseNotReady",
	"primaryHand": "SPACE1889.WeaponUsePrimaryHand",
	"offHand": "SPACE1889.WeaponUseOffHand",
	"bothHands": "SPACE1889.WeaponUseBothHands"
}

SPACE1889.weaponHandIcon = {
	"none": "far fa-ban",
	"primaryHand": "far fa-hand-rock",
	"offHand": "fal fa-hand-paper",
	"bothHands": "far fa-handshake"
}

SPACE1889.effects = {
	"none": "",
	"stun": "EFFECT.StatusStunned",
	"prone": "EFFECT.StatusProne",
	"unconscious": "EFFECT.StatusUnconscious",
	"paralysis": "EFFECT.StatusParalysis",
	"fear": "EFFECT.StatusFear",
	"burning": "EFFECT.StatusBurning",
	"frozen": "EFFECT.StatusFrozen",
	"grappled": "SPACE1889.EffectGrappled",
	"dead": "EFFECT.StatusDead",
	"noActiveDefense": "SPACE1889.EffectNoActiveDefence",
	"totalDefense": "SPACE1889.TotalDefense",
	"dying": "SPACE1889.EffectDying"
}

SPACE1889.effectsDescription = {
	"none": "",
	"stun": "SPACE1889.EffectStunInfo",
	"prone": "SPACE1889.EffectProneInfo",
	"unconscious": "SPACE1889.EffectUnconsicousInfo",
	"paralysis": "SPACE1889.EffectParalysisInfo",
	"fear": "SPACE1889.EffectFearInfo",
	"burning": "SPACE1889.EffectBurningInfo",
	"frozen": "SPACE1889.EffectFrozenInfo",
	"grappled": "SPACE1889.EffectGrappledInfo",
	"dead": "SPACE1889.EffectDeadInfo",
	"noActiveDefense": "SPACE1889.EffectNoActiveDefenseInfo",
	"totalDefense": "SPACE1889.EffectTotalDefenseInfo",
	"dying": "SPACE1889.EffectDyingInfo"
}

SPACE1889.effectIcons = {
	"stun": "icons/svg/daze.svg",
	"prone": "icons/svg/falling.svg",
	"unconscious": "icons/svg/unconscious.svg",
	"paralysis": "icons/svg/paralysis.svg",
	"fear": "icons/svg/terror.svg",
	"burning": "icons/svg/fire.svg",
	"frozen": "icons/svg/frozen.svg",
	"grappled": "icons/svg/net.svg",
	"dead": "icons/svg/skull.svg",
	"noActiveDefense": "systems/space1889/icons/svg/no-active-defense.svg",
	"totalDefense": "systems/space1889/icons/svg/total-defense.svg",
	"dying": "systems/space1889/icons/svg/dying.svg"
}

SPACE1889.vehicleManoeuvres = {
	"ApproachDistance": "SPACE1889.VehicleApproachDistance",
	"UtmostPower":"SPACE1889.VehicleUtmostPower",
	"Turnaround":"SPACE1889.VehicleTurnaround",
	"AbruptBrakingAcceleration":"SPACE1889.VehicleAbruptBrakingAcceleration",
	"Ramming": "SPACE1889.VehicleRamming",
	"defense": "SPACE1889.SecondaryAttributeDef",
	"totalDefense": "SPACE1889.TotalDefense",
	"Attack": "SPACE1889.Attack",
	"TotalAttack": "SPACE1889.VehicleTotalAttack",
	"DoubleShot":"SPACE1889.VehicleDoubleShot",
	"ContinuousFire":"SPACE1889.VehicleContinuousFire",
	"AimedShot":"SPACE1889.VehicleAimedShot",
	"Signaling":"SPACE1889.VehicleSignaling",
	"TemporaryRepairs":"SPACE1889.VehicleTemporaryRepairs",
	"Board":"SPACE1889.VehicleBoard"
}

SPACE1889.vehicleManoeuvresToSkill = {
	"ApproachDistance": "SPACE1889.VehiclePilotSkill",
	"UtmostPower": "SPACE1889.VehiclePilotSkill",
	"Turnaround": "SPACE1889.VehiclePilotSkill",
	"AbruptBrakingAcceleration": "SPACE1889.VehiclePilotSkill",
	"Ramming": "SPACE1889.VehiclePilotSkill",
	"defense": "SPACE1889.VehiclePilotSkill",
	"totalDefense": "SPACE1889.VehiclePilotSkill",
	"Attack": "SPACE1889.SkillGeschuetze",
	"TotalAttack": "SPACE1889.SkillGeschuetze",
	"DoubleShot": "SPACE1889.SkillGeschuetze",
	"ContinuousFire": "SPACE1889.SkillGeschuetze",
	"AimedShot": "SPACE1889.SkillGeschuetze",
	"Signaling": "SPACE1889.SpeciSkillCodes",
	"TemporaryRepairs": "SPACE1889.SkillGroupHandwerk",
	"Board": "SPACE1889.SkillSportlichkeit"
}

SPACE1889.vehicleManoeuvresToPosition = {
	"ApproachDistance": "pilot",
	"UtmostPower": "pilot",
	"Turnaround": "pilot",
	"AbruptBrakingAcceleration": "pilot",
	"Ramming": "pilot",
	"defense": "pilot",
	"totalDefense": "pilot",
	"Attack": "gunner",
	"TotalAttack": "gunner",
	"DoubleShot": "gunner",
	"ContinuousFire": "gunner",
	"AimedShot": "gunner",
	"Signaling": "signaler",
	"TemporaryRepairs": "mechanic",
	"Board": ""
}

SPACE1889.vehicleCrewPositions = {
	"captain": "SPACE1889.VehicleCaptain",
	"pilot": "SPACE1889.VehiclePilot",
	"copilot": "SPACE1889.VehicleCopilot",
	"gunner": "SPACE1889.VehicleGunner",
	"signaler": "SPACE1889.VehicleSignaler",
	"lookout": "SPACE1889.VehicleLookout",
	"mechanic": "SPACE1889.VehicleMechanic",
	"medic": "SPACE1889.VehicleMedic"
}

SPACE1889.crewTemper = {
	"hochmotiviert": "SPACE1889.VehicleCrewTemperHighlyMotivated",
	"normal": "SPACE1889.VehicleCrewTemperRegular",
	"angespannt": "SPACE1889.VehicleCrewTemperTensed",
	"befehlsverweigerung": "SPACE1889.VehicleCrewTemperInsubordination",
	"meuterei": "SPACE1889.VehicleCrewTemperMutiny"
}

SPACE1889.weaponMountSpots= {
	"bow": "SPACE1889.VehicleWeaponMountSpotBow",
	"stern": "SPACE1889.VehicleWeaponMountSpotStern",
	"port": "SPACE1889.VehicleWeaponMountSpotPort",
	"starboard": "SPACE1889.VehicleWeaponMountSpotStarboard"
}

SPACE1889.crewExperience = {
	"rookie": "SPACE1889.VehicleCrewExperienceRookie",
	"regular": "SPACE1889.VehicleCrewExperienceRegular",
	"veteran": "SPACE1889.VehicleCrewExperienceVeteran",
	"elite": "SPACE1889.VehicleCrewExperienceElite",
	"custom": "SPACE1889.VehicleCrewExperienceCustom"
}

SPACE1889.styles = {
    "space1889-immersive": "SPACE1889.ConfigGlobalStyleImmersive",
    "space1889-naked": "SPACE1889.ConfigGlobalStyleNaked"
}

SPACE1889.gravity = {
	"earth": "SPACE1889.GravityEarth",
	"venus": "SPACE1889.GravityVenus",
	"mars": "SPACE1889.GravityMars",
	"0.8": "SPACE1889.Gravity08",
	"0.7": "SPACE1889.Gravity07",
	"0.6": "SPACE1889.Gravity06",
	"0.5": "SPACE1889.Gravity05",
	"mercury": "SPACE1889.GravityMercury",
	"0.3": "SPACE1889.Gravity03",
	"0.2": "SPACE1889.Gravity02",
	"io":"SPACE1889.GravityIo",
	"luna": "SPACE1889.GravityLuna",
	"ganymed": "SPACE1889.GravityGanymed",
	"titan": "SPACE1889.GravityTitan",
	"0.1": "SPACE1889.Gravity01",
	"zeroGravity": "SPACE1889.GravityZeroGravity"
}

SPACE1889.gravityZone = {
	"earth": { zone: 1.0, value: 1.0},
	"venus": { zone: 1.0, value: 1.0},
	"mars": { zone: 1.0, value: 0.9 },
	"0.8": { zone: 0.8, value: 0.8 },
	"0.7": { zone: 0.8, value: 0.7 },
	"0.6": { zone: 0.6, value: 0.6 },
	"0.5": { zone: 0.6, value: 0.5 },
	"mercury": { zone: 0.4, value: 0.4},
	"0.3": { zone: 0.4, value: 0.3 },
	"0.2": { zone: 0.2, value: 0.2 },
	"io": { zone: 0.2, value: 0.18 },
	"luna": { zone: 0.2, value: 0.16 },
	"ganymed": { zone: 0.2, value: 0.15 },
	"titan": { zone: 0.2, value: 0.14 },
	"0.1": { zone: 0.2, value: 0.1 },
	"zeroGravity": { zone: 0.0, value: 0.001}
}

SPACE1889.propertyKeys = {
	"primary": "SPACE1889.Abilities",
	"secondary": "SPACE1889.SecondaryAttributes",
	"skill": "SPACE1889.Skill"
}

SPACE1889.itemUseTypes = {
	"consumables": "SPACE1889.Consumables",
	"rechargeable": "SPACE1889.Rechargeable",
	"refillable": "SPACE1889.Refillable",
	"permanentlyUsable": "SPACE1889.PermanentlyUsable"
}

SPACE1889.visionModes = {
	"basic": "VISION.ModeBasicVision",
	"darkvision": "VISION.ModeDarkvision",
	"monochromatic": "VISION.ModeMonochromatic",
	"tremorsense": "VISION.ModeTremorsense",
	"lightAmplification": "VISION.ModeLightAmplification"
}

SPACE1889.lightAnimations = {
	"none": "SETTINGS.None",
	"chroma": "LIGHT.AnimationChroma",
	"dome": "LIGHT.AnimationLightDome",
	"emanation": "LIGHT.AnimationEmanation",
	"energy": "LIGHT.AnimationEnergyField",
	"fairy": "LIGHT.AnimationFairyLight",
	"flame": "LIGHT.AnimationFlame",
	"fog": "LIGHT.AnimationFog",
	"ghost": "LIGHT.AnimationGhostLight",
	"grid": "LIGHT.AnimationForceGrid",
	"hexa": "LIGHT.AnimationHexaDome",
	"hole": "LIGHT.AnimationBlackHole",
	"pulse": "LIGHT.AnimationPulse",
	"radialrainbow": "LIGHT.AnimationRadialRainbow",
	"rainbowswirl": "LIGHT.AnimationSwirlingRainbow",
	"roiling": "LIGHT.AnimationRoilingMass",
	"smokepatch": "LIGHT.AnimationSmokePatch",
	"starlight": "LIGHT.AnimationStarLight",
	"sunburst": "LIGHT.AnimationSunburst",
	"torch": "LIGHT.AnimationTorch",
	"vortex": "LIGHT.AnimationVortex",
	"wave": "LIGHT.AnimationWave",
	"witchwave": "LIGHT.AnimationBewitchingWave"
}

SPACE1889.lightShaderTechniques =
{
	0: "LIGHT.LegacyColoration",
	1: "LIGHT.AdaptiveLuminance",
	2: "LIGHT.InternalHalo",
	3: "LIGHT.ExternalHalo",
	4: "LIGHT.ColorBurn",
	5: "LIGHT.InternalBurn",
	6: "LIGHT.ExternalBurn",
	7: "LIGHT.LowAbsorption",
	8: "LIGHT.HighAbsorption",
	9: "LIGHT.InvertAbsorption",
	10: "LIGHT.NaturalLight"
}

SPACE1889.lightSourceHands =
{
	0: {id:"SPACE1889.RequiresNoHands", infoId: "SPACE1889.RequiresNoHandsInfo"},
	1: {id:"SPACE1889.RequiresOneHands", infoId: "SPACE1889.RequiresOneHandsInfo"},
	2: {id:"SPACE1889.RequiresTwoHands", infoId: "SPACE1889.RequiresTwoHandsInfo"}
}

SPACE1889.umlautMap = {
	'\u00dc': 'UE',
	'\u00c4': 'AE',
	'\u00d6': 'OE',
	'\u00fc': 'ue',
	'\u00e4': 'ae',
	'\u00f6': 'oe',
	'\u00df': 'ss',
}; 

