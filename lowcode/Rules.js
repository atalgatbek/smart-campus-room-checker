export default {
	// Same fixed demo data as the code-based version: now = 09:00, one booking 10:00-11:00.
	NOW: 540,
	BOOKINGS: [{ start: 600, end: 660 }],

	toMinutes (text) {
		const m = /^(\d{2}):(\d{2})$/.exec(String(text || '').trim());
		if (!m) return null;
		const h = Number(m[1]);
		const mi = Number(m[2]);
		if (h > 23 || mi > 59) return null;
		return h * 60 + mi;
	},

	fmt (total) {
		if (total === 1440) return '24:00';
		return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
	},

	// Returns the shared contract output: { available, reasonCode, message }.
	check (startText, durationText, blocked) {
		const start = this.toMinutes(startText);
		const durText = String(durationText ?? '').trim();
		const no = (reasonCode, message) => ({ available: false, reasonCode: reasonCode, message: message });
		if (start === null && durText === '') return no('MISSING_INPUT', 'Start time and duration are required.');
		if (start === null) return no('MISSING_INPUT', 'Start time is required.');
		if (durText === '') return no('MISSING_INPUT', 'Duration is required.');
		if (!/^-?\d+$/.test(durText)) return no('INVALID_DURATION', 'Duration must be a whole number of minutes.');
		const duration = Number(durText);
		if (duration <= 0) return no('INVALID_DURATION', 'Duration must be greater than 0 minutes.');
		const end = start + duration;
		if (end > 1440) return no('INVALID_TIME', 'Times must be within 00:00–24:00.');
		if (start <= this.NOW) return no('PAST_TIME', 'Start must be after current time ' + this.fmt(this.NOW) + '.');
		if (duration > 120) return no('TOO_LONG', 'Maximum duration is 120 minutes.');
		if (blocked) return no('BLOCKED', 'Room is currently blocked and cannot be booked.');
		const hit = this.BOOKINGS.find((b) => start < b.end && b.start < end);
		if (hit) return no('OVERLAP', 'Overlaps with existing booking ' + this.fmt(hit.start) + '–' + this.fmt(hit.end) + '.');
		return { available: true, reasonCode: 'AVAILABLE', message: 'This time slot is available.' };
	}
}
