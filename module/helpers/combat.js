import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889RollHelper from "../helpers/roll-helper.js";
import DistanceMeasuring from "../helpers/distanceMeasuring.js"
import SPACE1889Light from "../helpers/light.js"

export default class SPACE1889Combat
{
	static getWeaponInHands(actor)
	{
		let primaryWeapon = undefined;
		let offHandWeapon = undefined;
		const weaponIds = SPACE1889Helper.getWeaponIdsInHands(actor);
		if (weaponIds.primary.length > 0)
			primaryWeapon = SPACE1889Helper.getWeapon(actor, weaponIds.primary[0]);
		if (weaponIds.off.length > 0)
			offHandWeapon = SPACE1889Helper.getWeapon(actor, weaponIds.off[0]);

		return { primaryWeapon: primaryWeapon, offHandWeapon: offHandWeapon };
	}

	static hasFreeHands(actor)
	{
		if (!actor)
			return false;

		if (actor.system.attributes.species.value === "selenit") 
			return true; 

		const lsBlocked = SPACE1889Light.blockedHandsFromLightSources(actor);
		const weapons = SPACE1889Combat.getWeaponInHands(actor);
		const primaryIsFree = (!weapons.primaryWeapon || SPACE1889Combat.canUseHandWhileHoldingTheWeapon(weapons.primaryWeapon)) && !lsBlocked.primary;
		const offHandIsFree = (!weapons.offHandWeapon || SPACE1889Combat.canUseHandWhileHoldingTheWeapon(weapons.offHandWeapon)) && !lsBlocked.off;

		return (primaryIsFree && offHandIsFree);
	}

	static canUseHandWhileHoldingTheWeapon(weapon)
	{
		if (!weapon)
			return true;

		return weapon.system.id === "schlag" || weapon.system.id === "schlagring";
	}

	static isCloseCombatWeapon(weapon, returnValueForUndefinedWeapons = true)
	{
		if (!weapon)
			return returnValueForUndefinedWeapons;

		return this.isCloseCombatSkill(weapon.system.skillId);
	}

	static isCloseCombatSkill(skillId)
	{
		return (skillId === "waffenlos" || skillId === "nahkampf");
	}

	static canDoDualWield(actor)
	{
		const weapons = this.getWeaponInHands(actor);
		return weapons.primaryWeapon != undefined && weapons.offHandWeapon != undefined && weapons.primaryWeapon != weapons.offHandWeapon;
	}

	static getDualWieldModificator(actor)
	{
		const mod = -4 + Math.max(0, (SPACE1889Helper.getTalentLevel(actor, "beidhaendig") - 1) * 2);
		return mod;
	}

	static canDoRapidFire(weapon)
	{
		if (weapon == undefined)
			return false;

		let validSkill = weapon.system.skillId == "geschuetze" || weapon.system.skillId == "schusswaffen" || weapon.system.skillId == "primitiverFernkampf";
		let validRate = weapon.system.rateOfFire == "V" || weapon.system.rateOfFire == "H/V" || weapon.system.rateOfFire == "H" || Number(weapon.system.rateOfFire) >= 2;
		let remainingRounds = weapon.system.ammunition.remainingRounds;
		let validAmmunition = remainingRounds >= 2;
		return { canDo: validSkill && validRate && validAmmunition, validRateOfFire: validRate, validAmmunition: validAmmunition, remainingRounds: remainingRounds };
	}

	static getRapidFireModificator(actor)
	{
		const mod = -4 + (2 * SPACE1889Helper.getTalentLevel(actor, "schnellschuss"));
		return mod;
	}

	static canDoFlurry(weapon)
	{
		this.isCloseCombatWeapon(weapon, false);
	}

	static getFlurryModificator(actor)
	{
		const mod = -4 + (2 * SPACE1889Helper.getTalentLevel(actor, "wirbeln"));
		return mod;
	}

	static isValidSweepingBlowWeapon(weapon)
	{
		if (weapon == undefined || actor == undefined)
			return false;

		this.isCloseCombatWeapon(weapon, false);
	}

	static canDoSweepingBlow(weapon, actorToken)
	{
		if (weapon == undefined || actor == undefined)
			return false;

		if (!this.isValidSweepingBlowWeapon(weapon))
			return false;

		// ToDo
		return true;
	}

	static getSweepingBlowModificator(actor)
	{
		const targets = game.user.targets;
		if (targets.size <= 1)
			return 0;

		let decuctionReduction = this._getTalentDeductionReduction2_4_8(SPACE1889Helper.getTalentLevel(actor, "rundumschlag"));
		if (actor.system.secondaries.size.total > 0)
			decuctionReduction += actor.system.secondaries.size.total;

		let deduction = targets.size * (-2);
		const distanceList = this._getMinSumDistance(targets).distanceList;

		// relevant ist hier der "leere Abstand" zwischen zwei Gegnern und da die Gegner eine Räumliche Ausdehnung haben
		// kann der Abstand der Mittelpunkte (bei grossen Kreaturen der naechsten zueinander liegenden Gridfelder) nicht 
		// direkt verwendet werden, sondern muss um einen Ausdehnungsfaktor der zwei Gegner reduziert werden
		const expansionValue = 0.65;

		for (const element of distanceList)
		{
			deduction -= Math.floor(Math.abs(element.distance - expansionValue) / 1.5) * 2;
		}

		return Math.min(0, deduction + decuctionReduction);
	}


	static canDoAutofire(weapon)
	{
		if (weapon == undefined)
			return false;

		return (weapon.system.skillId == "geschuetze" || weapon.system.skillId == "schusswaffen") && (weapon.system.rateOfFire == "V" || weapon.system.rateOfFire == "H/V");
	}

	static _canDoBaseAfMethod(weapon, requiredAmmo)
	{
		if (weapon == undefined)
			return { canDo: false, weaponCanAutoFire: false, validAmmunition: false, remainingRounds: 0 }

		const canAutoFire = this.canDoAutofire(weapon);
		let remainingRounds = weapon.system.ammunition.remainingRounds;
		let validAmmunition = remainingRounds >= requiredAmmo;
		return { canDo: canAutoFire && validAmmunition, weaponCanAutoFire: canAutoFire, validAmmunition: validAmmunition, remainingRounds: remainingRounds };
	}

	static canDoBurstFire(weapon)
	{
		return this._canDoBaseAfMethod(weapon, 3);
	}

	static getBurstFireModificator()
	{
		return 1;
	}


	static canDoFullAutofire(weapon)
	{
		return this._canDoBaseAfMethod(weapon, 20);
	}

	static getFullAutofireModificator()
	{
		return 3;
	}

	static canDoStrafing(weapon)
	{
		return this._canDoBaseAfMethod(weapon, 20);
	}

	static getStrafingModificator(actor)
	{
		const targets = game.user.targets
		const baseMod = actor ? 3 + SPACE1889Helper.getTalentLevel(actor, "autofeuer") : 3;
		if (targets.size <= 1)
			return baseMod;

		const distance = this._getMinSumDistance(targets).sum;
		const decuctionReduction = (2 * SPACE1889Helper.getTalentLevel(actor, "streufeuer"));

		return baseMod + Math.min(0, decuctionReduction - (Math.floor(distance / 1.5) * 2));
	}

	static getCombatToken(actor)
	{
		if (!game.combat)
			return undefined;

		let token = undefined;
		if (actor.isToken && actor.token)
		{
			const combatant = game.combat?.combatants.find((e) => e.tokenId == actor.token.id);
			if (combatant)
				return actor.parent;
		}

		if (actor.type == 'character' || actor.link != '')
		{
			const combatant = game.combat?.combatants.find(e => e.actorId == actor?.id);
			if (combatant)
			{
				token = game.scenes.get(combatant.sceneId).tokens.find(e => e.id == combatant.tokenId);
			}
		}
		return token;
	}

	static getToken(actor)
	{
		if (actor?.isToken && actor.token)
			return actor.token;

		const tokens = game.scenes.viewed.tokens.filter(e => e.actorId == actor.id);
		if (tokens.length == 1)
			return tokens[0];

		if (tokens.length > 1)
		{
			for (const token of tokens)
			{
				if (canvas.tokens.controlled.find(t => t.document.id == token.id))
					return token;
			}

			const theToken = tokens.find(t => t.id == actor._sheet?.token?.id);
			return theToken ? theToken : tokens[0];
		}
		return undefined;
	}

	static _getNearest(origin, tokens, ignorIds)
	{
		if (origin == undefined || tokens == undefined || ignorIds == undefined)
			return { token: undefined, distance: 0 };

		let distance = Infinity;
		let nearestToken = undefined;
		for (const token of tokens)
		{
			if (ignorIds.indexOf(token.id) != -1 || token.id == origin.id)
				continue;

			let tokenDistance = DistanceMeasuring.getWorldDistance(origin.document, token.document);
			if (tokenDistance < distance)
			{
				distance = tokenDistance;
				nearestToken = token;
			}
		}

		return { token: nearestToken, distance: (nearestToken == undefined ? 0 : distance) };
	}
	
	static _getNearestDistance(origin, tokens)
	{
		let ignoreIds = [];
		let distanceList = [];
		let size = tokens.size;
		if (tokens.find(e => e.id == origin.id) != undefined)
		{
			ignoreIds.push(origin.id);
			size -= 1;
		}

		let start = origin;

		for (let i = 0; i < size; ++i)
		{
			const info = this._getNearest(start, tokens, ignoreIds);
			const distInfo = { from: origin, to: info.token, distance: info.distance };
			if (info.token == undefined)
				break;
			
			distanceList.push(distInfo);
			ignoreIds.push(info.token);
			start = info.token;
		} 

		let sum = 0;
		for (const element of distanceList)
		{
			sum += element.distance;
		}
		return { sum: sum, distanceList: distanceList };
	}

