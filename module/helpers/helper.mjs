export default class SPACE1889Helper
{
	static getTalentData(actorData, talentId)
	{
		return actorData.talents?.find(entry => entry.data.id == talentId);
	}

	static getTalentLevel(actorData, talentId)
	{
		const talent = this.getTalentData(actorData, talentId);
		if (talent != undefined)
		{
			return talent.data.level.value;
		}
		return 0;
	}

	static getDeathThreshold(actor)
	{
		let threshold = -5;
		const level = this.getTalentLevel(actor.data, "zaeherHund");
		if (level > 0)
			threshold -= (2 * level);

		return threshold;
	}

	static isAutoStabilize(actor)
	{
		return (this.getTalentLevel(actor.data, "zaeherHund") > 0);
	}

	static getIncapacitateThreshold(actor)
	{
		let threshold = 0;
		const level = this.getTalentLevel(actor.data, "schmerzresistenz");
		if (level > 0)
			threshold -= (2 * level);

		return threshold;
	}

	static getDamageTuple(actorData, ignoreThisItemId = "")
	{
		let lethal = 0;
		let nonLethal = 0;
		for (const item of actorData.items)
		{
			if (item.data.type != "damage")
				continue;

			if (item.data._id == ignoreThisItemId)
				continue;

			if (item.data.data.damageType == "lethal")
				lethal += item.data.data.damage;
			else
				nonLethal += item.data.data.damage;
		}

		return { lethal: lethal, nonLethal: nonLethal };
	}

	static isCreature(actorData)
	{
		return actorData.type == 'creature';
	}

	static getExchangeValue(itemData)
	{
		const exchangeRatio = 20 / itemData.data.exchangeRateForOnePound;
		if (exchangeRatio == 0)
			return "?";

		const sumShilling = Number(itemData.data.quantity) * exchangeRatio;

		const pound = Math.floor(sumShilling / 20);
		const shilling = Math.round(sumShilling - (pound * 20));

		let value = "";
		if (pound > 0)
			value = pound.toString() + game.i18n.localize("SPACE1889.CurrencyBritishPoundsAbbr") + " ";
		if (shilling > 0)
			value += shilling.toString() + game.i18n.localize("SPACE1889.CurrencyBritishShillingAbbr");

		if (value == "")
			value = "<< 1" + game.i18n.localize("SPACE1889.CurrencyBritishShillingAbbr");

		return value;
	}


	/**
	 * sortiert die uebergebene Liste nach Namen
	 * @param objectArray 
	 */
	static sortByName(objectArray)
	{
		objectArray.sort((a, b) =>
		{
			if (a.name < b.name)
				return -1;
			if (a.name > b.name)
				return 1;
			return 0;
		});
	}
}