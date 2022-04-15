export const registerSystemSettings = function ()
{
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
            name: "SPACE1889.ImprovedForeignLanguageCountCalculation",
            hint: "SPACE1889.ImprovedForeignLanguageCountCalculationInfo",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });

    game.settings.register("space1889", "improvedEpCalculation",
        {
            name: "SPACE1889.ImprovedEpCalculation",
            hint: "SPACE1889.ImprovedEpCalculationInfo",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });

    game.settings.register("space1889", "usePercentForNpcAndCreatureDamageInfo",
	    {
            name: "SPACE1889.UsePercentForNpcAndCreatureDamageInfo",
            hint: "SPACE1889.UsePercentForNpcAndCreatureDamageInfoInfo",
		    scope: "world",
		    config: true,
		    default: false,
		    type: Boolean
	    });
}
