import { SPACE1889CalendarConfig } from '../calendar/calendarConfig.js';

export class SPACE1889WorldCalendar extends foundry.data.CalendarData
{
	static init()
	{
		CONFIG.time.worldCalendarConfig = SPACE1889CalendarConfig;
		CONFIG.time.worldCalendarClass = this;
	}

	isLeapYear(year)
	{
		return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
	}

	daysInMonth(monthIndex, year)
	{
		const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if (monthIndex === 1 && this.isLeapYear(year))
		{
			return 29;
		}
		return days[monthIndex];
	}

	dayCountInYear(year)
	{
		return this.isLeapYear(year) ? 366 : 365;
	}

	getSeason(month, dayOfMonth)
	{
		let season = -1;
		for (let element of CONFIG.time.worldCalendarConfig.seasons.values)
		{
			if (month < element.monthStart || ( month === element.monthStart && element.dayStart > dayOfMonth))
				break; 
			++season;
		}
		return season === -1 ? 3 : season;
	}

	timeToComponents(timestamp = 0)
	{
		const secondsPerDay = 86400;
		let days = timestamp >= 0 ? Math.floor(timestamp / secondsPerDay) : Math.ceil(timestamp / secondsPerDay);
		let secondsInDay = timestamp % secondsPerDay;

		if (secondsInDay < 0)
		{
			secondsInDay += secondsPerDay;
			days -= 1;
		}

		const firstWeekday = SPACE1889CalendarConfig.years.firstWeekday; // 1.1.1970 war ein Donnerstag
		// const firstWeekday = 1; // 1.1.1889 war ein Dienstag
		const totalWeekdays = days + firstWeekday;
		let dayOfWeek = totalWeekdays % 7; //this.days.values.length;
		if (dayOfWeek < 0)
			dayOfWeek += 7;

		const zeroInfo = game.settings.get("space1889", "yearZero").split("|");
		const isYearZeroSet = Boolean(zeroInfo[0]);
		const yearZero = isYearZeroSet ? Number(zeroInfo[1]) : 1970;
		let year = yearZero;
		let daysInYear = 0;

		if (days >= 0)
		{
			while (true)
			{
				const dayCountInYear = this.dayCountInYear(year);
				if (days < dayCountInYear)
				{
					daysInYear = days;
					break;
				}

				days -= dayCountInYear;
				year++;
			}
		}
		else
		{
			while (true)
			{
				year--;
				const dayCountInYear = this.dayCountInYear(year);
				if (-days < dayCountInYear)
				{
					daysInYear = dayCountInYear + days;
					days = daysInYear;
					break;
				}

				days += dayCountInYear;
			}
		}

		let month = 0;
		while (true)
		{
			const daysInMonth = this.daysInMonth(month, year);
			if (days < daysInMonth)
				break;

			days -= daysInMonth;
			month++;
		}

		let dayOfMonth = days;
		let leapYear = this.isLeapYear(year)

		let season = this.getSeason(month, dayOfMonth);

		const day = days;
		const hour = Math.floor(secondsInDay / 3600);
		const minute = Math.floor((secondsInDay % 3600) / 60);
		const second = secondsInDay % 60;

		return {
			day: daysInYear,
			dayOfMonth: dayOfMonth,
			dayOfWeek: dayOfWeek,
			hour: hour,
			leapYear: this.isLeapYear(year),
			minute: minute,
			month: month,
			season: season,
			second: second,
			year: year
		};
	}

	componentsToTime(components)
	{
		const secondsPerDay = 86400;
		const yearZero = SPACE1889CalendarConfig.years.yearZero;
		let totalDays = 0;

		if (components.year >= yearZero)
		{
			for (let year = yearZero; year < components.year; ++year)
			{
				totalDays += this.dayCountInYear(year);
			}
		}
		else
		{
			for (let year = components.year; year < yearZero; ++year)
			{
				totalDays -= this.dayCountInYear(year);
			}
		}

		totalDays += (components.day ?? 0);
		let time = totalDays * secondsPerDay;
		time += (components.hour ?? 0) * 3600;
		time += (components.minute ?? 0) * 60;
		time += (components.second ?? 0);
		return time;
	}

	static formatTimeDateFromTimeStamp(timestamp)
	{
		const dateComponents = this.timeToComponents(timestamp);
		return this.formatTimeDate(dateComponents);
	}

	static formatTimeDate(date)
	{
		let text = (date.dayOfMonth + 1).toString() + "." + (date.month + 1).toString() + "." + date.year.toString() +
			" " + date.hour.toString() + ":" + (date.minute < 10 ? "0" : "") + date.minute.toString() +
			":" + (date.second < 10 ? "0" : "") + date.second.toString();
		return text;
	}

	static formatLongTimeDate(date)
	{
		const dayOfTheWeek = game.i18n.localize(game.time.calendar.days.values[date.dayOfWeek].name);
		const monthName = game.i18n.localize(game.time.calendar.months.values[date.month].name);

		let text = dayOfTheWeek + ", " + (date.dayOfMonth + 1).toString() + ". " + monthName + " " + date.year.toString() +
			" - " + date.hour.toString() + ":" + (date.minute < 10 ? "0" : "") + date.minute.toString() +
			":" + (date.second < 10 ? "0" : "") + date.second.toString();
		return text;
	}


}