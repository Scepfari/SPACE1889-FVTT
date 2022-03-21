/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
	return loadTemplates([

		// Actor partials.
		"systems/space1889/templates/actor/parts/actor-talents.html",
		"systems/space1889/templates/actor/parts/actor-items.html",
		"systems/space1889/templates/actor/parts/actor-skills.html",
		"systems/space1889/templates/actor/parts/actor-weapons.html",
		"systems/space1889/templates/actor/parts/actor-weakness.html",
		"systems/space1889/templates/actor/parts/actor-language.html",
		"systems/space1889/templates/actor/parts/actor-effects.html",
		"systems/space1889/templates/actor/parts/actor-biography.html",
		"systems/space1889/templates/actor/parts/actor-creature-skills.html",
		"systems/space1889/templates/actor/parts/actor-creature-talents.html",
		"systems/space1889/templates/actor/parts/actor-creature-weapons.html",
		"systems/space1889/templates/actor/parts/actor-creature-weakness.html",
	]);
};
