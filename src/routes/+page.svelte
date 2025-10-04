<script lang="ts" module>
	import type { IssueInfo } from '$types/newspaper';
	import { comparePeriods } from '$lib/utils';

	export type IssueGroup = IssueInfo[];

	const groupByYear = (issues: IssueInfo[], reversed: boolean = false): IssueGroup[] => {
		const grouped: IssueGroup[] = Object.values(
			issues.reduce(
				(acc, issue) => {
					if (!acc[issue.year]) acc[issue.year] = [];

					acc[issue.year].push(issue);
					return acc;
				},
				{} as Record<number, IssueInfo[]>
			)
		);

		grouped.forEach((group) =>
			group.sort((issue1, issue2) => comparePeriods(issue1.period, issue2.period))
		);
		grouped.sort((group1, group2) => group1[0].year - group2[0].year);

		return reversed ? grouped.reverse() : grouped;
	};
</script>

<script lang="ts">
	import { Issue } from '$lib/components/issue';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { CalendarArrowDownIcon, CalendarArrowUpIcon } from 'lucide-svelte';
	import { ModeSwitch } from '$lib/components/mode-switch/index.js';
	import { SearchBar } from '$lib/components/search-bar';

	const { data } = $props();

	let sorting = $state<'ascending' | 'descending'>('descending');

	const groups = $derived<IssueGroup[]>(groupByYear(data.issues, sorting === 'descending'));

	const nextSorting = () => {
		sorting = sorting === 'descending' ? 'ascending' : 'descending';
	};
</script>

<svelte:head>
	<title>Listujeme Floriány</title>
</svelte:head>

<div class="flex h-full flex-col gap-4 overflow-hidden p-4 pr-0">
	<div class="mr-4 flex flex-col gap-4">
		<div class="flex items-center">
			<h1 class="text-2xl font-bold">Florián: Zpravodaj městyse Lázně Toušeň</h1>
			<ModeSwitch class="ml-auto" />
		</div>
		<div class="flex gap-4 max-sm:flex-col-reverse">
			<Button variant="outline" class="flex min-w-40 justify-start text-left" onclick={nextSorting}>
				{#if sorting === 'descending'}
					<CalendarArrowDownIcon /> Od nejnovějšího
				{:else}
					<CalendarArrowUpIcon /> Od nejstaršího
				{/if}
			</Button>
			<SearchBar class="flex-1" />
		</div>
	</div>
	<ScrollArea class="size-full pr-4" type="always">
		{#each groups as group (group[0].year)}
			<h2 class="sticky top-0 z-10 rounded bg-secondary px-8 py-2 text-xl font-bold">
				{group[0].year}
			</h2>
			<div class="flex flex-wrap gap-4 p-4 max-md:justify-center">
				{#each group as issue (issue.name)}
					<Issue class="w-[290px]" info={issue} />
				{/each}
			</div>
		{/each}
	</ScrollArea>
</div>
