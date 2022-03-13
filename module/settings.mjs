export const registerSystemSettings = function ()
{
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
}