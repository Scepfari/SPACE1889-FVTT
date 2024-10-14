import SPACE1889Helper from "./helper.js";
import SPACE1889Time from "../helpers/time.js";

export class Space1889Combatant extends Combatant 
{
	constructor(data, context)
	{
		if (data.flags == undefined)
			data.flags = {}
		if (data.flags.space1889?.defenseCount == undefined)
			foundry.utils.mergeObject(data.flags, { space1889: { defenseCount: 0 } });
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

		if (this.active && this.scene === null && game.user.isGM)
		{
			// wenn mit der Begegnung keine Szene verknüpft ist, stellt der simple calendar die Zeit nicht vor
			SPACE1889Time.changeDate(6); 
		}

		return dummy;
	}

	async previousRound()
	{
		const dummy = await super.previousRound();

		if (this.active && this.scene === null && game.user.isGM)
		{
			// wenn mit der Begegnung keine Szene verknüpft ist, stellt der simple calendar die Zeit nicht zurück
			SPACE1889Time.changeDate(-6); 
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
					(Space1889Combat.hasStatus(effect, "noActiveDefense") || Space1889Combat.hasStatus(effect, "totalDefense")) )
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
				const token = SPACE1889Helper.getTokenFromId(combatant.tokenId);
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
				let effects = SPACE1889Helper.isFoundryV10Running() ? actor.effects : actor.appliedEffects;
				for (let effect of effects)
				{
					if (Space1889Combat.hasStatus(effect, "noActiveDefense") || Space1889Combat.hasStatus(effect, "totalDefense"))
						effectsToRemove.push(effect._id);

					if (Space1889Combat.hasStatus(effect, "temporaryTalentEnhancement"))
						effect.delete();
				}
				if (effectsToRemove.length > 0)
					await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove);
			}
		}
	}

	static hasStatus(effect, searchKey)
	{
		if (SPACE1889Helper.isFoundryV10Running())
		{
			const statusId = effect.flags?.core?.statusId;
			if (statusId && statusId == searchKey)
				return true;
			return false;
		}

		// ab V11 
		return effect.statuses.has(searchKey);
	}

	async selectToken()
	{
		if (game.user.isGM && game.settings.get("space1889", "combatAutoTokenSelect"))
		{
			const combatTokenId = game.combat?.combatant?.token?.id;
			const token = canvas.tokens.get(combatTokenId);

			if (!SPACE1889Helper.hasOneOrMorePlayerOwnership(token?.actor?.ownership) && token)
			{
				canvas.tokens.releaseAll();
				token.control();
			}				
		}
	}
}