	static _getMinSumDistance(tokens)
	{
		let distance = { sum: Infinity, distanceList: [] };
		
		for (const token of tokens)
		{
			const theDistance = this._getNearestDistance(token, tokens);
			if (theDistance.sum < distance.sum)
				distance = theDistance;
		}
		return distance;
	}

	static _getTalentDeductionReduction2_4_8(level)
	{
		if (level == 1)
			return 2;
		if (level == 2)
			return 4;
		if (level >= 3)
			return 8;
		return 0;
	}

	static isTargetInRange(actor, weapon)
	{
		const token = this.getCombatToken(actor) || this.getToken(actor);
		if (!token || game.user.targets.size == 0)
			return true;

		const isCloseCombatWeapon = this.isCloseCombatWeapon(weapon);
		let outOfRange = 0;

		for (const targetId of game.user.targets.ids)
		{
			const target = game.user.targets.find(e => e.id == targetId);
			let distanceInfo = DistanceMeasuring.getDistanceInfo(token, target.document, isCloseCombatWeapon);
			if (isCloseCombatWeapon && !distanceInfo.isCloseCombatRange)
				++outOfRange;
		}

		if (outOfRange > 0)
		{
			if (game.user.targets.size == 1)
				ui.notifications.info(game.i18n.localize("SPACE1889.NotInRange"));
			else
				ui.notifications.info(game.i18n.localize("SPACE1889.OutOfCloseCombatRange"));
			return false;
		}
		return true;
	}

	static isInCloseCombatRange(actor, targetToken)
	{
		const actorToken = this.getCombatToken(actor) || this.getToken(actor);
		if (actorToken && targetToken)
		{
			let distanceInfo = DistanceMeasuring.getDistanceInfo(actorToken, targetToken.document, true);
			if (!distanceInfo.isCloseCombatRange)
			{
				ui.notifications.info(game.i18n.localize("SPACE1889.NotInRange"));
				return false;
			}
			return true;
		}
		return false;
	}

	static CheckEncounterAndTarget(tokenDocument, actor, usedweapon, manoeuverType, notify, showDialog)
	{
		if (!SPACE1889Combat.IsActorParticipantOfTheActiveEncounter(actor, notify))
			return false;

		const targetInfo = SPACE1889Helper.getCombatSupportTargetInfo();
		if (targetInfo.targets == 0 || targetInfo.isDeadCount > 0)
		{
			SPACE1889RollHelper.reallyAttackDialog(usedweapon, manoeuverType, tokenDocument, actor, 0, showDialog, targetInfo);
			return false;
		}

		if (!SPACE1889Combat.isTargetInRange(actor, undefined))
			return false;

		return true;
	}


	static IsActorParticipantOfTheActiveEncounter(actor, notify)
	{
		if (game.combat == null)
			return true;

		if (game.combat.round == 0)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.EncounterNotStartet"));
			return false;
		}

