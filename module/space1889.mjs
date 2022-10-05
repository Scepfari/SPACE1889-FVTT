// Import document classes.
import { Space1889Actor } from "./documents/actor.mjs";
import { Space1889Item } from "./documents/item.mjs";
// Import sheet classes.
import { Space1889ActorSheet } from "./sheets/actor-sheet.mjs";
import { Space1889ItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { SPACE1889 } from "./helpers/config.mjs";
import { registerSystemSettings } from "./settings.mjs";
import { Space1889Translation } from "./helpers/translation.mjs";
import { Space1889Migration } from "./helpers/migration.mjs";
import { Space1889Tour } from "./tours/space1889_tour.mjs";
import SPACE1889Helper from "./helpers/helper.mjs";
import SPACE1889RollHelper from "./helpers/roll-helper.mjs";


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

	// Add utility classes to the global game object so that they're more easily
	// accessible in global contexts.
	game.space1889 = {
		Space1889Actor,
		Space1889Item,
		rollItemMacro,
		config: SPACE1889,
		translation: Space1889Translation,
	};

	// Add custom constants for configuration.
	CONFIG.SPACE1889 = SPACE1889;

	// Define custom Document classes
	CONFIG.Actor.documentClass = Space1889Actor;
	CONFIG.Item.documentClass = Space1889Item;

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("space1889", Space1889ActorSheet, { makeDefault: true });
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("space1889", Space1889ItemSheet, { makeDefault: true });

	// Register System Settings
	registerSystemSettings();

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
		formula: "(@secondaries.initiative.total)" + game.settings.get("space1889", "dice") + " + @secondaries.initiative.total / 100",
		decimals: 2
	};

	// Preload Handlebars templates.
	return preloadHandlebarsTemplates();
});

Hooks.on("chatMessage", (html, content, msg) =>
{
	let cmd = content.match(/^\/(help|space1889)/)
	cmd = cmd ? cmd[0] : ""
	switch (cmd)
	{
		case "/space1889":
			ui.notifications.info("Gl&uuml;ckwunsch, du hast ein nicht dokumentiertes Testkommando gefunden");
			//console.log(SPACE1889Helper.getEffectData("paralysis"));
			return false;
		case "/help":
			SPACE1889Helper.showHelpJournal();
			return false;
	}
});

Hooks.on("renderChatMessage", (app, html, msg) => 
{
	// toDo: Buttons bei Bedarf ausblenden

	html.on('click', '.autoDefence', ev =>
	{
		SPACE1889RollHelper.onAutoDefense(ev);
	})
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
	var outStr = '';
	for (var arg in arguments) {
		if (typeof arguments[arg] != 'object') {
			outStr += arguments[arg];
		}
	}
	return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
	return str.toLowerCase();
});

Handlebars.registerHelper('doubleCheck', function (firstLeft, fistRight, secondLeft, secondRight)
{
	return firstLeft == fistRight && secondLeft == secondRight;
})

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

	await Space1889Translation.runInitTranslationAction();
	await Space1889Migration.runInitMigrationAction();
	Space1889Migration.showNewVersionInfo();
	// refresh Vehicle Data
	game.actors.forEach((values, keys) =>
	{
		if (values.type == "vehicle")
			values.prepareDerivedData();
	});
	Space1889Tour.registerTours()
});


/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
	if (data.type !== "Item") return;
	if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
	const item = data;

	// Create the macro command
	const command = `game.space1889.rollItemMacro("${item.name}");`;
	let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: "script",
			img: item.img,
			command: command,
			flags: { "space1889.itemMacro": true }
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);
	const item = actor ? actor.items.find(i => i.name === itemName) : null;
	if (!item) 
		return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);


	if (item.type === "skill" || item.type === "specialization")
		return item.rollSpecial(item.system.rating, true);

	if (item.type === "weapon")
		return item.rollSpecial(item.system.attack, true);

	// Trigger the item roll
	return item.roll();
}