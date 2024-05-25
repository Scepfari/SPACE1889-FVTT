import SPACE1889Helper from "../helpers/helper.js";

export class Space1889Menu extends FormApplication {

	constructor(options = {})
	{
		super({}, options);
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: 'space1889-menu',
			classes: ['space1889-menu-window-header'],
			template: `systems/space1889/templates/menu/menu.html`,
			resizable: true,
			minimizable: true,
			width: 260,
			height: 78
		});
	}

	get title() {
		let title = game.i18n.localize('CONTROLS.Space1889Menu');
		return title;
	}

	async getData(options = {})
	{
		const data = {};

		const gravity = SPACE1889Helper.getGravity();

		const name = game.i18n.localize(gravity.langId);
		const gravityZone = gravity.zone;
		const gravityValue = gravity.gravityFactor;
		data.gravityTooltip = game.i18n.format("SPACE1889.GravitySetTooltip", { planet: name, zone: gravityZone.toFixed(1), value: (gravityValue < 0.2 ? gravityValue.toFixed(2) : gravityValue.toFixed(1)), malus : gravity.malusToEarth });

		return data;
	}


	setPosition(position = {})
	{
		const newPos = super.setPosition(position);

		if (newPos && newPos.left >= 0 && newPos.top >= 0)
		{
			const savePos = newPos.left.toString() + "|" + newPos.top.toString();
			game.settings.set("space1889", "menuPosition", savePos);
			console.log(savePos);
		}
	}

	activateListeners(html)
	{
		super.activateListeners(html);

		html.on('click', '.showImage', ev =>
		{
			SPACE1889Helper.filePickerImageToChat();
		});

		html.on('click', '.showGmScreen', ev =>
		{
			SPACE1889Helper.showGmScreen();
		});

		html.on('click', '.npcsDrawWeapon', ev =>
		{
			SPACE1889Helper.npcsDrawWeaponsWithDialog();
		});

		html.on('click', '.hideNames', ev =>
		{
			SPACE1889Helper.hideNameOfNonCharactersWithDialog();
		});

		html.on('click', '.showTokenNameAndBar', ev =>
		{
			SPACE1889Helper.showTokenNameAndBarWithDialog();
		});

		html.on('click', '.showHelp', ev =>
		{
			SPACE1889Helper.showHelpJournal();
		});

		html.on("click", ".setGravity", ev =>
		{
			SPACE1889Helper.showSetGravityDialog();
		});
	}
};