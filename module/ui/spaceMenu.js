import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889Light from "../helpers/light.js";
import SPACE1889Vision from "../helpers/vision.js";


export default class Space1889MenuV13 {
	static registerButtons()
	{
		CONFIG.Canvas.layers.space1889MenuV13 = {
			layerClass: Space1889MenuLayer,
			group: 'interface'
		};
	}
}

class Space1889MenuLayer extends foundry.canvas.layers.InteractionLayer
{
	static get layerOptions()
	{
		return foundry.utils.mergeObject(super.layerOptions, {
			name: 'space1889MenuV13',
			canDragCreate: false,
			zIndex: 666
		});
	}

	selectObjects(options)
	{
		canvas.tokens.selectObjects(options);
	}

	static prepareSceneControls()
	{
		const tools = {
			select: {
				name: "select",
				title: "CONTROLS.BasicSelect",
				icon: "fa fa-expand",
				button: true
			},
			showGmScreen: {
				name: "showGmScreen",
				title: "CONTROLS.Space1889MenuGMScreen",
				icon: "far fa-map",
				button: true,
				visible: game.user.isGM,
				onChange: () =>
				{
					SPACE1889Helper.showGmScreen();
				}
			},
			setGravity: {
				name: "setGravity",
				title: "SPACE1889.SetGravityDialogTitle",
				icon: "fa fa-globe",
				button: true,
				visible: game.user.isGM,
				onChange: () =>
				{
					SPACE1889Helper.showSetGravityDialog();
				}
			},
			npcsDrawWeapon: {
				name: "npcsDrawWeapon",
				title: "CONTROLS.Space1889MenuNpcsDrawWeapon",
				icon: "far fa-hand-rock",
				button: true,
				visible: game.user.isGM,
				onClick: () =>
				{
					SPACE1889Light.npcsDrawWeaponsWithDialog();
				}
			},
			showTokenNameAndBar: {
				name: "showTokenNameAndBar",
				title: "CONTROLS.Space1889MenuShowNameAndBar",
				icon: "fa fa-eye",
				button: true,
				visible: game.user.isGM,
				onClick: () =>
				{
					SPACE1889Light.showTokenNameAndBarWithDialog();
				}
			},
			hideNames: {
				name: "hideNames",
				title: "CONTROLS.Space1889MenuHideNameOfNonCharacters",
				icon: "fa fa-low-vision",
				button: true,
				visible: game.user.isGM,
				onClick: () =>
				{
					SPACE1889Light.hideNameOfNonCharactersWithDialog();
				}
			},
			redoTokenLightAndVision: {
				name: "redoTokenLightAndVision",
				title: "CONTROLS.Space1889MenuRedoTokenLightAndVision",
				icon: "far fa-lightbulb",
				button: true,
				visible: game.user.isGM,
				onClick: (ev) =>
				{
					SPACE1889Light.redoTokenLight(ev);
					SPACE1889Vision.redoTokenVision(ev);
				}
			},
			showImage: {
				name: "showImage",
				title: "CONTROLS.Space1889MenuShowImage",
				icon: "fas fa-file-image",
				button: true,
				onClick: () =>
				{
					SPACE1889Helper.filePickerImageToChat();
				}
			},
			showHelp: {
				name: "showHelp",
				title: "CONTROLS.Space1889MenuHelp",
				icon: "fa fa-info",
				button: true,
				onClick: () =>
				{
					SPACE1889Helper.showHelpJournal();
				}
			},
			showMenuWindow: {
				name: "showMenuWindow",
				title: "CONTROLS.Space1889MenuToggle",
				icon: "fa-space1889",
				button: true,
				onClick: (ev) =>
				{
					const presetMenu = Object.values(ui.windows).find((app) => app instanceof Space1889Menu);
					if (presetMenu)
					{
						presetMenu.close();
						return;
					}

					const savedPos = game.settings.get("space1889", "menuPosition").split("|");
					let savedLeft = Number(savedPos[0]);
					let savedTop = Number(savedPos[1]);
					if (savedLeft < 0 || savedTop < 0)
					{
						savedLeft = ev.width + 50;
						savedTop = ev.height;
					}

					new Space1889Menu({
						left: savedLeft,
						top: savedTop
					}).render(true);

				}
			}
		}
		
		return {
			name: "gmMenu",
			title: "CONTROLS.Space1889Menu",
			icon: "fa-space1889",
			layer: "space1889MenuV13",
			activeTool: "select",
			tools
		};
	}
}


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
			width: 285,
			height: 82
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

		html.on("click", ".redoTokenLightAndVision", ev =>
		{
			SPACE1889Light.redoTokenLight(ev);
			SPACE1889Vision.redoTokenVision(ev);
		});
	}
};