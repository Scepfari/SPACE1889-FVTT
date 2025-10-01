import SPACE1889Healing from "../helpers/healing.js";
import SPACE1889Helper from "./helper.js";
import SPACE1889Light from "./light.js";
import SPACE1889Vision from "./vision.js";

export default class SPACE1889Time
{
	static connectHooks()
	{
		if (!this.isSimpleCalendarEnabled())
			return;

		Hooks.on(SimpleCalendar.Hooks.DateTimeChange, (data) => 
		{
			SPACE1889Time.#dateTimeChanged(data);
		});

		Hooks.on(SimpleCalendar.Hooks.Ready, (data) => 
		{
			console.log("SimpleCalendar.Ready");

			if (game.user.isGM && SimpleCalendar.api.getCurrentCalendar().leapYear.rule === 'gregorian')
			{
				const yearZero = SimpleCalendar.api.getCurrentCalendar().year.yearZero;
				const yearZeroInfo = "true|" + yearZero.toString();
				game.settings.set("space1889", "yearZero", yearZeroInfo);
			}
		});
	}

	static isSimpleCalendarEnabled()
	{
		const id = "foundryvtt-simple-calendar";
		return game.modules.get(id) && game.modules.get(id).active;
	}

	static getCurrentTimestamp()
	{
		if (this.isSimpleCalendarEnabled())
			return SimpleCalendar.api.timestamp();

		const worldDate = new Date();
		return worldDate.getTime();
	}

	static getCurrentTimeAndDate()
	{
		if (this.isSimpleCalendarEnabled())
		{
			const date = SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
			return { year: date.year, month: date.month + 1, day: date.day + 1, hour: date.hour, minute: date.minute, second: date.second };
		}
		const worldDate = new Date();

		return {
			year: worldDate.getFullYear(), month: Number(worldDate.getMonth()) + 1, day: worldDate.getDate(),
			hour: worldDate.getHours(), minute: worldDate.getMinutes(), second: worldDate.getSeconds()
		};
	}

	static getTimeAndDate(timestamp)
	{
		if (this.isSimpleCalendarEnabled())
		{
			const date = SimpleCalendar.api.timestampToDate(timestamp);
			return { year: date.year, month: date.month + 1, day: date.day + 1, hour: date.hour, minute: date.minute, second: date.second };
		}
		const worldDate = new Date(timestamp);

		return {
			year: worldDate.getFullYear(), month: Number(worldDate.getMonth()) + 1, day: worldDate.getDate(),
			hour: worldDate.getHours(), minute: worldDate.getMinutes(), second: worldDate.getSeconds()
		};
	}

	static formatTimeDate(date)
	{
		let text = date.day.toString() + "." + date.month.toString() + "." + date.year.toString() +
			" " + date.hour.toString() + ":" + (date.minute < 10 ? "0" : "") + date.minute.toString() +
			":" + (date.second < 10 ? "0" : "") + date.second.toString();
		return text;
	}

	static getCurrentTimeDateString()
	{
		return this.formatTimeDate(this.getCurrentTimeAndDate());
	}

	static formatEffectDuration(effectDuration)
	{
		const canDoDate = this.isSimpleCalendarEnabled();
		const date = canDoDate ? this.formatTimeDate(this.getTimeAndDate(effectDuration.startTime)) : "";
		let roundInfo = "";

		if (effectDuration.startRound > 0 || effectDuration.startTurn > 0)
			roundInfo = game.i18n.format("SPACE1889.EffectRoundTurnInfo", { round: effectDuration.startRound, turn: effectDuration.startTurn });

		return date + (date != "" && roundInfo != "" ? "\r\n " : "") + roundInfo;
	}


	static getTimeDifInSeconds(timestamp, secondTimestamp)
	{
		if (this.isSimpleCalendarEnabled())
			return (timestamp - secondTimestamp);

		return (timestamp - secondTimestamp) / 1000;
	}

	static isLessThenOneHour(timestamp, secondTimestamp)
	{
		const delta = this.getTimeDifInSeconds(timestamp, secondTimestamp);
		return delta >= -3600 && delta <= 0;
	}

	static stringToDate(datestring, format)
	{
		const dayMod = this.isSimpleCalendarEnabled() ? 1 : 0;

		const normalized = datestring.replace(/[^a-zA-Z0-9]/g, '-');
		const normalizedFormat = format.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
		const formatItems = normalizedFormat.split('-');
		const dateItems = normalized.split('-');

		const monthIndex = formatItems.indexOf("mm");
		const dayIndex = formatItems.indexOf("dd");
		const yearIndex = formatItems.indexOf("yyyy");
		const hourIndex = formatItems.indexOf("hh");
		const minutesIndex = formatItems.indexOf("ii");
		const secondsIndex = formatItems.indexOf("ss");

		const year = yearIndex > -1 ? Number(dateItems[yearIndex]) : 1889;
		const month = monthIndex > -1 ? Number(dateItems[monthIndex]) - 1 : 0;
		const day = dayIndex > -1 ? Number(dateItems[dayIndex]) - dayMod : 1 - dayMod;

		const hour = hourIndex > -1 ? Number(dateItems[hourIndex]) : 0;
		const minute = minutesIndex > -1 ? Number(dateItems[minutesIndex]) : 0;
		const second = secondsIndex > -1 ? Number(dateItems[secondsIndex]) : 0;
		return { year: year, month: month, day: day, hour: hour, minute: minute, second: second };
	}

	static dateStringToTimestamp(datestring, format)
	{
		if (this.isSimpleCalendarEnabled())
			return SimpleCalendar.api.dateToTimestamp(this.stringToDate(datestring, format));

		const sc = this.stringToDate(datestring, format);
		let date = new Date(sc.year, sc.month, sc.day, sc.hour, sc.minute, sc.second);
		return date.getTime();
	}

	static changeDate(offsetInSeconds)
	{
		if (this.isSimpleCalendarEnabled())
		{
			if (!SimpleCalendar.api.changeDate({ seconds: offsetInSeconds }))
			{
				ui.notifications.info(game.i18n.localize("SPACE1889.CanNotSetTime"));
			}
		}
	}

	static #dateTimeChanged(data)
	{
		console.log("neues Datum:" + `${data.date.display.day}.${data.date.display.month}.${data.date.year} ${data.date.display.time}`);

		SPACE1889Helper.refreshAllOpenCharacterSheets();

		if (!game.user.isGM)
			return;

		SPACE1889Healing.healByTime();
		SPACE1889Light.timePasses();
		SPACE1889Vision.timePasses();
	}
}
