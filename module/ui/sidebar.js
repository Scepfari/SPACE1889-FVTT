import SPACE1889Helper from "../helpers/helper.js";
import { ExternalLinks } from "./externalLinks.js";

export default function ()
{
	Hooks.on('renderSettings', (app, html, data) =>
	{
		const jHtml = $(html);
		const documentation = jHtml.find('.documentation');
		let button =
			$(`<button id="reportAspace1889Bug" data-tooltip="${game.i18n.localize("SPACE1889.BugReportTooltip")}"><i class="fas fa-bug"></i> ${game.i18n.localize("SPACE1889.BugReport")}</button>`);
		button.on('click', () => { window.open("https://github.com/Scepfari/SPACE1889-FVTT/issues", "_blank") });
		documentation.append(button);

		button = $(`<button><i class="fas fa-info-circle"></i> ${game.i18n.localize("CONTROLS.Space1889MenuHelp")}</button>`);
		button.on('click', () => { SPACE1889Helper.showHelpJournal(); });
		documentation.append(button);

		button = $(`<button><i class="fa fa-external-link"></i> ${game.i18n.localize("SPACE1889.ExternalLinksTitel")}</button>`);
		button.on('click', () =>
		{
			new ExternalLinks().render(true);

		});
		documentation.append(button);
	});
};

