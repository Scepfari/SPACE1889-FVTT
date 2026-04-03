import { SPACE1889CalendarConfig } from "../calendar/calendarConfig.js";
import SPACE1889Healing from "../helpers/healing.js";
import SPACE1889Helper from "./helper.js";
import SPACE1889Light from "./light.js";
import SPACE1889Vision from "./vision.js";

export default class SPACE1889Time
{
	static connectHooks()
	{
		Hooks.on('updateWorldTime', () =>
		{
			game.space1889.apps.CalendarWidget.render(true);
			SPACE1889Time.#dateTimeChanged();
		});
	}

	static isCalendarEnabled()
	{
		return game.time.calendar.constructor.name == "SPACE1889WorldCalendar";
	}

	static getCurrentTimestamp()
	{
		return game.time.worldTime;
	}

	static getCurrentTimeAndDate()
	{
		const date = game.time.calendar.timeToComponents(this.getCurrentTimestamp());
		return { year: date.year, month: date.month + 1, day: date.dayOfMonth + 1, dayOfWeek: date.dayOfWeek, hour: date.hour, minute: date.minute, second: date.second };
	}

	static getTimeAndDate(timestamp)
	{
		const date = game.time.calendar.timeToComponents(timestamp);
		return { year: date.year, month: date.month + 1, day: date.dayOfMonth + 1, dayOfWeek: date.dayOfWeek, hour: date.hour, minute: date.minute, second: date.second };
	}

	static formatTimeDate(date)
	{
		let text = date.day.toString() + "." + date.month.toString() + "." + date.year.toString() +
			" " + date.hour.toString() + ":" + (date.minute < 10 ? "0" : "") + date.minute.toString() +
			":" + (date.second < 10 ? "0" : "") + date.second.toString();
		return text;
	}

	static formatLongTimeDate(date)
	{
		const dayOfTheWeek = game.i18n.localize(game.time.calendar.days.values[date.dayOfWeek].name);
		const monthName = game.i18n.localize(game.time.calendar.months.values[date.month-1].name);

		let text = dayOfTheWeek + ", " + date.day.toString() + ". " + monthName + " " + date.year.toString() +
			" - " + date.hour.toString() + ":" + (date.minute < 10 ? "0" : "") + date.minute.toString() +
			":" + (date.second < 10 ? "0" : "") + date.second.toString();
		return text;
	}

	static getCurrentTimeDateString()
	{
		return this.formatTimeDate(this.getCurrentTimeAndDate());
	}

	static formatEffectDuration(effectDuration)
	{
		const canDoDate = this.isCalendarEnabled();
		const date = canDoDate ? this.formatTimeDate(this.getTimeAndDate(effectDuration.startTime)) : "";
		let roundInfo = "";

		if (effectDuration.startRound > 0 || effectDuration.startTurn > 0)
			roundInfo = game.i18n.format("SPACE1889.EffectRoundTurnInfo", { round: effectDuration.startRound, turn: effectDuration.startTurn });

		return date + (date != "" && roundInfo != "" ? "\r\n " : "") + roundInfo;
	}


