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
				onChange: () =>
				{
					SPACE1889Helper.npcsDrawWeaponsWithDialog();
				}
			},
			showTokenNameAndBar: {
				name: "showTokenNameAndBar",
				title: "CONTROLS.Space1889MenuShowNameAndBar",
				icon: "fa fa-eye",
				button: true,
				visible: game.user.isGM,
				onChange: () =>
				{
					SPACE1889Helper.showTokenNameAndBarWithDialog();
				}
			},
			hideNames: {
				name: "hideNames",
				title: "CONTROLS.Space1889MenuHideNameOfNonCharacters",
				icon: "fa fa-low-vision",
				button: true,
				visible: game.user.isGM,
				onChange: () =>
				{
					SPACE1889Helper.hideNameOfNonCharactersWithDialog();
				}
			},
			redoTokenLightAndVision: {
				name: "redoTokenLightAndVision",
				title: "CONTROLS.Space1889MenuRedoTokenLightAndVision",
				icon: "far fa-lightbulb",
				button: true,
				visible: game.user.isGM,
				onChange: (ev) =>
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
				onChange: () =>
				{
					SPACE1889Helper.filePickerImageToChat();
				}
			},
			showHelp: {
				name: "showHelp",
				title: "CONTROLS.Space1889MenuHelp",
				icon: "fa fa-info",
				button: true,
				onChange: () =>
				{
					SPACE1889Helper.showHelpJournal();
				}
			},
			showMenuWindow: {
				name: "showMenuWindow",
				title: "CONTROLS.Space1889MenuToggle",
				icon: "fa-space1889",
				button: true,
				onChange: (ev) =>
				{
					const presetMenu = foundry.applications.instances.get("space1889-menu");
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
						position: {
							left: savedLeft,
							top: savedTop
						}
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


export class Space1889Menu extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

	constructor()
	{
		super(...arguments);
	}

	static DEFAULT_OPTIONS = {
		id: 'space1889-menu',
		form: {
			closeOnSubmit: true,
			class: "space1889Menu"
		},
		position: {
			width: 295,
			height: 87
		},
		tag: "form",
		window: {
/*			icon: "fa-space1889",*/
			resizable: true,
			minimizable: true
		}
	}

	static PARTS = {
		space1889Menu: {
			template: "systems/space1889/templates/menu/menu.html"
		}
	}


	get title() {
		let title = game.i18n.localize('CONTROLS.Space1889Menu');
		return title;
	}

	_prepareContext(options)
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
		}
	}

	_onRender(context, options)
	{
		this.element.querySelector("button[name=showImage]").addEventListener("click", function ()
		{
			SPACE1889Helper.filePickerImageToChat()
		});
		this.element.querySelector("button[name=showGmScreen]").addEventListener("click", function ()
		{
			SPACE1889Helper.showGmScreen()
		});
		this.element.querySelector("button[name=npcsDrawWeapon]").addEventListener("click", function ()
		{
			SPACE1889Helper.npcsDrawWeaponsWithDialog()
		});
		this.element.querySelector("button[name=hideNames]").addEventListener("click", function ()
		{
			SPACE1889Helper.hideNameOfNonCharactersWithDialog()
		});
		this.element.querySelector("button[name=showTokenNameAndBar]").addEventListener("click", function ()
		{
			SPACE1889Helper.showTokenNameAndBarWithDialog()
		});
		this.element.querySelector("button[name=showHelp]").addEventListener("click", function ()
		{
			SPACE1889Helper.showHelpJournal()
		});
		this.element.querySelector("button[name=setGravity]").addEventListener("click", function ()
		{
			SPACE1889Helper.showSetGravityDialog()
		});
		this.element.querySelector("button[name=redoTokenLightAndVision]").addEventListener("click", function (event)
		{
			SPACE1889Light.redoTokenLight(ev);
			SPACE1889Vision.redoTokenVision(ev);
		});
	}
};