		const isMember = this.getCombatToken(actor) != undefined;
		if (!isMember && notify)
		{
			const token = this.getToken(actor);
			const name = token ? token.name : actor.name;
			ui.notifications.info(game.i18n.format("SPACE1889.NoParticipantOfTheEncounter", { name : name }));
		}
		return isMember;
	}

	static testAttackDialog(wantedWeapon = undefined)
	{
		// ToDo: 

		// Ein Ziel Angriffe ausgrauen wenn mehr als ein Ziel ausgewählt ist?? 

		const controlledToken = SPACE1889Helper.getControlledTokenDocument();
		if (controlledToken == undefined)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.NoTokensSelected"));
			return;
		}
		this.AttackDialog(controlledToken.actor, wantedWeapon);

	}

	static AttackDialog(actor, wantedWeapon = undefined)
	{
		const token = this.getCombatToken(actor) || this.getToken(actor);

		const weaponInHands = SPACE1889Helper.getWeaponIdsInHands(actor);
		let weapon = undefined;
		let offHandWeapon = undefined;
		let isNebenHand = false;
		let forceToOffHand = false;

		if (wantedWeapon)
		{
			if (wantedWeapon.id != weaponInHands.primary[0] &&
				wantedWeapon.id != weaponInHands.off[0])
			{
				ui.notifications.info(game.i18n.format("SPACE1889.WeaponCanNotUsedIsNotReady", {weapon: wantedWeapon.name}));
				return;
			}

			if (wantedWeapon.id == weaponInHands.off[0] && wantedWeapon.id != weaponInHands.primary[0])
				forceToOffHand = true;
		}
		
		if (weaponInHands.primary.length > 0)
			weapon = SPACE1889Helper.getWeapon(actor, weaponInHands.primary[0]);
		if (weaponInHands.off.length > 0)
			offHandWeapon = SPACE1889Helper.getWeapon(actor, weaponInHands.off[0]);
		

		let canDoBeidhaendig = weapon != undefined && offHandWeapon != undefined && offHandWeapon != weapon;

		if ((weapon == undefined || forceToOffHand) && offHandWeapon != undefined)
		{
			weapon = offHandWeapon;
			isNebenHand = true;
		}

		const autofeuerBoost = SPACE1889Helper.getTalentLevel(actor, "autofeuer");

		const baseBeidhaendig = -4 + Math.max(0, (SPACE1889Helper.getTalentLevel(actor, "beidhaendig") - 1) * 2);
		const baseDoppelschuss = -4 + (2 * SPACE1889Helper.getTalentLevel(actor, "schnellschuss"));
		const baseStreufeuer = this.getStrafingModificator(actor);
		const baseDauerfeuer = 3 + autofeuerBoost;
		const baseVollerAngriff = 2;

		let baseValue = weapon ? weapon.system.attack : 10;
		const damageType = weapon ? weapon.system.damageTypeDisplay : "unbekannter Schadenstyp";
		const waffenName = weapon ? weapon.name : "Waffe XY";


		let isCloseCombatAttack = this.isCloseCombatWeapon(weapon);
		let distanceInfo = DistanceMeasuring.getDistanceInfo(token, game.user.targets.first()?.document, isCloseCombatAttack);
		const distanceMod = (isCloseCombatAttack ? 0 : SPACE1889Helper.getDistancePenalty(weapon, distanceInfo.distance));

		const hideText = ' hidden="true" ';

		const canDoAutoFeuer = weapon != undefined && (weapon.system.skillId == "geschuetze" || weapon.system.skillId == "schusswaffen") && (weapon.system.rateOfFire == "V" || weapon.system.rateOfFire == "H/V");
		const disableAutoFeuerInHtmlText = !canDoAutoFeuer ? `disabled="true" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogCanNotAutoFire")}"` : `data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogBurstFireToolTip")}"`;
		const hideSalveInHtlmText = canDoAutoFeuer ? "" : hideText;
		const baseSalve = 1 + autofeuerBoost;

		const disableBeidhaendigInHtlmText = !canDoBeidhaendig ? `disabled="true" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogCanNotDualWield")}"` : `data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogDualWieldToolTip")}"`;

		let canDoDoppelschuss = weapon != undefined && (weapon.system.skillId == "geschuetze" || weapon.system.skillId == "schusswaffen" || weapon.system.skillId == "primitiverFernkampf");
		const hideDoppelschussInHtml = canDoDoppelschuss ? "" : hideText;
		canDoDoppelschuss &= (weapon.system.rateOfFire == "V" || weapon.system.rateOfFire == "H/V" || weapon.system.rateOfFire == "H" || Number(weapon.system.rateOfFire) >= 2);
		const disableDoppelschussInHtlmText = !canDoDoppelschuss ? `disabled="true" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogCanNotRapidFire")}"` : `data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogRapidFireToolTip")}"`;

		const canDoRundumschlag = weapon != undefined && isCloseCombatAttack;
		const hideRundumschalgInHtlmText = !canDoRundumschlag ? hideText : "";
		const baseRundumschlag = this.getSweepingBlowModificator(actor);
		const disableRundumschlagInHtlmText = !canDoRundumschlag || game.user.targets.size < 2 ? `disabled="true" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogTooFewTargets")}"`: `data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogSweepingBlowToolTip")}"`;

		const canDoWirbeln = canDoRundumschlag;
		const hideWirbelnInHtlmText = !canDoWirbeln ? hideText : "";
		const baseWirbeln = -4 + (2 * SPACE1889Helper.getTalentLevel(actor, "wirbeln"));

		const disableStreufeuerInHtlmText = game.user.targets.size < 2 ? `disabled="true" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogTooFewTargets")}"`: `data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogStrafingToolTip")}"`;


		let targetToolTip = "";
		let targetNames = "";
		for (const targetId of game.user.targets.ids)
		{
			const theTarget = game.user.targets.find(e => e.id == targetId);
			let name = theTarget.name;
			let theDistanceInfo = DistanceMeasuring.getDistanceInfo(token, theTarget.document, isCloseCombatAttack);
			let targetDistance = theDistanceInfo.distance;
			let distanceString = targetDistance.toFixed(2).toString() + theDistanceInfo.unit;
			if (isCloseCombatAttack && !theDistanceInfo.isCloseCombatRange)
				distanceString = game.i18n.localize("SPACE1889.OutOfRange") + " " + distanceString;
			targetToolTip += name + " (" + distanceString + ")" + "\n";
			targetNames += (targetNames.length == 0 ? "" : ", ") + name;
		}
		let targetNamesInBrackets = "";
		if (targetNames.length > 0)
			targetNamesInBrackets = "(" + (targetNames.length > 45 ? targetNames.slice(0, 42) + "..." : targetNames) + ")";

		let optionen = SPACE1889Helper.getHtmlChatOptions();
		const modifierLabel = game.i18n.localize("SPACE1889.Modifier");
		const labelWurf = game.i18n.localize("SPACE1889.AttackValue") + ": ";


		function Recalc()
		{
			let mod = Number($("#modifier")[0].value);
			const salveBonus = $('#salve')[0].checked ? baseSalve : 0;
			const vollerAngriffBonus = $('#vollerAngriff')[0].checked ? baseVollerAngriff : 0;
			const beidhaendigMalus = $('#beidhaendig')[0].checked ? baseBeidhaendig : 0;
			const doppelschussMalus = $('#doppelschusss')[0].checked ? baseDoppelschuss : 0;
			const dauerFeuerBonus = $('#dauerFeuer')[0].checked ? baseDauerfeuer : 0;
			const streufeuerBonus = $('#streuFeuer')[0].checked ? baseStreufeuer : 0;
			const wirbelnBonus = $('#wirbeln')[0].checked ? baseWirbeln : 0;
			const rundumschlagBonus = $('#rundumschlag')[0].checked ? baseRundumschlag : 0;

			let attributValue = baseValue + mod + distanceMod + salveBonus + vollerAngriffBonus + beidhaendigMalus + doppelschussMalus + dauerFeuerBonus + streufeuerBonus + wirbelnBonus + rundumschlagBonus;

			$("#anzahlDerWuerfel")[0].value = attributValue.toString() + damageType;
		}

		function handleRender(html)
		{
			html.on('change', '.normal', () =>
			{
				Recalc();
			});

			html.on('change', '.salve', () =>
			{
				Recalc();
			});

			html.on('change', '.vollerAngriff', () =>
			{
				Recalc();
			});

			html.on('change', '.beidhaendig', () =>
			{
				Recalc();
			});

			html.on('change', '.doppelschusss', () =>
			{
				Recalc();
			});

			html.on('change', '.wirbeln', () =>
			{
				Recalc();
			});
	
			html.on('change', '.rundumschlag', () =>
			{
				Recalc();
			});

			html.on('change', '.dauerFeuer', () =>
			{
				Recalc();
			});

			html.on('change', '.streuFeuer', () =>
			{
				Recalc();
			});


			html.on('change', '.modInput', () =>
			{
				Recalc();
			});
			Recalc();
		}


		let dialogue = new Dialog(
		{
			title: `${game.i18n.localize("SPACE1889.AttackDialogAttackProbe")}`,
			content: `
				<form >
					<h2>${waffenName}: ${game.i18n.localize("SPACE1889.AttackDialogBaseValue")} ${baseValue}${damageType}</h2>
					<label data-tooltip="${targetToolTip}">${game.i18n.localize("SPACE1889.AttackDialogTargetCount")}: ${game.user.targets.size} ${targetNamesInBrackets}</label><br>
					<label>${game.i18n.localize("SPACE1889.Distance")} ${distanceInfo.distance.toFixed(2)}${distanceInfo.unit}: ${SPACE1889Helper.getSignedStringFromNumber(distanceMod)}</label>
					<fieldset>
						<legend>${game.i18n.localize("SPACE1889.AttackDialogAttackType")}</legend>
						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogSimpleAttack")}</legend>
							<input type="radio" id="normal" name="type" class="normal" value="N" checked>
							<label for="normal">${game.i18n.localize("SPACE1889.AttackDialogRegular")}</label><br>
							<div ${hideSalveInHtlmText}>            
								<input ${disableAutoFeuerInHtmlText} type="radio" id="salve" name="type" class="salve" value="S" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogBurstFireToolTip")}">
								<label ${disableAutoFeuerInHtmlText} for="salve" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogBurstFireToolTip")}">${game.i18n.format("SPACE1889.AttackDialogBurstFire", { bonus: SPACE1889Helper.getSignedStringFromNumber(baseSalve) })}</label><br>
							</div>
						</fieldset>

						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogTotalAttackHeadline")}</legend>
							<input type="radio" id="vollerAngriff" name="type" class="vollerAngriff" value="V">
							<label for="vollerAngriff">${game.i18n.localize("SPACE1889.AttackDialogTotalAttack")}</label><br>
			
							<input ${disableBeidhaendigInHtlmText} type="radio" id="beidhaendig" class="beidhaendig" name="type" value="B" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogDualWieldToolTip")}">
							<label ${disableBeidhaendigInHtlmText} for="beidhaendig" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogDualWieldToolTip")}">${game.i18n.format("SPACE1889.AttackDialogDualWield", { malus: SPACE1889Helper.getSignedStringFromNumber(baseBeidhaendig), hand: isNebenHand ? game.i18n.localize("SPACE1889.WeaponUseOffHand") : game.i18n.localize("SPACE1889.WeaponUsePrimaryHand")})}</label><br>
							<div ${hideDoppelschussInHtml}>
								<input ${disableDoppelschussInHtlmText} type="radio" id="doppelschusss" class="doppelschusss" name="type" value="B" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogRapidFireToolTip")}">
								<label ${disableDoppelschussInHtlmText} for="doppelschusss" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogRapidFireToolTip")}">${game.i18n.format("SPACE1889.AttackDialogRapidFire", { malus: SPACE1889Helper.getSignedStringFromNumber(baseDoppelschuss) })}</label><br>
							</div>
							<div ${hideWirbelnInHtlmText}>
								<input type="radio" id="wirbeln" class="wirbeln" name="type" value="B" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogFlurryToolTip")}">
								<label for="wirbeln" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogFlurryToolTip")}">${game.i18n.format("SPACE1889.AttackDialogFlurry", { malus: SPACE1889Helper.getSignedStringFromNumber(baseWirbeln) })}</label><br>
							</div>
							<div ${hideRundumschalgInHtlmText}>
								<input ${disableRundumschlagInHtlmText} type="radio" id="rundumschlag" class="rundumschlag" name="type" value="B">
								<label ${disableRundumschlagInHtlmText} for="rundumschlag">${game.i18n.format("SPACE1889.AttackDialogSweepingBlow", { malus: SPACE1889Helper.getSignedStringFromNumber(baseRundumschlag) })}</label><br>
							</div>
						</fieldset>

						<fieldset ${!canDoAutoFeuer ? hideText : ""}>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogAutoFireHeadline")}</legend>
							<input type="radio" id="dauerFeuer" class="dauerFeuer" name="type" value="DA" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogFullAutofireToolTip")}">
							<label for="dauerFeuer" data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogFullAutofireToolTip")}">${game.i18n.format("SPACE1889.AttackDialogFullAutofire", { bonus: SPACE1889Helper.getSignedStringFromNumber(baseDauerfeuer) })}</label><br>
			
							<input ${disableStreufeuerInHtlmText} type="radio" id="streuFeuer" class="streuFeuer" name="type" value="B">
							<label ${disableStreufeuerInHtlmText} for="streuFeuer">${game.i18n.format("SPACE1889.AttackDialogStrafing", { bonus: SPACE1889Helper.getSignedStringFromNumber(baseStreufeuer) })}</label><br>
						</fieldset>
					</fieldset>
					<ul>
					<li class="flexrow">
						<div class="item flexrow flex-group-left">
							<div>${modifierLabel}:</div> <input type="number" class="modInput" id="modifier" value = "0">
						</div>
					</li>
					<hr>
					<div class="space1889 sheet actor">
						<li class="flexrow">
							<h2 class="item flexrow flex-group-left ">
								<label for="zusammensetzung">${labelWurf}</label>
								<input class="h2input" id="anzahlDerWuerfel" value="10" disabled="true" visible="false">
							</h2>
						</li>
					</div>
					</ul>
					<hr>
					<p><select id="choices" name="choices">${optionen}</select></p>
				</form>`,
			buttons:
			{
				ok:
				{
					icon: '',
					label: game.i18n.localize("SPACE1889.Go"),
					callback: (html) => theCallback(html)
				},
				abbruch:
				{
					label: game.i18n.localize("SPACE1889.Cancel"),
					callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
					icon: `<i class="fas fa-times"></i>`
				}
			},
			default: "ok",
			render: handleRender
		});
	
		dialogue.render(true);

		async function theCallback(html)
		{
			const firstTargetId = (game.user.targets?.size > 0) ? game.user.targets.first().id : "";
			const target = game.user.targets.find(e => e.id == firstTargetId);

			let attackName = "";
			let toolTipInfo = "";
			let isFullAttack = false;
			let roundsToUse = 1;
			let rolls = 1;
			if (html.find('#salve')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeBurstFire");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseSalve);
				roundsToUse = 3;
			}
			else if (html.find('#vollerAngriff')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeTotalAttack");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseVollerAngriff);
				isFullAttack = true;
			}
			else if (html.find('#beidhaendig')[0].checked)
			{
				const hand = isNebenHand ? game.i18n.localize("SPACE1889.WeaponUseOffHand") : game.i18n.localize("SPACE1889.WeaponUsePrimaryHand");
				attackName = hand + " " + game.i18n.localize("SPACE1889.AttackTypeDualWield");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseBeidhaendig);
				isFullAttack = true;
			}
			else if (html.find('#doppelschusss')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeRapidFire");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseDoppelschuss);
				roundsToUse = 2;
				rolls = 2;
				isFullAttack = true;
			}
			else if (html.find('#dauerFeuer')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeFullAutofire");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseDauerfeuer);
				roundsToUse = 20;
				isFullAttack = true;
			}
			else if (html.find('#streuFeuer')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeStrafing");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseStreufeuer);
				roundsToUse = 20;
				isFullAttack = true;
			}
			else if (html.find('#rundumschlag')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeSweepingBlow");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseRundumschlag);
				isFullAttack = true;
			}
			else if (html.find('#wirbeln')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeFlurry");
				toolTipInfo = attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseWirbeln);
				rolls = 2;
				isFullAttack = true;
			}

			let titelInfo = attackName.length > 0 ? attackName + " " : "";
			if (game.user.targets.size > 0)
				titelInfo += game.i18n.format("SPACE1889.AttackOn", { targetName: targetNames });
			else
				titelInfo += game.i18n.localize("SPACE1889.Attack") ?? "Attack";


			const chatoption = html.find('#choices').val();
			const input = html.find('#anzahlDerWuerfel').val();
			const anzahl = input ? parseInt(input) : 0;

			const mod = Number($("#modifier")[0].value);
			if (mod != 0)
				toolTipInfo += (toolTipInfo.length > 0 ? " " : "") + game.i18n.format("SPACE1889.ChatModifier", { mod: SPACE1889Helper.getSignedStringFromNumber(mod) });

			if (distanceMod != 0)
				toolTipInfo += (toolTipInfo.length > 0 ? " " : "") + game.i18n.format("SPACE1889.ChatDistanceMod", { mod: SPACE1889Helper.getSignedStringFromNumber(distanceMod) });

			const useWeaponInfo = await SPACE1889Helper.useWeapon(weapon, actor, roundsToUse);
			if (useWeaponInfo.used)
			{
				for (let i = 1; i <= rolls; ++i)
				{
					const chatInfo = i == 1 ? useWeaponInfo.chatInfo : "";
					let theTitelInfo = (rolls < 2 ? "" : i.toString() + ". ") + titelInfo;
					theTitelInfo = await SPACE1889RollHelper.logAttack(actor, theTitelInfo, token);
					const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, weapon, anzahl, game.user.targets.ids, chatInfo, theTitelInfo, toolTipInfo, "", false, "", chatoption);
					await ChatMessage.create(chatData, {});
				}

				if (isFullAttack)
					SPACE1889Helper.addEffect(actor, { name: "noActiveDefense", rounds: 1 });
			}
			else
				ui.notifications.info(useWeaponInfo.chatInfo);
		}
	}

	static testDefenseDialog(defenceType = "", attackCombatSkillId = "none" )
	{
		const controlledToken = SPACE1889Helper.getControlledTokenDocument();
		if (controlledToken == undefined)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.NoTokensSelected"));
			return;
		}
		const data = {
			event: null,
			actorId: "",
			actorTokenId: "",
			actorName: "",
			targetId: controlledToken.id,
			attackName: "Test Angriff",
			damageType: "lethal",
			combatSkillId: attackCombatSkillId,
			attackValue: 5,
			reducedDefense: defenceType,
			riposteDamageType: "",
			areaDamage: 0,
			effect: "",
			effectDurationCombatTurns: 0,
			effectOnly: false}

		this.defenseDialog(data);
	}


	/**
	 * @param {Object} data
	 * @param {Object} data.event
	 * @param {string} data.actorId
	 * @param {string} data.actorTokenId,
	 * @param {string} data.actorName
	 * @param {string} data.targetId
	 * @param {string} data.attackName
	 * @param {string} data.damageType
	 * @param {number} data.attackValue
	 * @param {string} data.combatSkillId
	 * @param {string} data.reducedDefense
	 * @param {string} data.riposteDamageType
	 * @param {number} data.areaDamage
	 * @param {string} data.effect
	 * @param {number} data.effectDurationCombatTurns
	 * @param {boolean} data.effectOnly
	 */
	static defenseDialog(data)
	{
		const defenseType = data.reducedDefense;
		let token = SPACE1889Helper.getTokenFromId(data.targetId);
		const actor = token.actor;

		const defenseCount = SPACE1889RollHelper.getDefenseCount(data.targetId);
		const combatRound = game.combat ? game.combat.round : 0;
		const name = token ? token.name : actor.name;

		const hasActiveDefense = !actor.HasNoActiveDefense(actor) && defenseType.indexOf("onlyPassive") < 0;
		const hasPassiveDefense = defenseType.indexOf("onlyActive") < 0;

		let defOpt = this.getDefenseOptions(data);
		const normalSelected = defOpt.defenseType === "" ? " checked" : "";
		const activeSelected = defOpt.defenseType.indexOf("onlyActive") === 0 ? " checked" : "";
		const passiveSelected = defOpt.defenseType === "onlyPassive" ? " checked" : "";
		const opposedSelected = defOpt.defenseType.indexOf("Comparative") >= 0 ? " checked" : "";
		const totalSelected = defOpt.defenseType.indexOf("Total") >= 0 ? " checked" : "";
		const blockSelected = defOpt.defenseType.indexOf("Block") >= 0 && !totalSelected ? " checked" : "";
		const parrySelected = defOpt.defenseType.indexOf("Parry") >= 0 && !totalSelected ? " checked" : "";
		const dodgeSelected = defOpt.defenseType.indexOf("Dodge") >= 0 && !totalSelected ? " checked" : "";
		const defBlockInfo = defOpt.blockInfo;
		const defParryInfo = defOpt.parryInfo;
		const defDodgeInfo = defOpt.dodgeInfo;
		const defOpposedInfo = defOpt.comparativeInfo;
		const totalInfo = defOpt.totalInfo;
		const multiDefenseMalus = defOpt.multiDefenseMalus;

		let baseBlock = defBlockInfo ? defBlockInfo.diceCount : 0;
		let blockToolTip = defBlockInfo ? defBlockInfo.info : ""; 
		const instinctiveBlock = defBlockInfo && actor.system.block ? actor.system.block.instinctive : false;
		const canDoBlock = defBlockInfo ? defBlockInfo.canDo : false;

		let baseDodge = defDodgeInfo ? defDodgeInfo.diceCount : 0;
		const instinctiveDodge = defDodgeInfo ? defDodgeInfo.instinctive : false;
		const canDoDodge = defDodgeInfo ? defDodgeInfo.canDo : false;
		let dodgeToolTip = defDodgeInfo ? defDodgeInfo.info : "";

		let baseParry = defParryInfo ? defParryInfo.diceCount : 0;
		const instinctiveParry = defParryInfo ? defParryInfo.instinctive : false;
		const canDoParry = defParryInfo ? defParryInfo.canDo : false;
		let parryToolTip = defParryInfo ? defParryInfo.info : "";

		let baseOpposed = defOpposedInfo ? defOpposedInfo.diceCount : 0;
		const isOpposed = defOpposedInfo ? defOpposedInfo.canDo : false;
		let opposedToolTip = defOpposedInfo ? defOpposedInfo.info : "";
		const hideText = ' hidden="true" ';

		let base = Math.max(0, actor.system.secondaries.defense.total + multiDefenseMalus);

		const activeDefense = Math.max(0, multiDefenseMalus + actor.system.secondaries.defense.activeTotal);
		const passiveDefense = Math.max(0, multiDefenseMalus + actor.system.secondaries.defense.passiveTotal);
		let totalDefense = totalInfo?.canDo ? totalInfo.diceCount : 0;

		const disableBlockInHtlmText = canDoBlock ? "" : `disabled="true"`;
		const disableParryInHtlmText = canDoParry ? "" : `disabled="true"`;
		const disableDodgeInHtlmText = canDoDodge ? "" : `disabled="true"`;
		const disableTotalDefenseInHtlmText = totalInfo?.canDo ? "" : `disabled="true" data-tooltip="${game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.localize("SPACE1889.DefenseDialogTotalDefense") } )}"`;

		const disableActiveDefenseInHtlmText = hasActiveDefense ? "" : `disabled="true"`;
		const disablePassiveDefenseInHtlmText = hasPassiveDefense ? "" : `disabled="true"`;
		const disableNormalDefenseInHtlmText = (hasPassiveDefense && hasActiveDefense) ? "" : `disabled="true"`;

		const modifierLabel = game.i18n.localize("SPACE1889.Modifier");
		const coverOptions = SPACE1889Helper.getHtmlCoverOptions();

		const lossOfAA = "(" + game.i18n.localize("SPACE1889.LossOfAttackAction") + ")";

		function recalc()
		{
			let mod = Number($("#modifier")[0].value);
			const value = $('#normal')[0].checked ? base : 0;
			const totalDefenseValue = $('#totalDefense')[0].checked ? totalDefense : 0;
			const blockValue = $('#block')[0].checked ? baseBlock : 0;
			const parryValue = $('#parry')[0].checked ? baseParry : 0;
			const evasionValue = $('#evasion')[0].checked ? baseDodge : 0;
			const passiveDefenseValue = $('#passiveDefense')[0].checked ? passiveDefense : 0;
			const activeDefenseValue = $('#activeDefense')[0].checked ? activeDefense : 0;
			const opposedRollValue = $('#opposed')[0].checked ? baseOpposed : 0;

			let coverValue = Number(document.getElementsByClassName('cover')[0].value);
			let attributValue = mod + value + totalDefenseValue + blockValue + parryValue + evasionValue + passiveDefenseValue + activeDefenseValue + opposedRollValue + coverValue;

			$("#anzahlDerWuerfel")[0].value = attributValue;
		}

		const attackTypeName = CONFIG.SPACE1889.combatSkills.hasOwnProperty(data.combatSkillId)
			? game.i18n.localize(CONFIG.SPACE1889.combatSkills[data.combatSkillId])
			: data.combatSkillId;

		let dialogue = foundry.applications.api.DialogV2.wait(
		{
			window: { title: `${name}: ${game.i18n.localize("SPACE1889.DefenseDialogDefenceProbe")}`, resizable: true },
			position: { width: 480 },
			content: `
			<form >
				<fieldset style="row-gap: 0.5rem">
					<legend>${game.i18n.format("SPACE1889.DefenseDialogAttackType", { type: attackTypeName })}</legend>
					${game.i18n.format("SPACE1889.DefenseCountInCombatRound", { count: defenseCount + 1, round: combatRound, malus: multiDefenseMalus })}</div>
					<fieldset style="padding-top: 0.5rem; padding-bottom: 0.5rem" ${isOpposed ? hideText : ""}>
						<legend>${game.i18n.localize("SPACE1889.DefenseDialogNomalDefense")}</legend>
						<div><input ${disableNormalDefenseInHtlmText} type="radio" id="normal" name="type" class="normal" value="N" ${normalSelected}>
						<label ${disableNormalDefenseInHtlmText} for="normal">${game.i18n.localize("SPACE1889.SecondaryAttributeDef")} ${base}</label><br>

						<input ${disableActiveDefenseInHtlmText} type="radio" id="activeDefense" class="activeDefense" name="type" value="A" ${activeSelected}>
						<label ${disableActiveDefenseInHtlmText} for="activeDefense">${game.i18n.localize("SPACE1889.ActiveDefense")} ${activeDefense}</label><br>

						<input ${disablePassiveDefenseInHtlmText} type="radio" id="passiveDefense" class="passiveDefense" name="type" value="PD" ${passiveSelected} data-tooltip="${game.i18n.localize("SPACE1889.AttackDialogFullAutofireToolTip")}">
						<label ${disablePassiveDefenseInHtlmText} for="passiveDefense" data-tooltip="${game.i18n.localize("SPACE1889.PassiveDefenseDesc")}">${game.i18n.localize("SPACE1889.PassiveDefense")} ${passiveDefense}</label></div>
			
					</fieldset>

					<fieldset ${isOpposed ? "" : hideText}>
						<legend>${game.i18n.localize("SPACE1889.ChatOpposedRoll")}</legend>
						<div><input type="radio" id="opposed" class="opposed" name="type" value="OP" data-tooltip="${opposedToolTip}" ${opposedSelected}>
						<label for="opposed" data-tooltip="${opposedToolTip}">${defOpposedInfo.skillName} ${baseOpposed}</label></div>
					</fieldset>

					<fieldset style="padding-top: 0.5rem; padding-bottom: 0.5rem">
						<legend>${game.i18n.localize("SPACE1889.DefenseDialogSpecialDefense")}</legend>
						<div><input  ${disableTotalDefenseInHtlmText} type="radio" id="totalDefense" name="type" class="totalDefense" value="V" ${totalSelected}>
						<label  ${disableTotalDefenseInHtlmText} for="totalDefense">${game.i18n.localize("SPACE1889.TotalDefense")}: ${totalDefense} ${lossOfAA}</label><br>
			
						<input ${disableBlockInHtlmText} type="radio" id="block" class="block" name="type" value="B" ${blockSelected} data-tooltip="${blockToolTip}">
						<label ${disableBlockInHtlmText} for="block" data-tooltip="${blockToolTip}">${game.i18n.localize("SPACE1889.Block")} ${baseBlock} ${instinctiveBlock ? "" : lossOfAA}</label><br>

						<input ${disableParryInHtlmText} type="radio" id="parry" class="parry" name="type" value="P" ${parrySelected} data-tooltip="${parryToolTip}">
						<label ${disableParryInHtlmText} for="parry" data-tooltip="${parryToolTip}">${game.i18n.localize("SPACE1889.Parry")} ${baseParry} ${instinctiveParry ? "" : lossOfAA}</label><br>

						<input ${disableDodgeInHtlmText} type="radio" id="evasion" class="evasion" name="type" value="D" ${dodgeSelected} data-tooltip="${dodgeToolTip}">
						<label ${disableDodgeInHtlmText} for="evasion" data-tooltip="${dodgeToolTip}">${game.i18n.localize("SPACE1889.Evasion")} ${baseDodge} ${instinctiveDodge ? "" : lossOfAA}</label></div>
					</fieldset>
					<div><select id="cover" name="cover" class="cover">${coverOptions}</select></div>
					<div style="display: grid; grid-template-columns: 50%  50%; grid-template-rows: 100%;">
						<div style="margin-top:4px; margin-left: 5px">${modifierLabel}:</div> 
						<div>
							<input style="max-width: 150px; text-align: center" type="number" class="modInput" id="modifier" value = "0">
						</div>
					</div>
					<h4 style="margin-top: 0px; margin-bottom: 0px">
						<div style="display: grid; grid-template-columns: 50%  50%;">
							<div style="margin-top:4px; margin-left: 5px">${game.i18n.localize("SPACE1889.DefenseDice")}:</div> 
							<div>
								<input style="max-width: 150px; text-align: center" id="anzahlDerWuerfel" value="10" disabled="true" visible="false">
							<div>
						</div>
					</h4>
				</fieldset>
			</form>`,
			buttons: [
				{
					action: 'ok',
					icon: '',
					label: game.i18n.localize("SPACE1889.Go"),
					default: true,
					callback: (event, button, dialog) => theCallback(event, button, dialog)
				},
				{
					action: 'abbruch',
					label: game.i18n.localize("SPACE1889.Cancel"),
					callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
					icon: `<i class="fas fa-times"></i>`
				}
			],
			form: { closeOnSbmit: false },
			render: (_event, _dialog) =>
			{
				recalc();
				document.getElementsByClassName('normal')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('totalDefense')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('block')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('parry')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('evasion')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('passiveDefense')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('activeDefense')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('opposed')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('modInput')[0].addEventListener("change", recalc, false);
				document.getElementsByClassName('cover')[0].addEventListener("change", recalc, false);
			}
		});
	

		async function theCallback(event, button, dialog)
		{
			let useActionForDefense = false;
			let selectedDefenseType = defenseType;

			if (button.form.elements.normal.checked)
			{
				useActionForDefense = false;
			}
			else if (button.form.elements.totalDefense.checked)
			{
				useActionForDefense = true;
				selectedDefenseType += totalInfo.defenseType;
			}
			else if (button.form.elements.block.checked)
			{
				useActionForDefense = !instinctiveBlock;
				selectedDefenseType = defBlockInfo.defenseType;
				data.riposteDamageType = defBlockInfo.riposteDamageType;
			}
			else if (button.form.elements.parry.checked)
			{
				useActionForDefense = !instinctiveParry;
				selectedDefenseType = defParryInfo.defenseType;
				data.riposteDamageType = defParryInfo.riposteDamageType;
			}
			else if (button.form.elements.evasion.checked)
			{
				useActionForDefense = !instinctiveDodge;
				selectedDefenseType = defDodgeInfo.defenseType;
			}
			else if (button.form.elements.opposed.checked)
			{
				useActionForDefense = false;
				selectedDefenseType = defOpposedInfo.defenseType;
			}

			const input = button.form.elements.anzahlDerWuerfel.value;
			const diceCount = input ? parseInt(input) : 0;
			const coverMod = parseInt(button.form.elements.cover.value);
			const modifier = parseInt(button.form.elements.modifier.value);
			if (useActionForDefense)
				selectedDefenseType += "UseActionForDefense";

			data.reducedDefense = selectedDefenseType;
			let modifierToolTipInfo = (multiDefenseMalus === 0 ? "" : game.i18n.format("SPACE1889.ChatMultiAttackDefenseModifier", { mod: multiDefenseMalus }));
			if (defOpposedInfo.canDo && defOpposedInfo.twoHandBonus != 0)
			{
				modifierToolTipInfo += ` ${game.i18n.format("SPACE1889.ChatDisarmTwoHandBonus", { bonus: defOpposedInfo.twoHandBonus })}`;
			}
			if (modifier > 0)
			{
				modifierToolTipInfo += ` ${game.i18n.format("SPACE1889.ChatModifier", { mod: modifier })}`;
			}
			if (coverMod > 0)
			{
				modifierToolTipInfo += ` ${game.i18n.format("SPACE1889.Cover")}: ${coverMod}`;
			}

			SPACE1889RollHelper.rollDefenseAndAddDamageSub(data, diceCount, modifierToolTipInfo, defOpt.additionalChatContent);
		}
	}

	static _getHtmlCombatSkillSelection(preSelectKey = "none")
	{
		const keylist = Object.keys(CONFIG.SPACE1889.combatSkills);
		let options = "";

		for (const key of keylist)
		{
			const selected = (key === preSelectKey ? 'selected="selected"' : "");
			options += `<option value="${key}" ${selected}> ${game.i18n.localize(CONFIG.SPACE1889.combatSkills[key])} </option>`;
		}

		return options;
	}


	static getDefenseOptions(data)
	{
		// liefert das optimum im modifizierten defenseType zurück
		
		const token = SPACE1889Helper.getTokenFromId(data.targetId);
		const actor = token?.actor;

		if (!actor)
			return { defenseType: data.reducedDefense, riposteDamageType: "lethal", diceCount: 0, multiDefenseMalus: 0, blockInfo: null, parryInfo: null, dodgeInfo: null, totalInfo: null, additionalChatContent: "" };			

		const hasAttacked = token && SPACE1889RollHelper.getAttackCount(token.id) > 0;
		const hasAttackActionForDefense = !hasAttacked && !actor.isStunned();

		const defenseType = data.reducedDefense;
		const defenseCount = SPACE1889RollHelper.getDefenseCount(data.targetId);
		const multiDefenseMalus = actor ? actor.getDefenseMalus(defenseCount + 1) : 0;
		const combatRound = game.combat ? game.combat.round : 0;
		const chatContent = defenseCount > 0 ? `<p>${game.i18n.format("SPACE1889.DefenseCountInCombatRound", { count: defenseCount + 1, round: combatRound, malus: multiDefenseMalus })}</p>` : "";

		let resultantDefenseType = defenseType;
		let resultRiposteDamageType = "lethal";

		if (defenseType === 'onlyPassive')
		{
			const dice = Math.max(0, actor.system.secondaries.defense.passiveTotal + multiDefenseMalus);
			return { defenseType: resultantDefenseType, riposteDamageType: resultRiposteDamageType, diceCount: dice, multiDefenseMalus: multiDefenseMalus, blockInfo: null, parryInfo: null, dodgeInfo: null, totalInfo: null, additionalChatContent: chatContent };
		}

		const blockInfo = this.getBlockData(actor, defenseType, data.combatSkillId, hasAttackActionForDefense, multiDefenseMalus);
		const parryInfo = this.getParryData(actor, defenseType, data.combatSkillId, hasAttackActionForDefense, multiDefenseMalus);
		const dodgeInfo = this.getEvasionData(actor, defenseType, data.combatSkillId, hasAttackActionForDefense, multiDefenseMalus);
		const compaInfo = this.getComparativeData(actor, defenseType, data.combatSkillId, multiDefenseMalus);
		const totalInfo = this.getTotalData(actor, defenseType, hasAttackActionForDefense, multiDefenseMalus, blockInfo, parryInfo, dodgeInfo, compaInfo);

		const statusIds = SPACE1889RollHelper.getActiveEffectStates(actor);
		const isTotalDefense = statusIds.find(element => element === "totalDefense") !== undefined;

		let diceCount = Math.max(0, actor.system.secondaries.defense.total + multiDefenseMalus);

		if (defenseType.substring(0,10) === 'onlyActive')
		{
			diceCount = Math.max(0, actor.system.secondaries.defense.activeTotal + multiDefenseMalus);
		}
		if (compaInfo.canDo)
			diceCount = compaInfo.diceCount;

		if (isTotalDefense && totalInfo.canDo && totalInfo.diceCount > diceCount)
		{
			diceCount = Math.max(0, totalInfo.diceCount);
			resultantDefenseType += totalInfo.defenseType;
			resultRiposteDamageType = totalInfo.riposteDamageType;
		}

		if (dodgeInfo.canDo && dodgeInfo.diceCount >= diceCount && (dodgeInfo.instinctive || isTotalDefense))
		{
			resultantDefenseType = dodgeInfo.defenseType;
			resultRiposteDamageType = dodgeInfo.riposteDamageType;
			diceCount = dodgeInfo.diceCount;
		}

		if (blockInfo.canDo && blockInfo.diceCount >= diceCount && (blockInfo.instinctive || isTotalDefense))
		{
			resultantDefenseType = blockInfo.defenseType;
			resultRiposteDamageType = blockInfo.riposteDamageType;
			diceCount = blockInfo.diceCount;
		}

		if (parryInfo.canDo && parryInfo.diceCount >= diceCount && (parryInfo.instinctive || isTotalDefense))
		{
			resultantDefenseType = parryInfo.defenseType;
			resultRiposteDamageType = parryInfo.riposteDamageType;
			diceCount = parryInfo.diceCount;
		}

		return { defenseType: resultantDefenseType, riposteDamageType: resultRiposteDamageType, diceCount: diceCount, multiDefenseMalus: multiDefenseMalus, blockInfo: blockInfo, parryInfo: parryInfo, dodgeInfo: dodgeInfo, totalInfo: totalInfo, comparativeInfo: compaInfo, additionalChatContent: chatContent };
	}

	static getBlockData(actor, defenseType, attackCombatSkillId, hasAttackActionForDefense, multiDefenseMalus)
	{
		let isInstinctive = actor.system.block ? actor.system.block.instinctive : false;

		if (defenseType === 'onlyPassive' || actor.HasNoActiveDefense(actor) || !this.isActorTypeValidForBlockParryDodge(actor.type))
			return { canDo: false, diceCount: 0, instinctive: isInstinctive, defenseType: defenseType, info: game.i18n.localize("SPACE1889.CanNotBlockNoActiveDefence") };

		if (!hasAttackActionForDefense && !isInstinctive)
			return { canDo: false, diceCount: 0, instinctive: isInstinctive, defenseType: defenseType, info: game.i18n.localize("SPACE1889.CanNotBlockNoAction") };

		let activeOnly = false;
		if (defenseType.substring(0, 10) === 'onlyActive')
			activeOnly = true;

		let info = game.i18n.localize("SPACE1889.CanNotBlockThisAttackType");
		let blockValue = 0;
		let resultantDefenseType = defenseType;
		const baseBlockValue = activeOnly ? actor.system.block.value - actor.system.secondaries.defense.passiveTotal : actor.system.block.value;
		let canDoBlock = false;

		if (attackCombatSkillId === "nahkampf")
		{
			canDoBlock = true;
			resultantDefenseType = activeOnly ? "onlyActiveBlock" : "Block";

			const waffenloseParadeLevel = SPACE1889Helper.getTalentLevel(actor, "waffenloseParade");
			if (waffenloseParadeLevel > 0)
				blockValue = baseBlockValue + (waffenloseParadeLevel - 1) * 2;
			else
				blockValue = baseBlockValue - 2;
			if (isInstinctive)
				info = game.i18n.localize("SPACE1889.BlockMeleeInstinctively");
			else
				info = game.i18n.localize("SPACE1889.BlockMelee");

			switch (waffenloseParadeLevel)
			{
				case 0:
					info += game.i18n.localize("SPACE1889.BlockMeleeWithoutWP");
					break;
				case 1:
					info += game.i18n.localize("SPACE1889.BlockMeleeWithWP");
					break;
				default:
					info += game.i18n.format("SPACE1889.BlockMeleeWithWPBonus", { bonus: (waffenloseParadeLevel - 1) * 2 });
					break;
			}
		}
		else if (attackCombatSkillId === "waffenlos")
		{
			canDoBlock = true;
			resultantDefenseType = activeOnly ? "onlyActiveBlock" : "Block";
			blockValue = baseBlockValue;
			if (isInstinctive)
				info = game.i18n.localize("SPACE1889.BlockBrawlInstinctively");
			else
				info = game.i18n.localize("SPACE1889.BlockBrawl");
		}
		else if (attackCombatSkillId === "primitiverFernkampf" || attackCombatSkillId === "sportlichkeit")
		{
			const geschossAbwehrLevel = SPACE1889Helper.getTalentLevel(actor, "geschossabwehr");
			if (geschossAbwehrLevel > 0)
			{
				blockValue = baseBlockValue + ((geschossAbwehrLevel - 1) * 2);
				resultantDefenseType = activeOnly ? "onlyActiveBlock" : "Block";
				canDoBlock = true;

				//Gegenschlagbonus ist im baseBlockValue schon drin, aber hier fehl am Platz
				const gegenschlagLevel = SPACE1889Helper.getTalentLevel(actor, "gegenschlag");
				if (gegenschlagLevel > 1)
					blockValue -= (gegenschlagLevel - 1) * 2;

				if (isInstinctive)
					info = game.i18n.localize("SPACE1889.BlockArcheryInstinctively");
				else
					info = game.i18n.localize("SPACE1889.BlockArchery");
			}
		}

		if (canDoBlock && actor.system.block.riposte && (attackCombatSkillId === "waffenlos" || attackCombatSkillId === "nahkampf"))
			resultantDefenseType += "Riposte";

		return { canDo: canDoBlock, diceCount: Math.max(0, blockValue + multiDefenseMalus), instinctive: isInstinctive, defenseType: resultantDefenseType, riposteDamageType: "nonLethal", info: info };
	}

	static getParryData(actor, defenseType, attackCombatSkillId, hasAttackActionForDefense, multiDefenseMalus)
	{
		let isInstinctive = actor.system.parry ? actor.system.parry.instinctive : false;
		const talentName = game.i18n.localize("SPACE1889.Parry");

		if (defenseType === 'onlyPassive' || actor.HasNoActiveDefense(actor) || !this.isActorTypeValidForBlockParryDodge(actor.type))
			return { canDo: false, diceCount: 0, instinctive: isInstinctive, defenseType: defenseType, info: game.i18n.format("SPACE1889.CanNotBlockParryEvasionNoActiveDefence", { talentName: talentName }) };

		if (!hasAttackActionForDefense && !isInstinctive)
			return { canDo: false, diceCount: 0, instinctive: isInstinctive, defenseType: defenseType, info: game.i18n.format("SPACE1889.CanNotBlockParryEvasionNoAction", { talentName: talentName }) };

		let activeOnly = false;
		if (defenseType.substring(0, 10) === 'onlyActive')
			activeOnly = true;

		let info = game.i18n.localize("SPACE1889.CanNotBlockThisAttackType");
		let parryValue = 0;
		let resultantDefenseType = defenseType;
		const baseParryValue = activeOnly ? actor.system.parry.value - actor.system.secondaries.defense.passiveTotal : actor.system.parry.value;
		let canDoParry = false;

		if (attackCombatSkillId === "nahkampf" || attackCombatSkillId === "waffenlos")
		{
			canDoParry = true;
			parryValue = baseParryValue;
			if (isInstinctive)
				info = game.i18n.localize("SPACE1889.ParryMeleeInstinctively");
			else
				info = game.i18n.localize("SPACE1889.ParryMelee");

			resultantDefenseType = activeOnly ? "onlyActiveParry" : "Parry";
			if (actor.system.parry.riposte)
				resultantDefenseType += "Riposte";
		}
		
		return { canDo: canDoParry, diceCount: Math.max(0, parryValue + multiDefenseMalus), instinctive: isInstinctive, defenseType: resultantDefenseType, riposteDamageType: actor.system.parry.riposteDamageType, info: info };
	}

	static getEvasionData(actor, defenseType, attackCombatSkillId, hasAttackActionForDefense, multiDefenseMalus)
	{
		let isInstinctive = actor.system.evasion ? actor.system.evasion.instinctive : false;
		const talentName = game.i18n.localize("SPACE1889.Evasion");

		if (defenseType === 'onlyPassive' || actor.HasNoActiveDefense(actor) || !this.isActorTypeValidForBlockParryDodge(actor.type))
			return { canDo: false, diceCount: 0, instinctive: isInstinctive, defenseType: defenseType, info: game.i18n.format("SPACE1889.CanNotBlockParryEvasionNoActiveDefence", { talentName: talentName }) };

		if (!hasAttackActionForDefense && !isInstinctive)
			return { canDo: false, diceCount: 0, instinctive: isInstinctive, defenseType: defenseType, info: game.i18n.format("SPACE1889.CanNotBlockParryEvasionNoAction", { talentName: talentName }) };

		let activeOnly = false;
		if (defenseType.substring(0, 10) === 'onlyActive')
			activeOnly = true;

		let info = game.i18n.localize("SPACE1889.CanNotBlockThisAttackType");
		let dodgeValue = 0;
		let resultantDefenseType = defenseType;
		const baseDodgeValue = activeOnly ? actor.system.evasion.value - actor.system.secondaries.defense.passiveTotal : actor.system.evasion.value;
		let canDoDodge = false;

		if (['geschuetze', 'primitiverFernkampf', 'schusswaffen', 'sportlichkeit'].includes(attackCombatSkillId))
		{
			canDoDodge = true;
			dodgeValue = baseDodgeValue;
			if (isInstinctive)
				info = game.i18n.localize("SPACE1889.EvasionMeleeInstinctively");
			else
				info = game.i18n.localize("SPACE1889.EvasionMelee");
			
			resultantDefenseType = (activeOnly ? 'onlyActiveEvasion' : 'Evasion');
		}

		return { canDo: canDoDodge, diceCount: Math.max(0, dodgeValue + multiDefenseMalus), instinctive: isInstinctive, defenseType: resultantDefenseType, info: info };
	}

	static getComparativeData(actor, defenseType, attackCombatSkillId, multiDefenseMalus)
	{
		let opposedSkillName = game.i18n.localize("SPACE1889.SkillWaffenlos");
		if (defenseType.indexOf("Comparative") < 0 || !this.isCloseCombatSkill(attackCombatSkillId))
			return { canDo: false, diceCount: 0, defenseType: defenseType, info: "", skillName : opposedSkillName };

		let noActiveDefenseMalus = 0;
		if (actor.HasNoActiveDefense(actor))
		{
			const statusIds = SPACE1889RollHelper.getActiveEffectStates(actor);
			if (statusIds.includes("paralysis") || statusIds.includes("unconscious"))
				return { canDo: true, diceCount: 0, defenseType: defenseType, info: game.i18n.localize("SPACE1889.NoComparativeDefence"), skillName : opposedSkillName, twoHandBonus: false };

			noActiveDefenseMalus = actor.getActiveDefense(actor, true);
		}

		const weapons = SPACE1889Combat.getWeaponInHands(actor);
		let melee = 0;
		let meleeWeapon = undefined;
		let twoHandBonus = weapons.primaryWeapon?.system?.isTwoHanded ? 2 : 0;
		if (weapons.primaryWeapon?.system?.skillId === "nahkampf")
		{
			melee = actor.getSkillLevel(actor, weapons.primaryWeapon.system.skillId, weapons.primaryWeapon.system.specializationId);
			meleeWeapon = weapons.primaryWeapon;
		}
		if (weapons.offHandWeapon?.system?.skillId === "nahkampf" && weapons.primaryWeapon?.id !== weapons.offHandWeapon?.id)
		{
			const offhandMalus = SPACE1889Helper.getTalentLevel(actor, "beidhaendig") < 1 ? 2 : 0;
			const offHandMelee = actor.getSkillLevel(actor, weapons.offHandWeapon.system.skillId, weapons.offHandWeapon.system.specializationId) - offhandMalus;
			if (offHandMelee > melee)
			{
				melee = Math.max(0, offHandMelee);
				meleeWeapon = weapons.offHandWeapon;
			}
		}

		const brawl = actor.GetSkillRating(actor, "waffenlos", "str");
		let diceCount = 0;
		let info = "";
		if (melee > brawl)
		{
			diceCount = melee; 
			const name = meleeWeapon ? meleeWeapon.system.label : "";
			info = game.i18n.format("SPACE1889.OpposedMeleeRoll", { name: name });
			opposedSkillName = game.i18n.localize("SPACE1889.SkillNahkampf");
			const speci = actor.system.speciSkills.find(e => e.system.id === meleeWeapon?.system?.specializationId);
			if (speci)
				opposedSkillName += ` (${speci.system.label})`;
		}
		else
		{
			diceCount = brawl;
			info = game.i18n.localize("SPACE1889.OpposedBrawlRoll");
			opposedSkillName = game.i18n.localize("SPACE1889.SkillWaffenlos");
		}

		diceCount = Math.max(0, diceCount + twoHandBonus + multiDefenseMalus - noActiveDefenseMalus);

		return { canDo: true, diceCount: diceCount, defenseType: defenseType, info: info, skillName: opposedSkillName, twoHandBonus: twoHandBonus };
	}

	static getTotalData(actor, defenseType, hasAttackActionForDefense, multiDefenseMalus, blockInfo, parryInfo, dodgeInfo, compaInfo)
	{
		if (defenseType === 'onlyPassive' || actor.HasNoActiveDefense(actor) || !hasAttackActionForDefense)
			return { canDo: false, diceCount: 0, defenseType: defenseType, riposteDamageType : "" };

		const totalDefenseBonus = actor.getTotalDefenseBonus(actor);
		let diceCount = defenseType.indexOf("onlyActive") < 0 ?
			Math.max(0, multiDefenseMalus + actor.system.secondaries.defense.totalDefense) :
			Math.max(0, multiDefenseMalus + actor.system.secondaries.defense.activeTotal + totalDefenseBonus);

		if (compaInfo.canDo)
			diceCount = compaInfo.diceCount + totalDefenseBonus;

		let resultantDefenseType = defenseType;
		let resultRiposteDamageType = "";
		if (blockInfo && blockInfo.canDo && blockInfo.instinctive &&  blockInfo.diceCount + totalDefenseBonus > diceCount)
		{
			diceCount = blockInfo.diceCount + totalDefenseBonus;
			resultantDefenseType += blockInfo.defenseType;
			resultRiposteDamageType = blockInfo.riposteDamageType;
		}
		if (parryInfo && parryInfo.canDo && parryInfo.instinctive &&  parryInfo.diceCount + totalDefenseBonus > diceCount)
		{
			diceCount = parryInfo.diceCount + totalDefenseBonus;
			resultantDefenseType += parryInfo.defenseType;
			resultRiposteDamageType = parryInfo.riposteDamageType;
		}
		if (dodgeInfo && dodgeInfo.canDo && dodgeInfo.instinctive &&  dodgeInfo.diceCount + totalDefenseBonus > diceCount)
		{
			diceCount = dodgeInfo.diceCount + totalDefenseBonus;
			resultantDefenseType += dodgeInfo.defenseType;
		}

		resultantDefenseType += "UseActionForDefenseTotal";
		
		return { canDo: true, diceCount: diceCount, defenseType: resultantDefenseType, riposteDamageType : resultRiposteDamageType };
	}

	static isActorTypeValidForBlockParryDodge(actorType)
	{
		return (actorType === "character" || actorType === "npc");
	}

	static CombatManoeuverDialog(actorToken, actor, manoeuver)
	{
		let manoeuverName = "";
		let data;
		const token = actorToken ? actorToken : this.getCombatToken(actor) || this.getToken(actor);
		const target = game.user.targets.first();
		let baseValue = 0;
		let weapon = null;
		let chatInfo = "";
		let normalOptName = game.i18n.localize("SPACE1889.AttackDialogRegular");
		let totalAttackName = game.i18n.localize("SPACE1889.AttackDialogTotalAttack");
		let totalAttackSecOptName = "";
		let showNormalOpt = true;
		let normalSecondOptName = "";
		let secondOptDeltaValue = 0;
		let showNormalSecondOpt = false;
		let normalSelected = " checked";
		let secondNormalSelected = "";

		switch (manoeuver)
		{
			case "grapple":
				data = SPACE1889RollHelper.getGrappleAttackValues(actor, target);
				manoeuverName = data.name;
				baseValue = data.dice;
				break;
			case "trip":
				data = SPACE1889RollHelper.getTripAttackValues(actor, target);
				manoeuverName = game.i18n.localize("SPACE1889.CombatManoeuversTrip");
				baseValue = data.dice;
				break;
			case "disarm":
				data = SPACE1889RollHelper.getDisarmAttackValues(actor, target, undefined);
				if (!data.canDo && data.noWeaponToDisarm)
				{
					ui.notifications.info(game.i18n.localize("SPACE1889.DisarmNoWeaponOnTarget"));
					return;
				}

				manoeuverName = data.name;
				baseValue = data.noWeaponRating;
				normalOptName = `${game.i18n.localize("SPACE1889.DisarmByStealing")} (${data.noWeaponRating})`;
				totalAttackName = `${game.i18n.localize("SPACE1889.DisarmByStealing")} ${game.i18n.localize("SPACE1889.AttackDialogTotalAttack")}`;
		
				showNormalOpt = data.noWeaponRating > 0;
				showNormalSecondOpt = data.weapon && data.weaponRating > 0;
				if (showNormalSecondOpt)
				{
					weapon = data.weapon;
					secondOptDeltaValue = data.weaponRating - data.noWeaponRating;
					normalSecondOptName = `${game.i18n.localize("SPACE1889.DisarmByKnocking")} (${data.weaponRating})`;
					totalAttackSecOptName = `${game.i18n.localize("SPACE1889.DisarmByKnocking")} ${game.i18n.localize("SPACE1889.AttackDialogTotalAttack")}`;
					if (data.weaponRating > data.noWeaponRating)
					{
						normalSelected = "";
						secondNormalSelected = " checked";
					}
				}
				break;
		}
		
		const baseVollerAngriff = 2;
		const targetTokenDoc = game.user.targets.first()?.document;
		const targetName = targetTokenDoc ? targetTokenDoc.name : "";
		let distanceInfo = DistanceMeasuring.getDistanceInfo(token, targetTokenDoc, true);
		let targetDistance = distanceInfo.distance;
		let distanceString = targetDistance.toFixed(2).toString() + distanceInfo.unit;
		if (!distanceInfo.isCloseCombatRange)
			distanceString = game.i18n.localize("SPACE1889.OutOfRange") + " " + distanceString;
		const targetToolTip = targetName + " (" + distanceString + ")" + "\n";

		const hideText = ' hidden="true" ';
		const defenseCount = SPACE1889RollHelper.getDefenseCount(token.id);
		const disableTotalAttackInHtlmText = (!data.canDo || defenseCount > 0) ? `disabled="true" data-tooltip="${game.i18n.localize("SPACE1889.CanNotGiveUpActiveDefense")}"` : "";

		let optionen = SPACE1889Helper.getHtmlChatOptions();
		const modifierLabel = game.i18n.localize("SPACE1889.Modifier");
		const labelWurf = game.i18n.localize("SPACE1889.AttackValue") + ": ";


		function Recalc()
		{
			let mod = Number($("#modifier")[0].value);

			const normalDelta = $('#secondNormal')[0].checked || $('#totalAttackSecOpt')[0].checked ? secondOptDeltaValue : 0;
			const vollerAngriffBonus = $('#vollerAngriff')[0].checked  || $('#totalAttackSecOpt')[0].checked ? baseVollerAngriff : 0;
			let attributValue = baseValue + mod + vollerAngriffBonus + normalDelta;
			$("#anzahlDerWuerfel")[0].value = attributValue.toString();
		}

		function handleRender(html)
		{
			html.on('change', '.normal', () =>
			{
				Recalc();
			});

			html.on('change', '.secondNormal', () =>
			{
				Recalc();
			});

			html.on('change', '.vollerAngriff', () =>
			{
				Recalc();
			});

			html.on('change', '.totalAttackSecOpt', () =>
			{
				Recalc();
			});

			html.on('change', '.modInput', () =>
			{
				Recalc();
			});
			Recalc();
		}


		let dialogue = new Dialog(
		{
			title: `${game.i18n.localize("SPACE1889.VehicleManoeuvre")} ${manoeuverName}`,
			content: `
				<form >
					<h2>${manoeuverName}</h2>
					<label data-tooltip="${targetToolTip}">${game.i18n.localize("SPACE1889.Target")}: ${targetName}</label><br>
					<label>${game.i18n.localize("SPACE1889.Distance")} ${distanceInfo.distance.toFixed(2)}${distanceInfo.unit}</label>
					<fieldset>
						<legend>${game.i18n.localize("SPACE1889.AttackDialogAttackType")}</legend>
						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogSimpleAttack")}</legend>
							<div ${showNormalOpt ? "" : hideText}>
								<input type="radio" id="normal" name="type" class="normal" value="N" ${normalSelected}>
								<label for="normal">${normalOptName}</label><br>
							</div>
							<div ${showNormalSecondOpt ? "" : hideText}>
								<input type="radio" id="secondNormal" name="type" class="secondNormal" value="S" ${secondNormalSelected}>
								<label for="secondNormal" data-tooltip="${data?.weapon?.system?.label}">${normalSecondOptName}</label><br>
							</div>
						</fieldset>

						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogTotalAttackHeadline")}</legend>
							<div ${showNormalOpt ? "" : hideText}>
								<input ${disableTotalAttackInHtlmText} type="radio" id="vollerAngriff" name="type" class="vollerAngriff" value="V">
								<label ${disableTotalAttackInHtlmText} for="vollerAngriff">${totalAttackName}</label><br>
							</div>
							<div ${showNormalSecondOpt ? "" : hideText}>
								<input ${disableTotalAttackInHtlmText} type="radio" id="totalAttackSecOpt" name="type" class="totalAttackSecOpt" value="TS">
								<label ${disableTotalAttackInHtlmText} for="totalAttackSecOpt">${totalAttackSecOptName}</label><br>
							</div>
						</fieldset>
					</fieldset>
					<ul>
					<li class="flexrow">
						<div class="item flexrow flex-group-left">
							<div>${modifierLabel}:</div> <input type="number" class="modInput" id="modifier" value = "0">
						</div>
					</li>
					<hr>
					<div class="space1889 sheet actor">
						<li class="flexrow">
							<h2 class="item flexrow flex-group-left ">
								<label for="zusammensetzung">${labelWurf}</label>
								<input class="h2input" id="anzahlDerWuerfel" value="10" disabled="true" visible="false">
							</h2>
						</li>
					</div>
					</ul>
					<hr>
					<p><select id="choices" name="choices">${optionen}</select></p>
				</form>`,
			buttons:
			{
				ok:
				{
					icon: '',
					label: game.i18n.localize("SPACE1889.Go"),
					callback: (html) => theCallback(html)
				},
				abbruch:
				{
					label: game.i18n.localize("SPACE1889.Cancel"),
					callback: () => { ui.notifications.info(game.i18n.localize("SPACE1889.CancelRoll")) },
					icon: `<i class="fas fa-times"></i>`
				}
			},
			default: "ok",
			render: handleRender
		});
	
		dialogue.render(true);

		async function theCallback(html)
		{
			let attackName = "";
			let toolTipInfo = data.toolTipInfo;
			let isFullAttack = false;
			if (html.find('#vollerAngriff')[0].checked || $('#totalAttackSecOpt')[0].checked)
			{
				attackName = game.i18n.localize("SPACE1889.AttackTypeTotalAttack");
				toolTipInfo += attackName + ": " + SPACE1889Helper.getSignedStringFromNumber(baseVollerAngriff);
				isFullAttack = true;
			}
			if (html.find('#secondNormal')[0].checked || $('#totalAttackSecOpt')[0].checked)
			{
				manoeuver = "disarmWithWeapon";
				chatInfo = game.i18n.format("SPACE1889.DisarmWithWeapon", { weapon: weapon.system.label });
			}

			let titelInfo = attackName.length > 0 ? attackName + " " : "";
			if (target)
				titelInfo += game.i18n.format("SPACE1889.AttackOn", { targetName: targetName });

			const chatoption = html.find('#choices').val();
			const input = html.find('#anzahlDerWuerfel').val();
			const anzahl = input ? parseInt(input) : 0;

			const mod = Number($("#modifier")[0].value);
			if (mod != 0)
				toolTipInfo += (toolTipInfo.length > 0 ? " " : "") + game.i18n.format("SPACE1889.ChatModifier", { mod: SPACE1889Helper.getSignedStringFromNumber(mod) });

			if (titelInfo.length > 0)
				titelInfo += "<br>";
			let theTitelInfo = titelInfo + data.name;
			theTitelInfo = await SPACE1889RollHelper.logAttack(actor, theTitelInfo, token);
			const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, weapon, anzahl, game.user.targets.ids, chatInfo, theTitelInfo, toolTipInfo, "", false, "", chatoption, manoeuver);
			await ChatMessage.create(chatData, {});

			if (isFullAttack)
				SPACE1889Helper.addEffect(actor, { name: "noActiveDefense", rounds: 1 });
		}
	}


}