	static getTimeDifInSeconds(timestamp, secondTimestamp)
	{
		if (this.isCalendarEnabled())
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
		const dayMod = this.isCalendarEnabled() ? 1 : 0;

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

	static dateStringToTimestamp(datestring, format, overrideYearZero = false, modifiedYearZero = 1889)
	{
		if (this.isCalendarEnabled())
		{
			const theDate = this.stringToDate(datestring, format)
			const secondsPerDay = game.time.calendar.secondsPerDay();
			const yearZero = overrideYearZero ? modifiedYearZero : game.time.calendar.years.yearZero;
			let totalDays = 0;

			if (theDate.year >= yearZero)
			{
				for (let year = yearZero; year < theDate.year; ++year)
				{
					totalDays += game.time.calendar.dayCountInYear(year);
				}
			}
			else
			{
				for (let year = theDate.year; year < yearZero; ++year)
				{
					totalDays -= game.time.calendar.dayCountInYear(year);
				}
			}

			const monthMax = Math.min(theDate.month, SPACE1889CalendarConfig.months.values.length);
			for (let month = 0; month < monthMax; ++month)
			{
				totalDays += game.time.calendar.daysInMonth(month, theDate.year);
			}

			totalDays += theDate.day;
			let time = totalDays * secondsPerDay;
			time += (theDate.hour ?? 0) * 3600;
			time += (theDate.minute ?? 0) * 60;
			time += (theDate.second ?? 0);
			return time;
		}

		const sc = this.stringToDate(datestring, format);
		let date = new Date(sc.year, sc.month, sc.day, sc.hour, sc.minute, sc.second);
		return date.getTime();
	}

	static async changeDate(offsetInSeconds)
	{
		if (game.user.isGM)
		{
			await game.time.advance(offsetInSeconds);
			this.refreshLightLevel();
		}
		else if (SPACE1889Helper.hasUserTimeControl())
		{
			game.socket.emit("system.space1889", {
				type: "changeTime",
				timeData: {
					offsetInSeconds: offsetInSeconds
				}
			});
		}
		else
			ui.notifications.info(game.i18n.format("SPACE1889.CanNotSetTime", { seconds: offsetInSeconds }));
	}

	static refreshLightLevel()
	{
		const dayTimes = game.settings.get('space1889', 'calendarDayTimes');
		if (!dayTimes.darknessByDayTime)
			return;

		const components = game.time.calendar.timeToComponents(game.time.worldTime);
		const lightLevel = this.calcLightLevel(components, dayTimes);
		if (canvas.scene)
		{
			canvas.scene.update(
				{ 'environment.darknessLevel': Math.clamp(lightLevel, 0, 1) }, { animateDarkness: 500 }
			)
		}
	}

	static calcLightLevel(components, dayTimes)
	{
		const time = components.hour + (components.minute * 60 + components.second) / 3600;

		let min = 0;
		let max = 0;
		let minLevel = 0;
		let maxLevel = 0;
		let phaseTime = 0;

		if (time < dayTimes.dawn - 1 || time >= dayTimes.night)
			return dayTimes.adjustLevels.night;
		else if (time == dayTimes.dawn)
			return dayTimes.adjustLevels.dawn;
		else if (time == dayTimes.morning)
			return dayTimes.adjustLevels.morning;
		else if (time >= dayTimes.noon && time <= dayTimes.afternoon)
			return dayTimes.adjustLevels.noon;
		else if (time == dayTimes.sunset)
			return dayTimes.adjustLevels.sunset;
		else if (time < dayTimes.dawn)
		{
			minLevel = dayTimes.adjustLevels.night;
			maxLevel = dayTimes.adjustLevels.dawn;
			min = Math.max(0, dayTimes.dawn - 1);
			max = dayTimes.dawn;
		}
		else if (time > dayTimes.dawn && time < dayTimes.morning)
		{
			minLevel = dayTimes.adjustLevels.dawn;
			maxLevel = dayTimes.adjustLevels.morning;
			min = dayTimes.dawn;
			max = dayTimes.morning;
		}
		else if (time > dayTimes.morning && time < dayTimes.noon)
		{
			minLevel = dayTimes.adjustLevels.morning;
			maxLevel = dayTimes.adjustLevels.noon;
			min = dayTimes.morning;
			max = dayTimes.noon;
		}
		else if (time > dayTimes.afternoon && time < dayTimes.sunset)
		{
			minLevel = dayTimes.adjustLevels.afternoon;
			maxLevel = dayTimes.adjustLevels.sunset;
			min = dayTimes.afternoon;
			max = dayTimes.sunset;
		}
		else if (time > dayTimes.sunset && time < dayTimes.night)
		{
			minLevel = dayTimes.adjustLevels.sunset;
			maxLevel = dayTimes.adjustLevels.night;
			min = dayTimes.sunset;
			max = dayTimes.night;
		}

		if (minLevel == maxLevel || min == max)
			return minLevel;

		const levelRange = maxLevel - minLevel;
		const timeRange = max - min;
		const timeDelta = time - min;

		const factor = timeDelta / timeRange;
		return Math.clamp(minLevel + (factor * levelRange), 0, 1);
	}

	static #dateTimeChanged()
	{
		SPACE1889Helper.refreshAllOpenCharacterSheets();

		if (!game.user.isGM)
			return;

		SPACE1889Healing.healByTime();
		SPACE1889Light.timePasses();
		SPACE1889Vision.timePasses();
	}
}
