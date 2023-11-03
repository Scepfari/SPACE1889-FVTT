import SPACE1889Helper from "./helpers/helper.mjs";
import TurnMarker from "./helpers/turnMarker.mjs";

export const registerSystemSettings = function ()
{
	const styles = duplicate(CONFIG.SPACE1889.styles)
    for(let key of Object.keys(styles)){
        styles[key] = game.i18n.localize(styles[key])
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
                "space1889-naked": game.i18n.localize("SPACE1889.ConfigGlobalStyleNaked"),
			},
			onChange: async (val) =>
			{
				$('body').removeClass(Object.keys(styles).join(" ")).addClass(val)
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
                "d6odd": game.i18n.localize("SPACE1889.ConfigDiceD6odd"),
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
                "5": game.i18n.localize("SPACE1889.HeroLevelUebermensch"),
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
			default: "0.7.4",
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

    game.settings.register("space1889", "useCombatTurnMarker",
	    {
            name: "SPACE1889.ConfigUseCombatTurnMarker",
            hint: "SPACE1889.ConfigUseCombatTurnMarkerInfo",
		    scope: "world",
		    config: true,
		    default: true,
			type: Boolean,
			onChange: function (newValue)
			{
				if (canvas.tokens.Space1889TurnMarker)
					SPACE1889Helper.refreshTurnMarker(!newValue);
				if (newValue)
					new TurnMarker();
			}
		});

	game.settings.register("space1889", "combatMarkerTransparency", {
		name: "SPACE1889.ConfigUseCombatMarkerTransparency",
		hint: "SPACE1889.ConfigUseCombatMarkerTransparencyInfo",
		scope: "client",
		config: true,
		type: Number,
		range: {
			min: 0.1,
			max: 1,
			step: 0.1,
		},
		default: 1,
		onChange: function ()
		{
			if (game.settings.get("space1889", "useCombatTurnMarker"))
				SPACE1889Helper.refreshTurnMarker();
		}
	});

	game.settings.register("space1889", "combatMarkerImagePath", {
		name: "SPACE1889.ConfigUseCombatMarkerImagePath",
		hint: "SPACE1889.ConfigUseCombatMarkerImagePathInfo",
		scope: "client",
		config: true,
		type: String,
		default: "systems/space1889/icons/turnmarkers/gear_copper.webp",
		filePicker: "image",
		onChange: function ()
		{
			if (game.settings.get("space1889", "useCombatTurnMarker"))
				SPACE1889Helper.refreshTurnMarker();
		}
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
			step: 1,
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

}
