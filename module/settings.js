import SPACE1889Helper from "./helpers/helper.js";
import { SPACE1889WorldCalendar } from "./calendar/calendar.js";

export const registerSystemSettings = function ()
{
	const styles = foundry.utils.duplicate(CONFIG.SPACE1889.styles);
    for(let key of Object.keys(styles)){
		styles[key] = game.i18n.localize(styles[key]);
    }
    game.settings.register("space1889", "globalStyle",
        {
            name: "SPACE1889.ConfigGlobalStyle",
            hint: "SPACE1889.ConfigGlobalStyleInfo",
            scope: "client",
            config: true,
            default: "space1889-immersive",
            type: String,
            choices:
            {
                "space1889-immersive": game.i18n.localize("SPACE1889.ConfigGlobalStyleImmersive"),
                "space1889-naked": game.i18n.localize("SPACE1889.ConfigGlobalStyleNaked")
			},
			onChange: async (val) =>
			{
				$('body').removeClass(Object.keys(styles).join(" ")).addClass(val);
			}
        }
    );

	game.settings.register("space1889", "dice",
        {
            name: "SPACE1889.ConfigDice",
            hint: "SPACE1889.ConfigDiceInfo",
            scope: "world",
            config: true,
            default: "dc",
            type: String,
            choices:
            {
                "dc": game.i18n.localize("SPACE1889.ConfigDiceCoin"),
                "d6even": game.i18n.localize("SPACE1889.ConfigDiceD6even"),
                "d6odd": game.i18n.localize("SPACE1889.ConfigDiceD6odd")
            }
        }
    );

    game.settings.register("space1889", "heroLevel",
        {
            name: "SPACE1889.ConfigHeroLevel",
            hint: "SPACE1889.ConfigHeroLevelInfo",
            scope: "world",
            config: true,
            default: 2,
            type: String,
            choices:
            {
                "0": game.i18n.localize("SPACE1889.HeroLevelPechvogel"),
                "1": game.i18n.localize("SPACE1889.HeroLevelDurchschnittsbuerger"),
                "2": game.i18n.localize("SPACE1889.HeroLevelVielversprechend"),
                "3": game.i18n.localize("SPACE1889.HeroLevelVeteran"),
                "4": game.i18n.localize("SPACE1889.HeroLevelWeltspitze"),
                "5": game.i18n.localize("SPACE1889.HeroLevelUebermensch")
            }
        }
    );

    game.settings.register("space1889", "improvedForeignLanguageCountCalculation",
        {
            name: "SPACE1889.ConfigImprovedForeignLanguageCountCalculation",
            hint: "SPACE1889.ConfigImprovedForeignLanguageCountCalculationInfo",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });

    game.settings.register("space1889", "improvedEpCalculation",
        {
            name: "SPACE1889.ConfigImprovedEpCalculation",
            hint: "SPACE1889.ConfigImprovedEpCalculationInfo",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });

    game.settings.register("space1889", "optionalBlockDogeParryRule",
        {
            name: "SPACE1889.ConfigOptionalBlockDogeParryRule",
            hint: "SPACE1889.ConfigOptionalBlockDogeParryRuleInfo",
            scope: "world",
            config: true,
            default: false,
			type: Boolean,
			requiresReload: true
        });

    game.settings.register("space1889", "combatSupport",
        {
            name: "SPACE1889.ConfigCombatSupport",
            hint: "SPACE1889.ConfigCombatSupportInfo",
            scope: "world",
            config: true,
            default: "true",
            type: Boolean
        }
	);

	game.settings.register("space1889", "hideAutoDefenseButton",
		{
			name: "SPACE1889.ConfigHideAutoDefenseButton",
			hint: "SPACE1889.ConfigHideAutoDefenseButtonInfo",
            scope: "world",
            config: true,
            default: "false",
			type: Boolean,
			requiresReload: true
		});

    game.settings.register("space1889", "usePercentForNpcAndCreatureDamageInfo",
	    {
            name: "SPACE1889.ConfigUsePercentForNpcAndCreatureDamageInfo",
            hint: "SPACE1889.ConfigUsePercentForNpcAndCreatureDamageInfoInfo",
		    scope: "world",
		    config: true,
		    default: false,
		    type: Boolean
        });

    game.settings.register("space1889", "useCharacterRulesForNpc",
	    {
            name: "SPACE1889.ConfiguseCharacterRulesForNpc",
            hint: "SPACE1889.ConfiguseCharacterRulesForNpcInfo",
		    scope: "world",
		    config: true,
		    default: false,
		    type: Boolean
        });

    game.settings.register("space1889", "lastCompendiumTranslationLanguage",
        {
            name: "last translation",
            hint: "language abbreviation and space1889 version",
            scope: "world",
            config: false,
            default: "de|0.6.2",
            type: String
        });

	game.settings.register("space1889", "lastUsedSystemVersion",
		{
			name: "last system version",
			hint: "space1889 version",
			scope: "world",
			config: false,
			default: "0.0.0",
			type: String
		});

	game.settings.register("space1889", "newVersionPopup",
		{
			name: "show popup",
			hint: "show new version popup",
			scope: "world",
			config: false,
			default: "1|0.7.4",
			type: String
		});

	game.settings.register("space1889", "lastUsedFoundryVersion",
		{
			name: "last foundry version",
			hint: "Foundry VTT version",
			scope: "world",
			config: false,
			default: "9.28",
			type: String
		});

	game.settings.register("space1889", "trustedPlayerCanChangeTime",
	{
		name: "SPACE1889.ConfigTrustedPlayerCanChangeTime",
		hint: "SPACE1889.ConfigTrustedPlayerCanChangeTimeInfo",
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("space1889", "combatAutoTokenSelect",
	{
		name: "SPACE1889.ConfigUseCombatAutoTokenSelect",
		hint: "SPACE1889.ConfigUseCombatAutoTokenSelectInfo",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});

    game.settings.register("space1889", "useTokenMovementLimiterForGM",
	    {
            name: "SPACE1889.ConfigUseGmTokenMovementLimiter",
            hint: "SPACE1889.ConfigUseGmTokenMovementLimiterInfo",
		    scope: "world",
		    config: true,
		    default: false,
		    type: Boolean
		});

	game.settings.register("space1889", "subfolder-indent", {
		name: "SPACE1889.ConfigSubfolder-indent",
		hint: "SPACE1889.ConfigSubfolder-indentInfo",
		scope: "client",
		config: true,
		type: Number,
		range: {
			min: 2,
			max: 16,
			step: 1
		},
		default: 8,
		onChange: function (newValue)
		{
			document.documentElement.style.setProperty('--space1889-indent', `${newValue}px`);
		}
	});

    game.settings.register("space1889", "showDialogForAllAttributeRolls",
	    {
            name: "SPACE1889.ConfigShowDialogForAllAttributeRolls",
            hint: "SPACE1889.ConfigShowDialogForAllAttributeRollsInfo",
		    scope: "client",
		    config: true,
		    default: false,
		    type: Boolean
		});

    game.settings.register("space1889", "hideInitiativeRollsInChat",
	    {
            name: "SPACE1889.ConfigHideInitiativeRollsInChat",
            hint: "SPACE1889.ConfigHideInitiativeRollsInChatInfo",
		    scope: "world",
		    config: true,
		    default: false,
		    type: Boolean
		});

    game.settings.register("space1889", "noDeductionsInExtendedActions",
	    {
		    name: "SPACE1889.ConfigNoDeductionsInExtendedActions",
		    hint: "SPACE1889.ConfigNoDeductionsInExtendedActionsInfo",
		    scope: "world",
		    config: true,
		    default: false,
		    type: Boolean
	    });

    game.settings.register("space1889", "menuPosition",
	    {
		    name: "space menu position",
		    hint: "left and top",
		    scope: "client",
		    config: false,
		    default: "-1|-1",
		    type: String
		});

    game.settings.register("space1889", "gravityZone",
	    {
		    name: "gravity zone",
		    hint: "current in game gravity zone",
		    scope: "world",
		    config: false,
		    default: "earth",
		    type: String
		});

    game.settings.register("space1889", "gravityChangeTime",
	    {
		    name: "gravity change time",
		    hint: "time for the last gravity zone change",
		    scope: "world",
		    config: false,
		    default: "",
		    type: String
		});

	game.settings.register("space1889", "yearZero",
		{
			name: "calendar year zero",
			hint: "simple calendar year zero",
			scope: "world",
			config: false,
			default: "false|1970",
			type: String
		});

	game.settings.register("space1889", "calendarDayTimes",
	    {
		    name: "day time settings",
		    hint: "Darkness influence in scene configuration",
		    scope: "world",
		    config: false,
			default: {
				"darknessByDayTime": false,
				"dawn": 6,
				"morning": 7,
				"noon": 11,
				"afternoon": 16,
				"sunset": 20,
				"night": 21,
				"adjustLevels": {
					"dawn": 0.55,
					"morning": 0.2,
					"noon": 0,
					"afternoon": 0,
					"sunset": 0.55,
					"night": 0.95
				}
			},
		    type: Object
		});

	const menus = {
		calendar: {
			name: "SPACE1889.Config.Calendar",
			label: "SPACE1889.Config.CalendarInfo",
			hint: "SPACE1889.Config.CalendarHintInfo",
			type: ConfigureCalendar,
			restricted: true
		}
	}
	for (const [key, value] of Object.entries(menus))
	{
		game.settings.registerMenu('space1889', key, value);
	}
}

const saveYearZero = async (form) =>
{
	let yearZero = Number(form.elements[0].value);
	if (yearZero < 1 || yearZero > 2050)
	{
		ui.notifications.warn(game.i18n.format("SPACE1889.Config.CalendarInvalidYearZero", { year: yearZero }));
		return;
	}

	const yearZeroInfo = "true|" + yearZero.toString();
	await game.settings.set("space1889", "yearZero", yearZeroInfo);
	CONFIG.time.worldCalendarClass.init();
	game.space1889.apps.CalendarWidget.render(true);	
};

class ConfigureCalendar extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	async render()
	{
		const baseContent = await foundry.applications.handlebars.renderTemplate('systems/space1889/templates/dialog/calendarConfiguration.html', {});
		const index = baseContent.indexOf("value=") + 7;
		const content = baseContent.substr(0, index) + SPACE1889WorldCalendar.getYearZero().toString() + baseContent.substr(index + 4);

		new foundry.applications.api.DialogV2({
			window: {
				title: game.i18n.localize('SPACE1889.Config.CalendarConfig'),
			},
			position: {
				width: 400,
				height: 400
			},
			content,
			buttons: [
				{
					action: 'save',
					icon: 'fa fa-check',
					label: game.i18n.localize("SPACE1889.Save"),
					callback: (event, button, dialog) =>
					{
						saveYearZero(button.form);
					},
				},
				{
					action: 'cancel',
					icon: 'fas fa-times',
					label: game.i18n.localize("SPACE1889.Cancel"),
					callback: (event, button, dialog) =>
					{

					},
				},
			],
		}).render(true);
	}

}
