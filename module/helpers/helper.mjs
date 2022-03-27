export default class SPACE1889Helper
{
    static getTalentData(actor, talentId)
    {
        return actor.data.talents?.find(entry => entry.data.id == talentId);
    }

    static getTalentLevel(actor, talentId)
    {
        const talent = this.getTalentData(actor, talentId);
        if (talent != undefined)
        {
            return talent.data.level.value;
        }
        return 0;
    }

    static getDeathThreshold(actor)
    {
        let threshold = -5;
        const level = this.getTalentLevel(actor, "zaeherHund");
        if (level > 0)
            threshold -= (2 * level);

        return threshold;
    }

    static isAutoStabilize(actor)
    {
        return (this.getTalentLevel(actor, "zaeherHund") > 0);
    }

    static getIncapacitateThreshold(actor)
    {
        let threshold = 0;
        const level = this.getTalentLevel(actor, "schmerzresistenz");
        if (level > 0)
            threshold -= (2 * level);

        return threshold;
    }
}