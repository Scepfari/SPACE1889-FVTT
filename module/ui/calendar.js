import SPACE1889Time from "../helpers/time.js";
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

		const oldDate = { year: components.year, month: components.month + 1, day: components.dayOfMonth + 1, hour: components.hour, minute: components.minute, second: components.second };

		data.components = components;
		data.dateString = SPACE1889Time.formatLongTimeDate(components);
		data.dateTooltip = game.i18n.localize(game.time.calendar.months.values[components.month].name);
		data.autoDarknessEnabled = game.settings.get('space1889', 'darknessByDayTime');
		data.isGM = game.user.isGM;
		data.dayProgress = Math.round(secondsInDay / this.constructor.SECONDS_PER_DAY * 100);

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

		game.time.advance(seconds * factor);
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

		game.time.advance(seconds * factor);
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

		game.time.advance(seconds * factor);
	}

	async _onRender(context, options)
	{
		await super._onRender(context, options);

		if (!game.user.isGM) return;

		this._setupDragHandlers();
	}

	static async toggleAutoLight(ev, target)
	{
		const darknessByDayTime = !game.settings.get('space1889', 'darknessByDayTime');
		await game.settings.set('space1889', 'darknessByDayTime', darknessByDayTime);
		target.classList.toggle('fa-toggle-on', darknessByDayTime);
		target.classList.toggle('fa-toggle-off', !darknessByDayTime);
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

		game.time.advance(advanceTime);
	}
}
