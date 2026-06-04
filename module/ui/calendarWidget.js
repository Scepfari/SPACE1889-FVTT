import { SPACE1889WorldCalendar } from "../calendar/calendar.js";
import SPACE1889Helper from "../helpers/helper.js";
import SPACE1889Time from "../helpers/time.js";
import { CalendarMonthlyViewWidget } from './calendarMonthlyView.js';

export class CalendarWidget extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
	static SECONDS_PER_HOUR = 3600;
	static SECONDS_PER_DAY = 24 * this.SECONDS_PER_HOUR;

	static DEFAULT_OPTIONS = {
		id: 'space1889-calendar-widget',
		window: {
			frame: false,
			positioned: false,
		},
		classes: ['space1889CalendarWidget', 'faded-ui'],
		actions: {
			edit: this.editCalendar,
			openCalendar: this.openCalendar,
			toggleAutoLight: this.toggleAutoLight,
			forward: { handler: this.forward, buttons: [0, 2] },
			fastForward: { handler: this.fastForward, buttons: [0, 2] },
			smallForward: { handler: this.smallForward, buttons: [0, 2] }
		},
	};

	static PARTS = {
		main: {
			root: true,
			template: 'systems/space1889/templates/calendar/calendarWidget.hbs',
		},
	};

	
	async _prepareContext(_options)
	{
		const data = await super._prepareContext(_options);
		const components = game.time.calendar.timeToComponents(game.time.worldTime);
		const secondsInDay = this.constructor.calculateSecondsInDay(components);

		//const oldDate = { year: components.year, month: components.month + 1, day: components.dayOfMonth + 1, hour: components.hour, minute: components.minute, second: components.second };

		data.components = components;
		data.dateString = SPACE1889WorldCalendar.formatLongTimeDate(components);
		const moonInfo = game.time.calendar.calculateMoonPhaseForDate(game.time.worldTime);
		data.dateTooltip = game.i18n.format("SPACE1889.Calendar.Moon.Info", { moonphase: game.i18n.localize(moonInfo.phase.langId), phaseday: Math.floor(moonInfo.phaseDay) + 1 });
		data.autoDarknessEnabled = game.settings.get('space1889', 'calendarDayTimes').darknessByDayTime;
		data.isGM = game.user.isGM;
		data.dayProgress = Math.round(secondsInDay / this.constructor.SECONDS_PER_DAY * 100);
		data.calendarViewDate = game.time.worldTime;

		return data;
	}

	// Helper method to calculate seconds passed in the current day
	static calculateSecondsInDay(components)
	{
		return components.hour * this.SECONDS_PER_HOUR +
			components.minute * 60 +
			components.second;
	}

	static smallForward(ev, target)
	{
		const factor = ev.button != 2 ? 1 : -1;
		let seconds = 1;
		if (ev.shiftKey && !ev.ctrlKey)
			seconds = 6;
		else if (!ev.shiftKey && ev.ctrlKey)
			seconds = 15;
		else if (ev.shiftKey && ev.ctrlKey)
			seconds = 30;

		SPACE1889Time.changeDate(seconds * factor);
	}

	static forward(ev, target)
	{
		const factor = ev.button != 2 ? 1 : -1;
		let seconds = 60;
		if (ev.shiftKey && !ev.ctrlKey)
			seconds = 300;
		else if (!ev.shiftKey && ev.ctrlKey)
			seconds = 600;
		else if (ev.shiftKey && ev.ctrlKey)
			seconds = 1800;

		SPACE1889Time.changeDate(seconds * factor);
	}

	static fastForward(ev, target)
	{
		const factor = ev.button != 2 ? 1 : -1;
		let seconds = this.constructor.SECONDS_PER_HOUR;
		if (ev.shiftKey && !ev.ctrlKey)
			seconds = this.constructor.SECONDS_PER_HOUR * 4;
		else if (!ev.shiftKey && ev.ctrlKey)
			seconds = this.constructor.SECONDS_PER_HOUR * 12;
		else if (ev.shiftKey && ev.ctrlKey)
			seconds = this.constructor.SECONDS_PER_DAY;

		SPACE1889Time.changeDate(seconds * factor);
	}

	async _onRender(context, options)
	{
		await super._onRender(context, options);

		if (this.calendarMonthlyView)
			this.calendarMonthlyView.render();

		if (!SPACE1889Helper.hasUserTimeControl())
			return;

		this._setupDragHandlers();
	}

	static async toggleAutoLight(ev, target)
	{
		let dayTimeSettings = game.settings.get('space1889', 'calendarDayTimes');
		dayTimeSettings.darknessByDayTime = !dayTimeSettings.darknessByDayTime
		await game.settings.set('space1889', 'calendarDayTimes', dayTimeSettings);
		target.classList.toggle('fa-toggle-on', dayTimeSettings.darknessByDayTime);
		target.classList.toggle('fa-toggle-off', !dayTimeSettings.darknessByDayTime);

		if (dayTimeSettings.darknessByDayTime)
			SPACE1889Time.refreshLightLevel();
	}

	static async openCalendar(ev, target)
	{
		this.calendarViewDate = game.time.worldTime;

		if (!this.calendarMonthlyView)
			this.calendarMonthlyView = new CalendarMonthlyViewWidget();
		this.calendarMonthlyView.render(true);
	}

	onCoseCalendar()
	{
		if (this.calendarMonthlyView)
			this.calendarMonthlyView = null;
	}

	getCalendarViewDate()
	{
		return this.calendarViewDate;
	}

	setCalendarViewDate(timestamp)
	{
		this.calendarViewDate = timestamp;
	}

	_setupDragHandlers()
	{
		const indicator = this.element.querySelector('.slideIndicator');
		const container = this.element.querySelector('.dayProgress');

		indicator.addEventListener('mousedown', this._handleMouseDown.bind(this));
		this.element.addEventListener('mousemove', this._handleMouseMove.bind(this, container, indicator));
		this.element.addEventListener('mouseup', this._handleMouseUp.bind(this));
	}

	_handleMouseDown(e)
	{
		this.isDragging = true;
		this.wasDragging = false;
		this.offsetX = e.clientX - e.target.offsetLeft;
		e.preventDefault();
		e.stopPropagation();
	}

	_handleMouseMove(container, indicator, e)
	{
		if (!this.isDragging) return;

		this.wasDragging = true;

		const containerRect = container.getBoundingClientRect();
		const maxLeft = containerRect.width - indicator.offsetWidth;
		const newLeft = Math.max(0, Math.min(e.clientX - this.offsetX, maxLeft));
		const percentage = newLeft / maxLeft * 100.0;

		indicator.style.setProperty('--p', `${percentage}%`);
		this.currentPercentage = percentage;

		this._updateTimeIndicator(container, containerRect, percentage);
	}

	_updateTimeIndicator(container, containerRect, percentage)
	{
		const secondsInDay = this.constructor.SECONDS_PER_DAY * percentage / 100.0;
		const hour = Math.floor(secondsInDay / this.constructor.SECONDS_PER_HOUR) || 0;
		const minute = Math.floor((secondsInDay % this.constructor.SECONDS_PER_HOUR) / 60) || 0;
		const second = Math.floor(secondsInDay % 60) || 0;

		const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

		container.style.width = containerRect.width + 'px';
		container.querySelector('.timeIndicator').textContent = timeString;
	}

	_handleMouseUp(ev)
	{
		if (!this.isDragging) return;

		this.isDragging = false;
		ev.preventDefault();
		ev.stopPropagation();

		const components = game.time.calendar.timeToComponents(game.time.worldTime);
		const currentSeconds = this.constructor.calculateSecondsInDay(components);
		const newSeconds = this.constructor.SECONDS_PER_DAY * this.currentPercentage / 100.0;

		if (isNaN(newSeconds)) return;

		const advanceTime = Math.floor(newSeconds - currentSeconds);
		if (advanceTime === 0) return;

		SPACE1889Time.changeDate(advanceTime);
	}
}
