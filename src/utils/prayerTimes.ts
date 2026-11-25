// Vremena namaza za Beograd, računata astronomski za svaki dan.
// Sabah na 18° ispod horizonta, jacija na 17°, ikindija po šafijskom
// mezhebu (senka jednaka predmetu).

const LAT = 44.80401;
const LNG = 20.46513;
const FAJR_ANGLE = 18;
const ISHA_ANGLE = 17;
// Male korekcije u minutima, da se vremena poklope sa onima koja se koriste u gradu.
const OFFSET: Record<string, number> = {fajr: 1.5, sunrise: -0.3, dhuhr: 1.6, asr: 0, maghrib: 1.5, isha: 0.2};

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const sin = (d: number) => Math.sin(rad(d));
const cos = (d: number) => Math.cos(rad(d));
const tan = (d: number) => Math.tan(rad(d));
const asin = (x: number) => deg(Math.asin(x));
const acos = (x: number) => deg(Math.acos(x));
const atan2 = (y: number, x: number) => deg(Math.atan2(y, x));
const acot = (x: number) => deg(Math.atan(1 / x));
const fix = (a: number, b: number) => {
  const r = a - b * Math.floor(a / b);
  return r < 0 ? r + b : r;
};

function julian(y: number, m: number, d: number) {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360);
  const q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
  return {decl: asin(sin(e) * sin(L)), eqt: q / 15 - fix(RA, 24)};
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const PRAYER_KEYS: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** Vremena za dati kalendarski dan u Beogradu, kao Date objekti (UTC trenuci). */
export function prayerTimes(year: number, month: number, day: number): Record<PrayerKey, Date> {
  const jd = julian(year, month, day) - LNG / 360;
  const midDay = (t: number) => fix(12 - sunPosition(jd + t / 24).eqt, 24);
  const angleTime = (angle: number, t: number, ccw: boolean) => {
    const {decl} = sunPosition(jd + t / 24);
    const noon = midDay(t);
    const T = acos((-sin(angle) - sin(decl) * sin(LAT)) / (cos(decl) * cos(LAT))) / 15;
    return noon + (ccw ? -T : T);
  };
  const asrTime = (t: number) => {
    const {decl} = sunPosition(jd + t / 24);
    return angleTime(-acot(1 + tan(Math.abs(LAT - decl))), t, false);
  };

  let t = {fajr: 5, sunrise: 6, dhuhr: 1.6, asr: 13, maghrib: 18, isha: 18};
  for (let i = 0; i < 2; i++) {
    t = {
      fajr: angleTime(FAJR_ANGLE, t.fajr, true),
      sunrise: angleTime(0.833, t.sunrise, true),
      dhuhr: midDay(t.dhuhr),
      asr: asrTime(t.asr),
      maghrib: angleTime(0.833, t.maghrib, false),
      isha: angleTime(ISHA_ANGLE, t.isha, false),
    };
  }

  const base = Date.UTC(year, month - 1, day);
  const out = {} as Record<PrayerKey, Date>;
  for (const k of PRAYER_KEYS) {
    const utcHours = t[k] - LNG / 15;
    out[k] = new Date(base + Math.round(utcHours * 60 + OFFSET[k]) * 60000);
  }
  return out;
}

/** Današnji datum u Beogradu (godina, mesec, dan). */
export function belgradeToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit'}).format(now);
  const [y, m, d] = parts.split('-').map(Number);
  return {y, m, d};
}

export function formatBelgrade(d: Date) {
  return new Intl.DateTimeFormat('sr-Latn', {timeZone: 'Europe/Belgrade', hour: '2-digit', minute: '2-digit', hour12: false}).format(d);
}
