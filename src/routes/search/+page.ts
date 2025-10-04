import type { PageLoad } from './$types';
import type { IssueInfo } from '$types/newspaper';
import { api } from '$lib/utils';

export const load: PageLoad = async ({ fetch, url }) => {
	try {
		const response = await fetch(`${api}/issues`);
		if (!response.ok) throw Error(`Response not OK: ${response.status}`);
		let query: string | null = url.searchParams.get('q');
		if (!query) query = null;
		return {
			query,
			issues: (await response.json()) as IssueInfo[]
		};
	} catch (e) {
		console.error(e);
		throw new Error('Could not fetch newspaper issues');
	}
};
