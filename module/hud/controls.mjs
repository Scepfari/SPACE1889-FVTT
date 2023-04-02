import SPACE1889Helper from "../helpers/helper.mjs";

export function registerGetSceneControlButtonsHook()
{
	CONFIG.Canvas.layers.space1889menu = { layerClass: Space1889MenuLayer, group: "interface" };

	Hooks.on("getSceneControlButtons", getSceneControlButtons);
}

class Space1889MenuLayer extends InteractionLayer {
    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            name: "space1889menu",
            canDragCreate: false,
            controllableObjects: true,
            rotatableObjects: true,
            zIndex: 666,
        });
    }   
    
    selectObjects(optns) {
        canvas.tokens.selectObjects(optns)
    }
}


function getSceneControlButtons(controls)
{
	if (canvas == null)
	{
		return;
	}
	controls.push({
		name: "SPACE Menu",
		title: "CONTROLS.Space1889Menu",
		icon: 'fas fa-space1889',
		layer: "space1889menu",
		visible: true,
		tools: [
			{
				name: "showimage",
				title: game.i18n.localize("CONTROLS.Space1889MenuShowImage"),
				icon: "fas fa-file-image",
				onClick: () =>
				{
					// onClick liefert ärgerlicherweise kein Event mit, daher können die Tasten wie shift und ctrl nicht ausgelesen werden
					SPACE1889Helper.filePickerImageToChat();
				},
				visible: game.user.isGM,
				button: true,
			},
			{
				name: "slscreen",
				title: game.i18n.localize("CONTROLS.Space1889MenuGMScreen"),
				icon: "far fa-map",
				onClick: () =>
				{
					SPACE1889Helper.showGmScreen();
					//if (canvas.scene)
					//{
					//	const invert = canvas.scene.getFlag("space1889", "slscreen") ?? false;
					//	canvas.scene.setFlag("space1889", "slscreen", !invert);
					//	ui.notifications.info("Toggle Klick");
					//}
				},
				visible: game.user.isGM,
				button: true
				//active: canvas.scene?.getFlag("space1889", "slscreen") ?? false,
				//toggle: true,
			},
			{
				name: "help",
				title: game.i18n.localize("CONTROLS.Space1889MenuHelp"),
				icon: "fa fa-info",
				onClick: () =>
				{
					SPACE1889Helper.showHelpJournal();
				},
				button: true,
			},
		],
		//activeTool: "nix",
	});
}