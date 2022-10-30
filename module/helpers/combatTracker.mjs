export class Space1889Combatant extends Combatant 
{
	constructor(data, context)
	{
		if (data.flags == undefined)
			data.flags = {}
		mergeObject(data.flags, { space1889: { defenseCount: 0 } });
		super(data, context);
	}
}

export class Space1889Combat extends Combat 
{
	constructor(data, context) 
	{
		super(data, context);
	}

	async nextRound()
	{
		for (let k of this.turns)
		{
			await k.setFlag("space1889", "defenseCount", 0)
		}
		return await super.nextRound()
	}
}