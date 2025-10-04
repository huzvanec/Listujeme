import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const seasons: string[] = ['jaro', 'léto', 'podzim', 'zima'];

export const isSeason = (str: string): boolean => seasons.includes(str);

export const compareSeasons = (season1: string, season2: string): number => {
	const index1: number = seasons.indexOf(season1);
	const index2: number = seasons.indexOf(season2);

	if (index1 === -1 || index2 === -1)
		throw TypeError(`Invalid season: "${season1}" or "${season2}"`);

	return index1 - index2;
};

export const isMonthRange = (str: string): boolean => {
	return /^(0?[1-9]|1[0-2])-(0?[1-9]|1[0-2])$/.test(str);
};

export const months = [
	'leden',
	'únor',
	'březen',
	'duben',
	'květen',
	'červen',
	'červenec',
	'srpen',
	'září',
	'říjen',
	'listopad',
	'prosinec'
];

export const monthToString = (num: number): string => {
	const month = months[num - 1];
	if (!month) throw TypeError(`Invalid month number: ${num}`);
	return month;
};

export const translateMonthRange = (range: string): string => {
	if (!isMonthRange(range)) throw TypeError(`Invalid month range: "${range}"`);
	const split: string[] = range.split('-');
	return `${monthToString(+split[0])} – ${monthToString(+split[1])}`;
};

export const compareMonthRanges = (range1: string, range2: string): number => {
	if (!isMonthRange(range1) || !isMonthRange(range2))
		throw TypeError(`Invalid month range: "${range1}" or "${range2}"`);

	const split1: string[] = range1.split('-');
	const split2: string[] = range2.split('-');

	const range1Month1: number = +split1[0];
	const range2Month1: number = +split2[0];

	if (range1Month1 === range2Month1) return +split1[1] - +split2[1];
	return range1Month1 - range2Month1;
};

export const comparePeriods = (period1: string, period2: string): number => {
	const isSeason1: boolean = isSeason(period1);
	const isSeason2: boolean = isSeason(period2);
	if (isSeason1 && isSeason2) return compareSeasons(period1, period2);
	if (isSeason1 || isSeason2)
		throw TypeError(
			`Invalid comparison: "${period1}" and "${period2}". Seasons can only be compared with other seasons.`
		);

	const isMonthRange1: boolean = isMonthRange(period1);
	const isMonthRange2: boolean = isMonthRange(period2);
	if (isMonthRange1 && isMonthRange2) return compareMonthRanges(period1, period2);
	if (isMonthRange1 || isMonthRange2)
		throw TypeError(
			`Invalid comparison: "${period1}" and "${period2}". Month ranges can only be compared with other month ranges.`
		);

	throw TypeError(`Invalid period: "${period1}" or "${period2}"`);
};

export const translatePeriod = (period: string) => {
	if (!isMonthRange(period)) return period;
	return translateMonthRange(period);
};

export const api: string = `${import.meta.env.VITE_API_HOST}`;
