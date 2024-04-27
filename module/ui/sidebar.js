import SPACE1889Helper from "../helpers/helper.js";
export default function () 
{
	Hooks.on("renderSettings",
		(app, html, data) => 
		{
			let button =
				$(`<button id="reportAspace1889Bug" data-tooltip="${game.i18n.localize("SPACE1889.BugReportTooltip")}"><i class="fas fa-bug"></i> ${game.i18n.localize("SPACE1889.BugReport")}</button>`);
			button.on('click', () => { window.open("https://github.com/Scepfari/SPACE1889-FVTT/issues/new", "_blank") });
			html.find("#settings-documentation").append(button);

			button = $(`<button><i class="fas fa-info-circle"></i> ${game.i18n.localize("CONTROLS.Space1889MenuHelp")}</button>`);
			button.on('click', () => { SPACE1889Helper.showHelpJournal(); });
			html.find("#settings-documentation").append(button);
		});
}
