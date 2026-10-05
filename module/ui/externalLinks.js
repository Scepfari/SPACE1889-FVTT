import SPACE1889Helper from "../helpers/helper.js";

export class ExternalLinks extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

	constructor()
	{
		super(...arguments);
	}

	static DEFAULT_OPTIONS = {
		id: 'externalLinks',
		form: {
			closeOnSubmit: true,
			class: "externalLinks"
		},
		position: {
			width: 750,
			height: 180,
			left: 100,
			top: 40
		},
		tag: "form",
		window: {
			minimizable: true
		}
	}

	static PARTS = {
		externalLinks: {
			template: "systems/space1889/templates/dialog/externalLinks.html"
		}
	}


	get title() {
		let title = game.i18n.localize('SPACE1889.ExternalLinksTitel');
		return title;
	}

	_prepareContext(options)
	{
		const data = {};
		return data;
	}

	_onRender(context, options)
	{
		this.element.querySelector("button[name=externalLinks]").addEventListener("click", function ()
		{
			SPACE1889Helper.showRecommendedModules()
		});
		this.element.querySelector("button[name=discordFoundry]").addEventListener("click", function ()
		{
			window.open("https://discord.gg/foundryvtt", "_blank");
		});
		if (SPACE1889Helper.isGerman())
		{
			this.element.querySelector("button[name=discordGiesserei]").addEventListener("click", function ()
			{
				window.open("https://discord.gg/XrKAZ5J", "_blank");
			});
		}
		this.element.querySelector("button[name=zeughaus]").addEventListener("click", function ()
		{
			window.open("https://gitlab.com/ProjectAvalanche/space1889", "_blank");
		});
	}
};
