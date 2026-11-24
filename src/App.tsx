import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Lock, Unlock, CalendarDays, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { Booking } from '@/lib/canBook';
import type { ReasonCode } from '@/lib/canBook';
import { checkRequest, parseDuration } from '@/lib/checkRequest';
import { fallbackExplanation, type ExplanationRequest } from '@/lib/explainValidation';
import { mockExplain, type MockMode } from '@/lib/mockExplain';
import { INITIAL_BOOKINGS, NOW } from '@/lib/fixtures';
import { formatMinutes, parseHHMM } from '@/lib/time';

function App() {
  const [startTime, setStartTime] = useState('11:00');
  const [duration, setDuration] = useState('60');
  const [blocked, setBlocked] = useState(false);
  const [bookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [mockMode, setMockMode] = useState<MockMode>('normal');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const pendingRequest = useRef<AbortController | null>(null);

  // Inputs changed: cancel any pending explanation so an old answer can never
  // appear next to the new result card.
  useEffect(() => {
    pendingRequest.current?.abort();
    pendingRequest.current = null;
    setExplaining(false);
    setExplanation(null);
    setExplanationError(false);
  }, [startTime, duration, blocked]);

  const result = useMemo(
    () => checkRequest(startTime, duration, NOW, blocked, bookings),
    [startTime, duration, blocked, bookings]
  );

  // End time shown to the user and sent to the explanation (empty when the input is invalid).
  const startMinutes = parseHHMM(startTime);
  const durationMinutes = parseDuration(duration);
  const endTime =
    startMinutes !== null && durationMinutes !== null && durationMinutes > 0 && startMinutes + durationMinutes < 1440
      ? formatMinutes(startMinutes + durationMinutes)
      : '';

  const isAvailable = result.status === 'valid' && result.available;

  const handleExplain = async () => {
    pendingRequest.current?.abort();
    const controller = new AbortController();
    pendingRequest.current = controller;
    setExplaining(true);
    setExplanationError(false);
    setExplanation(null);
    const request: ExplanationRequest = {
      roomLabel: 'Room 204 — Main Building',
      start: startTime,
      end: endTime,
      isAvailable,
      reasonCode: result.reasonCode as ReasonCode,
    };
    try {
      const res = await mockExplain(request, mockMode, controller.signal);
      if (controller.signal.aborted) return;
      setExplanation(res.explanation);
    } catch {
      if (controller.signal.aborted) return;
      setExplanationError(true);
      setExplanation(fallbackExplanation(isAvailable));
    } finally {
      if (!controller.signal.aborted) setExplaining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
                Room 204 — Main Building
              </h1>
              <p className="text-sm text-slate-500">Availability Checker</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
            <Clock className="h-4 w-4 text-blue-600" />
            Current time: <span className="font-medium">{formatMinutes(NOW)}</span>
          </p>
        </header>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Check a time slot
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Start time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Duration (minutes)</span>
              <input
                type="number"
                inputMode="numeric"
                step={15}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-xs text-slate-500">
                {endTime ? `Ends at ${endTime}` : 'Max 120 minutes'}
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setBlocked((v) => !v)}
            aria-pressed={blocked}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              {blocked ? (
                <Lock className="h-4 w-4 text-red-600" />
              ) : (
                <Unlock className="h-4 w-4 text-emerald-600" />
              )}
              Simulate room blocked
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {blocked ? 'Blocked' : 'Open'}
            </span>
          </button>

          <div
            className={`mt-4 flex items-start gap-3 rounded-xl p-4 transition ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                : 'bg-red-50 text-red-900 ring-1 ring-red-200'
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">
                {isAvailable ? 'Available' : 'Unavailable'}
              </p>
              <p className="text-sm break-words">{result.reason}</p>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleExplain}
              disabled={explaining}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {explaining ? 'Explaining…' : 'Explain availability'}
            </button>
            <div className="mt-2 flex items-center justify-end gap-2 text-xs text-slate-500">
              <span className="font-medium">Mock AI mode</span>
              <select
                value={mockMode}
                onChange={(e) => setMockMode(e.target.value as MockMode)}
                aria-label="Mock AI mode (for developers)"
                className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs"
              >
                <option value="normal">normal</option>
                <option value="slow">slow</option>
                <option value="error">error</option>
              </select>
            </div>
            <span className="sr-only" role="status" aria-live="polite">
              {explanation}
            </span>
          </div>

          {explanation !== null && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Mock AI (no real model)
              </p>
              <p className="mt-1 text-sm text-amber-900">
                {explanationError
                  ? 'The explanation could not be generated. The result card above remains the confirmed status.'
                  : explanation}
              </p>
              <p className="mt-2 text-xs text-amber-700">
                AI-generated explanation, not the booking status
              </p>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Existing bookings (read-only)
          </h2>
          <ul className="mt-3 space-y-2">
            {bookings.map((b, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {formatMinutes(b.start)} – {formatMinutes(b.end)}
                </span>
                <span className="text-xs font-medium text-slate-400">Confirmed</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            This page only checks availability. No bookings are created, saved, or confirmed.
          </p>
        </section>
      </div>
    </div>
  );
}

export default App;
