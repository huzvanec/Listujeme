import type { PageLoad } from './$types';
import { api } from '$lib/utils';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch(`${api}/issues`);
		if (!response.ok) throw new Error('Response not OK');
		return {
			issues: await response.json()
		};
	} catch {
		throw new Error('Could not fetch issues!');
	}
};
