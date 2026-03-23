import { SPACE1889WorldCalendar } from "../calendar/calendar.js";
import { SPACE1889CalendarConfig } from '../calendar/calendarConfig.js';
import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889Time from "../helpers/time.js";
export class CalendarMonthlyViewWidget extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

	constructor(parent)
	{
		super();
		this.parent = parent;
	}

	static DEFAULT_OPTIONS = {
		id: 'space1889-calendar-monthly-view',
		tag: 'div',
		window: {
			frame: true,
			positioned: true,
			title: 'SPACE1889.Calendar.MonthlyView',
			icon: 'fa-solid fa-calendar',
			//minimizable: false,
			resizable: true
		},
		position: {
			width: 400,
			height: 'auto'
		},
		classes: ['space1889CalendarMonthlyView'],
		actions: {
			prevYear: CalendarMonthlyViewWidget.prototype._onPreviousYear,
			prevMonth: CalendarMonthlyViewWidget.prototype._onPreviousMonth,
			goToToday: CalendarMonthlyViewWidget.prototype._onGoToToday,
			nextMonth: CalendarMonthlyViewWidget.prototype._onNextMonth,
			nextYear: CalendarMonthlyViewWidget.prototype._onNextYear,
			selectDate: CalendarMonthlyViewWidget.prototype._onSelectDate,
		},
	};

	static PARTS = {
		main: {
			id: "main",
			template: 'systems/space1889/templates/calendar/calendarMonthlyView.hbs',
		},
	};

	async _prepareContext(_options = {})
	{
		const data = await super._prepareContext(_options);
		const viewDateTimestamp = this.parent.getCalendarViewDate();
		const components = game.time.calendar.timeToComponents(viewDateTimestamp);
		data.viewDate = components;
		data.viewDate.timestamp = viewDateTimestamp;
		data.currentDate = game.time.calendar.timeToComponents(game.time.worldTime);
		data.isGM = game.user.isGM;
		data.monthData = this.generateMonthData(data.viewDate, data.currentDate);
		data.weekdays = SPACE1889CalendarConfig.days.values.map(wd => ({
			name: wd.name,
			abbreviation: wd.abbreviation
		}));
		return data;
	}
	/**
	 * Generate calendar month data with day grid and note indicators
	 */
	generateMonthData(viewDate, currentDate) {
		// Get month information
		const monthInfo = CONFIG.time.worldCalendarConfig.months.values[viewDate.month];
		if (!monthInfo)
			return { weeks: [], totalDays: 0 };
		// Calculate month length (considering leap years)
		const monthLength = game.time.calendar.daysInMonth(viewDate.month, viewDate.year);

		// Find the first day of the month and its weekday
		const firstDayTimestamp = viewDate.timestamp - (viewDate.dayOfMonth * game.time.calendar.secondsPerDay());
		const firstDay = game.time.calendar.timeToComponents(firstDayTimestamp);

		// Build calendar grid
		const weeks = [];
		let currentWeek = [];
		// Fill in empty cells before month starts
		const startWeekday = firstDay.dayOfWeek || 0;
		for (let i = 0; i < startWeekday; i++) {
			currentWeek.push({
				day: 0,
				date: { year: 0, month: 0, day: 0, weekday: 0 },
				isCurrentMonth: false,
				isToday: false,
				hasNotes: false,
				isEmpty: true,
				hasMoon: false
			});
		}
		// Fill in the days of the month
		let weekday = startWeekday;
		for (let day = 0; day < monthLength; day++) 
		{
			const dayDateData = {
				year: viewDate.year,
				month: viewDate.month,
				day: day,
				weekday: weekday
			};

			const isToday = this.isSameDate(dayDateData, currentDate);
			const isViewDate = this.isSameDate(dayDateData, viewDate);

			const dayTimestamp = firstDayTimestamp + day * game.time.calendar.secondsPerDay();
			const moonInfo = game.time.calendar.calculateMoonPhaseForDate(dayTimestamp);
			const showMoon = moonInfo &&
				(moonInfo.phaseIndex == 0 || moonInfo.phaseIndex == 2 || moonInfo.phaseIndex == 4 || moonInfo.phaseIndex == 6);
			// ToDo: Tooltip für Zeitpunkt von Neu- und Vollmond


			// Determine category class for styling
			let categoryClass = '';
			currentWeek.push({
				day: day+1,
				date: {
					year: dayDateData.year,
					month: dayDateData.month,
					day: dayDateData.day,
					weekday: dayDateData.weekday,
				},
				isCurrentMonth: true,
				isToday: isToday,

				// Additional properties for template
				isSelected: isViewDate,
				isClickable: true,
				weekday: weekday,
				fullDate: `${viewDate.year}-${(viewDate.month + 1).toString().padStart(2, '0')}-${(day + 1).toString().padStart(2, '0')}`,
				categoryClass: categoryClass,
				primaryCategory: 'general',
				hasMoon: showMoon,
				moonPhaseIndex: moonInfo.phaseIndex
			});
			// Start new week on last day of week
			if (currentWeek.length === CONFIG.time.worldCalendarConfig.days.values.length) {
				weeks.push(currentWeek);
				currentWeek = [];
			}
			weekday = SPACE1889WorldCalendar.getNextWeekday(weekday);
		}
		// Fill in empty cells after month ends
		if (currentWeek.length > 0) {
			while (currentWeek.length < game.time.calendar.days.values.length) {
				currentWeek.push({
					day: 0,
					date: { year: 0, month: 0, day: 0, weekday: 0 },
					isCurrentMonth: false,
					isToday: false,
					hasNotes: false,
					isEmpty: true,
					hasMoon: false
				});
			}
			weeks.push(currentWeek);
		}
		return {
			weeks: weeks,
			totalDays: monthLength,
			monthName: monthInfo.name
		};
	}

	/**
	 * Check if two dates are the same (ignoring time)
	 */
	isSameDate(simpleDate, componentDate) {
		// Basic date comparison
		const sameBasicDate = simpleDate.year === componentDate.year
			&& simpleDate.month === componentDate.month && simpleDate.day === componentDate.dayOfMonth;
		return sameBasicDate;
	}

	/**
	 * Navigate to current date
	 */
	async _onGoToToday(event, _target)
	{
		event.preventDefault();
		this.parent.setCalendarViewDate(game.time.worldTime);
		this.render(true);
	}


	/**
	 * Navigate to previous month
	 */
	async _onPreviousMonth(event, _target) {
		event.preventDefault();
		const newTimestamp = SPACE1889WorldCalendar.decreaseTimeByOneMonth(this.parent.calendarViewDate);
		this.parent.setCalendarViewDate(newTimestamp);
		this.render(true);
	}
	/**
	 * Navigate to next month
	 */
	async _onNextMonth(event, _target) {
		event.preventDefault();
		const newTimestamp = SPACE1889WorldCalendar.increaseTimeByOneMonth(this.parent.calendarViewDate);
		this.parent.setCalendarViewDate(newTimestamp);
		this.render(true);
	}
	/**
	 * Navigate to previous year
	 */
	async _onPreviousYear(event, _target)
	{
		event.preventDefault();
		const newTimestamp = SPACE1889WorldCalendar.decreaseTimeByOneYear(this.parent.calendarViewDate);
		this.parent.setCalendarViewDate(newTimestamp);
		this.render(true);
	}
	/**
	 * Navigate to next year
	 */
	async _onNextYear(event, _target) {
		event.preventDefault();
		const newTimestamp = SPACE1889WorldCalendar.increaseTimeByOneYear(this.parent.calendarViewDate);
		this.parent.setCalendarViewDate(newTimestamp);
		this.render(true);
	}

	async _onSelectDate(event, _target)
	{
		//		const calendarDay = target.closest('.calendar-day');
		const setDate = event.ctrlKey && event.shiftKey;
		const selectedDay = _target.dataset.day - 1;
		const components = game.time.calendar.timeToComponents(this.parent.calendarViewDate);
		const delta = selectedDay - components.dayOfMonth;
		const delteInSeconds = delta * game.time.calendar.secondsPerDay();
		const newTimestamp = this.parent.calendarViewDate + delteInSeconds;
		this.parent.setCalendarViewDate(newTimestamp);
		if (setDate)
		{
			const offset = newTimestamp - game.time.worldTime;
			SPACE1889Time.changeDate(offset);
		}
		this.render(true);
	}

	
	/**
	 * Go to current date
	 */
	async _onGoToToday(event, _target) {
		event.preventDefault();
		this.parent.setCalendarViewDate(game.time.worldTime);
		this.render();
	}

	/**
     * Handle closing the widget
     */
    async close(options = {}) {
		// Clear active instance if this is it
		this.parent?.onCoseCalendar();
        return super.close(options);
    }

}