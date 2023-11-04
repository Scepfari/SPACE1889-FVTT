export class Space1889Combatant extends Combatant 
{
	constructor(data, context)
	{
		if (data.flags == undefined)
			data.flags = {}
		if (data.flags.space1889?.defenseCount == undefined)
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
		const dummy = await super.nextRound();
		for (let k of this.turns)
		{
			await k.setFlag("space1889", "defenseCount", 0);
			await k.setFlag("space1889", "attackCount", 0);
			await this.removeNoActiveDefence(k);
		}
		return dummy;
	}

	async removeNoActiveDefence(combatant)
	{
		if (!combatant)
			return;

		const actor = game.scenes.get(combatant.sceneId)?.tokens?.get(combatant.tokenId)?.actor;
		if (actor)
		{
			let effectsToRemove = [];
			for (let effect of actor.effects)
			{
				if (!effect.duration || !effect.duration.startRound || !effect.duration.rounds)
					continue;

				if ((effect.duration.startRound + effect.duration.rounds <= this.current.round) &&
					effect.flags?.core?.statusId == "noActiveDefense")
				{
					effectsToRemove.push(effect._id);
				}

			}
			if (effectsToRemove.length > 0)
				await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove);
		}
	}

	async checkEffectLifeTime()
	{
		if (this.active && game.user.isGM)
		{
			const round = this.current.round;
			const turn = this.current.turn;

			for (const combatant of this.combatants)
			{
				const token = game.scenes.viewed.tokens.get(combatant.tokenId);

				const actor = token?.actor;
				if (actor)
				{
					let effectsToRemove = [];
					for (let effect of actor.effects)
					{
						if (!effect.duration || !effect.duration.startRound || !effect.duration.rounds)
							continue;

						if ((effect.duration.startRound + effect.duration.rounds < round) ||
							(effect.duration.startRound + effect.duration.rounds == round && effect.duration.startTurn < turn))
						{
							effectsToRemove.push(effect._id);
						}

					}
					if (effectsToRemove.length > 0)
						await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove);
				}
			}
		}
	}

	async cleanEffectsOnCombatEnd()
	{
		if (!game.user.isGM)
			return;

		for (let combatant of this.combatants)
		{
			const token = game.scenes.get(combatant.sceneId).tokens.get(combatant.tokenId);

			const actor = token?.actor;
			if (actor)
			{
				let effectsToRemove = [];
				for (let effect of actor.appliedEffects)
				{
					if (effect.statuses.has("noActiveDefense") || effect.statuses.has("totalDefense"))
						effectsToRemove.push(effect._id);

					if (effect.statuses.has("temporaryTalentEnhancement"))
						effect.delete();
				}
				if (effectsToRemove.length > 0)
					await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove);
			}
		}
	}
}