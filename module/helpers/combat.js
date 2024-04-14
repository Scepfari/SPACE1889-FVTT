import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889RollHelper from "../helpers/roll-helper.js";
import DistanceMeasuring from "../helpers/distanceMeasuring.js"

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

	static isCloseCombatWeapon(weapon)
	{
		if (!weapon)
			return true;

		return (weapon.system.skillId == "waffenlos" || weapon.system.skillId == "nahkampf");
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
		if (weapon == undefined)
			return false;

		return weapon.system.skillId == "nahkampf" || weapon.system.skillId == "waffenlos";
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

		return weapon.system.skillId == "nahkampf" || weapon.system.skillId == "waffenlos";
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

		const decuctionReduction = this.#getTalentDeductionReduction2_4_8(SPACE1889Helper.getTalentLevel(actor, "rundumschlag"));
		if (actor.system.secondaries.size.total > 0)
			decuctionReduction += actor.system.secondaries.size.total;

		let deduction = targets.size * (-2);
		const distanceList = this.#getMinSumDistance(targets).distanceList;

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

	static #canDoBaseAfMethod(weapon, requiredAmmo)
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
		return this.#canDoBaseAfMethod(weapon, 3);
	}

	static getBurstFireModificator()
	{
		return 1;
	}


	static canDoFullAutofire(weapon)
	{
		return this.#canDoBaseAfMethod(weapon, 20);
	}

	static getFullAutofireModificator()
	{
		return 3;
	}

	static canDoStrafing(weapon)
	{
		return this.#canDoBaseAfMethod(weapon, 20);
	}

	static getStrafingModificator(actor)
	{
		const targets = game.user.targets
		const baseMod = actor ? 3 + SPACE1889Helper.getTalentLevel(actor, "autofeuer") : 3;
		if (targets.size <= 1)
			return baseMod;

		const distance = this.#getMinSumDistance(targets).sum;
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

		if (actor.type == 'character')
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

	static #getNearest(origin, tokens, ignorIds)
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
	
	static #getNearestDistance(origin, tokens)
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
			const info = this.#getNearest(start, tokens, ignoreIds);
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

	static #getMinSumDistance(tokens)
	{
		let distance = { sum: Infinity, distanceList: [] };
		
		for (const token of tokens)
		{
			const theDistance = this.#getNearestDistance(token, tokens);
			if (theDistance.sum < distance.sum)
				distance = theDistance;
		}
		return distance;
	}

	static #getTalentDeductionReduction2_4_8(level)
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

	static #getHtmlRollOptions()
	{
		let options = '<option value="selfAndGm" selected="selected">' + game.i18n.localize("CHAT.RollPrivate") + '</option>';
		options += '<option value="self" selected="selected">' + game.i18n.localize("CHAT.RollSelf") + '</option>';
		options += '<option value="public" selected="selected">' + game.i18n.localize("CHAT.RollPublic") + '</option>';
		return options;
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
		let distanceInfo = game.space1889.distanceMeasuring.getDistanceInfo(token, game.user.targets.first()?.document, isCloseCombatAttack);
		const distanceMod = (isCloseCombatAttack ? 0 : SPACE1889Helper.getDistancePenalty(weapon, distanceInfo.distance));

		const hideText = ' hidden="true" ';

		const canDoAutoFeuer = weapon != undefined && (weapon.system.skillId == "geschuetze" || weapon.system.skillId == "schusswaffen") && (weapon.system.rateOfFire == "V" || weapon.system.rateOfFire == "H/V");
		const disableAutoFeuerInHtmlText = !canDoAutoFeuer ? `disabled="true" title="${game.i18n.localize("SPACE1889.AttackDialogCanNotAutoFire")}"` : `title="${game.i18n.localize("SPACE1889.AttackDialogBurstFireToolTip")}"`;
		const hideSalveInHtlmText = canDoAutoFeuer ? "" : hideText;
		const baseSalve = 1 + autofeuerBoost;

		const disableBeidhaendigInHtlmText = !canDoBeidhaendig ? `disabled="true" title="${game.i18n.localize("SPACE1889.AttackDialogCanNotDualWield")}"` : `title="${game.i18n.localize("SPACE1889.AttackDialogDualWieldToolTip")}"`;

		let canDoDoppelschuss = weapon != undefined && (weapon.system.skillId == "geschuetze" || weapon.system.skillId == "schusswaffen" || weapon.system.skillId == "primitiverFernkampf");
		const hideDoppelschussInHtml = canDoDoppelschuss ? "" : hideText;
		canDoDoppelschuss &= (weapon.system.rateOfFire == "V" || weapon.system.rateOfFire == "H/V" || weapon.system.rateOfFire == "H" || Number(weapon.system.rateOfFire) >= 2);
		const disableDoppelschussInHtlmText = !canDoDoppelschuss ? `disabled="true" title="${game.i18n.localize("SPACE1889.AttackDialogCanNotRapidFire")}"` : `title="${game.i18n.localize("SPACE1889.AttackDialogRapidFireToolTip")}"`;

		const canDoRundumschlag = weapon != undefined && isCloseCombatAttack;
		const hideRundumschalgInHtlmText = !canDoRundumschlag ? hideText : "";
		const baseRundumschlag = this.getSweepingBlowModificator(actor);
		const disableRundumschlagInHtlmText = !canDoRundumschlag || game.user.targets.size < 2 ? `disabled="true" title="${game.i18n.localize("SPACE1889.AttackDialogTooFewTargets")}"`: `title="${game.i18n.localize("SPACE1889.AttackDialogSweepingBlowToolTip")}"`;

		const canDoWirbeln = canDoRundumschlag;
		const hideWirbelnInHtlmText = !canDoWirbeln ? hideText : "";
		const baseWirbeln = -4 + (2 * SPACE1889Helper.getTalentLevel(actor, "wirbeln"));

		const disableStreufeuerInHtlmText = game.user.targets.size < 2 ? `disabled="true" title="${game.i18n.localize("SPACE1889.AttackDialogTooFewTargets")}"`: `title="${game.i18n.localize("SPACE1889.AttackDialogStrafingToolTip")}"`;


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

		let optionen = this.#getHtmlRollOptions();
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
					<label title="${targetToolTip}">${game.i18n.localize("SPACE1889.AttackDialogTargetCount")}: ${game.user.targets.size} ${targetNamesInBrackets}</label><br>
					<label>${game.i18n.localize("SPACE1889.Distance")} ${distanceInfo.distance.toFixed(2)}${distanceInfo.unit}: ${SPACE1889Helper.getSignedStringFromNumber(distanceMod)}</label>
					<fieldset>
						<legend>${game.i18n.localize("SPACE1889.AttackDialogAttackType")}</legend>
						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogSimpleAttack")}</legend>
							<input type="radio" id="normal" name="type" class="normal" value="N" checked>
							<label for="normal">${game.i18n.localize("SPACE1889.AttackDialogRegular")}</label><br>
							<div ${hideSalveInHtlmText}>            
								<input ${disableAutoFeuerInHtmlText} type="radio" id="salve" name="type" class="salve" value="S" title="${game.i18n.localize("SPACE1889.AttackDialogBurstFireToolTip")}">
								<label ${disableAutoFeuerInHtmlText} for="salve" title="${game.i18n.localize("SPACE1889.AttackDialogBurstFireToolTip")}">${game.i18n.format("SPACE1889.AttackDialogBurstFire", { bonus: SPACE1889Helper.getSignedStringFromNumber(baseSalve) })}</label><br>
							</div>
						</fieldset>

						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogTotalAttackHeadline")}</legend>
							<input type="radio" id="vollerAngriff" name="type" class="vollerAngriff" value="V">
							<label for="vollerAngriff">${game.i18n.localize("SPACE1889.AttackDialogTotalAttack")}</label><br>
            
							<input ${disableBeidhaendigInHtlmText} type="radio" id="beidhaendig" class="beidhaendig" name="type" value="B" title="${game.i18n.localize("SPACE1889.AttackDialogDualWieldToolTip")}">
							<label ${disableBeidhaendigInHtlmText} for="beidhaendig" title="${game.i18n.localize("SPACE1889.AttackDialogDualWieldToolTip")}">${game.i18n.format("SPACE1889.AttackDialogDualWield", { malus: SPACE1889Helper.getSignedStringFromNumber(baseBeidhaendig), hand: isNebenHand ? game.i18n.localize("SPACE1889.WeaponUseOffHand") : game.i18n.localize("SPACE1889.WeaponUsePrimaryHand")})}</label><br>
							<div ${hideDoppelschussInHtml}>
								<input ${disableDoppelschussInHtlmText} type="radio" id="doppelschusss" class="doppelschusss" name="type" value="B" title="${game.i18n.localize("SPACE1889.AttackDialogRapidFireToolTip")}">
								<label ${disableDoppelschussInHtlmText} for="doppelschusss" title="${game.i18n.localize("SPACE1889.AttackDialogRapidFireToolTip")}">${game.i18n.format("SPACE1889.AttackDialogRapidFire", { malus: SPACE1889Helper.getSignedStringFromNumber(baseDoppelschuss) })}</label><br>
							</div>
							<div ${hideWirbelnInHtlmText}>
								<input type="radio" id="wirbeln" class="wirbeln" name="type" value="B" title="${game.i18n.localize("SPACE1889.AttackDialogFlurryToolTip")}">
								<label for="wirbeln" title="${game.i18n.localize("SPACE1889.AttackDialogFlurryToolTip")}">${game.i18n.format("SPACE1889.AttackDialogFlurry", { malus: SPACE1889Helper.getSignedStringFromNumber(baseWirbeln) })}</label><br>
							</div>
							<div ${hideRundumschalgInHtlmText}>
								<input ${disableRundumschlagInHtlmText} type="radio" id="rundumschlag" class="rundumschlag" name="type" value="B">
								<label ${disableRundumschlagInHtlmText} for="rundumschlag">${game.i18n.format("SPACE1889.AttackDialogSweepingBlow", { malus: SPACE1889Helper.getSignedStringFromNumber(baseRundumschlag) })}</label><br>
							</div>
						</fieldset>

						<fieldset ${!canDoAutoFeuer ? hideText : ""}>
							<legend>${game.i18n.localize("SPACE1889.AttackDialogAutoFireHeadline")}</legend>
							<input type="radio" id="dauerFeuer" class="dauerFeuer" name="type" value="DA" title="${game.i18n.localize("SPACE1889.AttackDialogFullAutofireToolTip")}">
							<label for="dauerFeuer" title="${game.i18n.localize("SPACE1889.AttackDialogFullAutofireToolTip")}">${game.i18n.format("SPACE1889.AttackDialogFullAutofire", { bonus: SPACE1889Helper.getSignedStringFromNumber(baseDauerfeuer) })}</label><br>
            
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
					const chatData = await SPACE1889RollHelper.getChatDataRollSubSpecial(actor, weapon, anzahl, game.user.targets.ids, chatInfo, theTitelInfo, toolTipInfo, "", false, false, chatoption);
					await ChatMessage.create(chatData, {});
				}

				if (isFullAttack)
					SPACE1889Helper.addEffect(actor, { name: "noActiveDefense", rounds: 1 });
			}
			else
				ui.notifications.info(useWeaponInfo.chatInfo);
		}
	}

	static testDefenseDialog()
	{
		const controlledToken = SPACE1889Helper.getControlledTokenDocument();
		if (controlledToken == undefined)
		{
			ui.notifications.info(game.i18n.localize("SPACE1889.NoTokensSelected"));
			return;
		}
		this.defenseDialog(controlledToken.actor);
	}

	static defenseDialog(actor)
	{
		const token = this.getCombatToken(actor) || this.getToken(actor);
		const hasAttacked = token && SPACE1889RollHelper.getAttackCount(token.id) > 0;

		const hasActiveDefense = !actor.HasNoActiveDefense(actor);

		const canDoBPE = actor.type == "character" || actor.type == "npc";

		let baseBlock = canDoBPE ? actor.system.block.value : 0;
		let blockToolTip = canDoBPE ? actor.system.block.info : "";
		const instinctiveBlock = canDoBPE ? actor.system.block.instinctive : false;
		const canDoBlock = hasActiveDefense && canDoBPE && (!hasAttacked || instinctiveBlock);

		let baseEvasion = canDoBPE ? actor.system.evasion.value : 0;
		const instinctiveEvasion = canDoBPE ? actor.system.evasion.instinctive : false;
		const canDoEvasion = hasActiveDefense && canDoBPE && (!hasAttacked || instinctiveEvasion);
		let evasionToolTip = canDoBPE ? actor.system.evasion.info : "";

		let baseParry = canDoBPE ? actor.system.parry.value : 0;
		const instinctiveParry = canDoBPE ? actor.system.parry.instinctive : false;
		const canDoParry = hasActiveDefense && canDoBPE && (!hasAttacked || instinctiveParry);
		let parryToolTip = canDoBPE ? actor.system.parry.info : "";

		let base = actor.system.secondaries.defense.total;
		let instinctive = true;

		const activeDefense = actor.system.secondaries.defense.activeTotal;
		const passiveDefense = actor.system.secondaries.defense.passiveTotal;
		const totalDefense = actor.system.secondaries.defense.totalDefense;

		const blockName = game.i18n.localize("SPACE1889.TalentBlocken");
		const disableBlockInHtlmText = canDoBlock ? "" : `disabled="true"`;

		const hideParryInHtml = "";
		const disableParryInHtlmText = canDoParry ? "" : `disabled="true"`;
		const disableEvasionInHtlmText = canDoEvasion ? "" : `disabled="true"`;
		const disableTotalDefenseInHtlmText = hasActiveDefense && !hasAttacked ? "" : `disabled="true" title="${game.i18n.format("SPACE1889.NoBlockParryEvasion", { talentName: game.i18n.localize("SPACE1889.DefenseDialogTotalDefense") } )}"`;

		const disableActiveDefenseInHtlmText = hasActiveDefense ? "" : `disabled="true"`;

		const modifierLabel = game.i18n.localize("SPACE1889.Modifier");
		const labelWurf = game.i18n.localize("SPACE1889.DefenseDice") + ": ";
		const options = this.#getHtmlRollOptions();

		const lossOfAA = "(" + game.i18n.localize("SPACE1889.LossOfAttackAction") + ")";


		function Recalc()
		{
			let mod = Number($("#modifier")[0].value);
			const value = $('#normal')[0].checked ? base : 0;
			const totalDefenseValue = $('#totalDefense')[0].checked ? totalDefense : 0;
			const blockValue = $('#block')[0].checked ? baseBlock : 0;
			const parryValue = $('#parry')[0].checked ? baseParry : 0;
			const evasionValue = $('#evasion')[0].checked ? baseEvasion : 0;
			const passiveDefenseValue = $('#passiveDefense')[0].checked ? passiveDefense : 0;
			const activeDefenseValue = $('#activeDefense')[0].checked ? activeDefense : 0;

			let attributValue = mod + value + totalDefenseValue + blockValue + parryValue + evasionValue + passiveDefenseValue + activeDefenseValue;

			$("#anzahlDerWuerfel")[0].value = attributValue;
		}

		function handleRender(html)
		{
			html.on('change', '.normal', () =>
			{
				Recalc();
			});

			html.on('change', '.totalDefense', () =>
			{
				Recalc();
			});

			html.on('change', '.block', () =>
			{
				Recalc();
			});

			html.on('change', '.parry', () =>
			{
				Recalc();
			});

			html.on('change', '.evasion', () =>
			{
				Recalc();
			});
	
			html.on('change', '.passiveDefense', () =>
			{
				Recalc();
			});

			html.on('change', '.activeDefense', () =>
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
			title: `${game.i18n.localize("SPACE1889.DefenseDialogDefenceProbe")}`,
			content: `
				<form >
					<fieldset>
						<legend>${game.i18n.localize("SPACE1889.DefenseDialogDefenseType")}</legend>
						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.DefenseDialogNomalDefense")}</legend>
							<input type="radio" id="normal" name="type" class="normal" value="N" checked>
							<label for="normal">${game.i18n.localize("SPACE1889.SecondaryAttributeDef")} ${base}</label><br>

							<input ${disableActiveDefenseInHtlmText} type="radio" id="activeDefense" class="activeDefense" name="type" value="B">
							<label ${disableActiveDefenseInHtlmText} for="activeDefense">${game.i18n.localize("SPACE1889.ActiveDefense")} ${activeDefense}</label><br>

							<input type="radio" id="passiveDefense" class="passiveDefense" name="type" value="DA" title="${game.i18n.localize("SPACE1889.AttackDialogFullAutofireToolTip")}">
							<label for="passiveDefense" title="${game.i18n.localize("SPACE1889.AttackDialogFullAutofireToolTip")}">${game.i18n.localize("SPACE1889.PassiveDefense")} ${passiveDefense}</label><br>
            
						</fieldset>

						<fieldset>
							<legend>${game.i18n.localize("SPACE1889.DefenseDialogSpecialDefense")}</legend>
							<input  ${disableTotalDefenseInHtlmText} type="radio" id="totalDefense" name="type" class="totalDefense" value="V">
							<label  ${disableTotalDefenseInHtlmText} for="totalDefense">${game.i18n.localize("SPACE1889.TotalDefense")}: ${totalDefense} ${lossOfAA}</label><br>
            
							<input ${disableBlockInHtlmText} type="radio" id="block" class="block" name="type" value="B" title="${blockToolTip}">
							<label ${disableBlockInHtlmText} for="block" title="${blockToolTip}">${game.i18n.localize("SPACE1889.Block")} ${baseBlock} ${instinctiveBlock ? "" : lossOfAA}</label><br>
							<div ${hideParryInHtml}>
								<input ${disableParryInHtlmText} type="radio" id="parry" class="parry" name="type" value="B" title="${parryToolTip}">
								<label ${disableParryInHtlmText} for="parry" title="${parryToolTip}">${game.i18n.localize("SPACE1889.Parry")} ${baseParry} ${instinctiveParry ? "" : lossOfAA}</label><br>
							</div>
							<input ${disableEvasionInHtlmText} type="radio" id="evasion" class="evasion" name="type" value="B" title="${evasionToolTip}">
							<label ${disableEvasionInHtlmText} for="evasion" title="${evasionToolTip}">${game.i18n.localize("SPACE1889.Evasion")} ${baseEvasion} ${instinctiveEvasion ? "" : lossOfAA}</label><br>
						</fieldset>

					</fieldset>
					<ul>
					<li class="flexrow">
						<div class="item flexrow flex-group-left">
							<div>${modifierLabel}:</div>
							<input type="number" class="modInput" id="modifier" value = "0">
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
					<p><select id="choices" name="choices">${options}</select></p>
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
			ui.notifications.info("ok gedrückt");
		}

	}
}




