<script lang="ts" module>
	import type { IssueInfo } from '$types/newspaper';

	export interface SearchResult {
		issue: IssueInfo;
		page: number;
		before: string;
		term: string;
		after: string;
	}

	export type SearchResultGroup = SearchResult[];

	const declenseFoundResults = (count: number) => {
		switch (count) {
			case 1:
				return `Nalezen ${count} výsledek`;
			case 2:
			case 3:
			case 4:
				return `Nalezeny ${count} výsledky`;
			default:
				return `Nalezeno ${count} výsledků`;
		}
	};

	const declenseSearchedIssues = (count: number) => {
		switch (count) {
			case 1:
				return `v ${count} čísle`;
			case 2:
			case 3:
			case 4:
				return `ve ${count} číslech`;
			default:
				return `v ${count} číslech`;
		}
	};

	const normalizeDiacritics = (text: string): string => {
		// CZ, SK, FR, DE (https://gist.github.com/Abedron/9144624)
		const diacritics: string = 'áäàâčçďéěëèêíïîĺľňóôöŕšťúůüùûýřžÁÄÀÂČÇĎÉĚËÈÊÍÏÎĹĽŇÓÔŒÖŔŠŤÚŮÜÙÛÝŘŽ';
		const normalized: string = 'aaaaccdeeeeeiiillnooorstuuuuuyrzAAAACCDEEEEEIIILLNOOSORSTUUUUUYRZ';
		let result: string = '';
		for (let i = 0; i < text.length; i++)
			if (diacritics.indexOf(text.charAt(i)) != -1)
				result += normalized.charAt(diacritics.indexOf(text.charAt(i)));
			else result += text.charAt(i);
		return result;
	};
</script>

<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { cn, comparePeriods, translatePeriod } from '$lib/utils';
	import {
		CalendarArrowDownIcon,
		CalendarArrowUpIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		FunnelIcon,
		LoaderCircleIcon,
		SettingsIcon
	} from '@lucide/svelte';
	import { api } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button';
	import { ModeSwitch } from '$lib/components/mode-switch';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
	import { SearchBar } from '$lib/components/search-bar';
	import { Counter } from '$lib/components/counter';
	import {
		Pagination,
		PaginationContent,
		PaginationEllipsis,
		PaginationItem,
		PaginationLink,
		PaginationNextButton,
		PaginationPrevButton
	} from '$lib/components/ui/pagination';
	import SearchSettingsComponent, { type SearchSettings } from './search-settings.svelte';
	import IssueFilter, { type SearchFilter } from './(filter)/issue-filter.svelte';
	import { MediaQuery } from 'svelte/reactivity';

	const { data } = $props();

	const issues = $derived<IssueInfo[]>(data.issues);
	const query = $derived<string | null>(data.query);

	let found = $state<number>(0);
	// svelte-ignore state_referenced_locally
	let searching = $state<boolean>(!!query);
	let results = $state<SearchResult[]>([]);

	const isDesktop = new MediaQuery('(min-width: 768px)');
	const contextChars = $derived<number>(isDesktop.current ? 200 : 50); // on each side around the term
	const resultsPerPage = $derived<number>(isDesktop.current ? 100 : 50);
	const paginationSiblings = $derived<number>(isDesktop.current ? 2 : 1);

	let page = $state<number>(1);
	const pageStart = $derived<number>((page - 1) * resultsPerPage);
	const pageEnd = $derived<number>(page * resultsPerPage);

	let sorting = $state<'ascending' | 'descending'>('descending');

	const nextSorting = () => {
		sorting = sorting === 'descending' ? 'ascending' : 'descending';
	};

	const cache = $state<Record<string, string[]>>({});

	let settings = $state<SearchSettings>({
		caseSensitive: false,
		diacriticSensitive: true,
		trimQuery: true
	});

	// svelte-ignore state_referenced_locally
	let filter = $state<SearchFilter>({
		type: 'range',
		issues
	});

	const getContent = async (name: string): Promise<string[]> => {
		if (!cache[name]) {
			const response = await fetch(`${api}/issues/${name}/content`);
			if (!response.ok) throw Error('Response not OK');
			cache[name] = (await response.json()) as string[];
		}
		return cache[name];
	};

	const search = async (): Promise<SearchResult[]> => {
		found = 0;
		if (!query) return [];
		searching = true;
		const tempResults: SearchResult[] = [];

		const processIssue = async (issue: IssueInfo) => {
			const content: string[] = await getContent(issue.name);
			for (const [pageNum, page] of content.entries()) {
				let startIndex: number = 0;

				let pageStr = page;
				let queryStr = query;
				if (!settings.caseSensitive) {
					pageStr = pageStr.toLowerCase();
					queryStr = queryStr.toLowerCase();
				}
				if (!settings.diacriticSensitive) {
					pageStr = normalizeDiacritics(pageStr);
					queryStr = normalizeDiacritics(queryStr);
				}
				if (settings.trimQuery) {
					const trimmedQuery = queryStr.trim();
					if (trimmedQuery !== '') queryStr = trimmedQuery;
				}

				while ((startIndex = pageStr.indexOf(queryStr, startIndex)) !== -1) {
					const before: string = page.slice(Math.max(0, startIndex - contextChars), startIndex);
					const term: string = page.slice(startIndex, startIndex + queryStr.length);
					const after: string = page.slice(
						startIndex + queryStr.length,
						startIndex + queryStr.length + contextChars
					);
					tempResults.push({
						issue,
						page: pageNum,
						before,
						term,
						after
					});
					startIndex += queryStr.length;
					found++;
				}
			}
		};

		const processIssueConcurrent = (issue: IssueInfo): Promise<void> =>
			new Promise((resolve) =>
				setTimeout(async () => {
					await processIssue(issue);
					resolve();
				})
			);

		const chunkSize: number = 2;
		for (let i = 0; i < filter.issues.length; i += chunkSize) {
			const chunk = filter.issues.slice(i, i + chunkSize);
			await Promise.all(chunk.map(processIssueConcurrent));
		}

		page = 1;
		searching = false;
		tempResults.sort((result1, result2) => {
			const sortMultiplier: 1 | -1 = sorting === 'ascending' ? 1 : -1;
			const year1 = result1.issue.year;
			const year2 = result2.issue.year;
			if (year1 !== year2) return (year1 - year2) * sortMultiplier; // 1. sort by years
			return comparePeriods(result1.issue.period, result2.issue.period) * sortMultiplier; // 2. sort by periods;
			// if period comparation results in 0, the results will be returned in the order they
			// were originally located
		});
		return tempResults;
	};

	$effect(() => {
		void [sorting, { ...settings }, isDesktop.current]; // deps
		search().then((val) => (results = val));
	});

	let scrollArea = $state<HTMLElement | null>(null);

	$effect(() => {
		void page; // deps
		scrollArea?.scroll({ top: 0, behavior: 'smooth' });
	});
</script>

<svelte:head>
	<title>Hledáme ve Floriánech</title>
</svelte:head>

<div
	class={cn(
		'absolute z-50 flex size-full items-center justify-center overflow-hidden bg-background/80 transition-opacity duration-500',
		!searching && 'pointer-events-none opacity-0'
	)}
>
	<LoaderCircleIcon class="size-80 animate-spin stroke-[0.5px]" />
	<div class="absolute flex flex-col items-center justify-center gap-4 text-xl">
		<span class="font-bold">Hledám</span>
		<Counter value={found} />
	</div>
</div>

<div class="flex h-full flex-col gap-4 p-4 pr-0">
	<div class="mr-4 flex flex-col gap-4">
		<div class="flex items-center gap-4">
			<Tooltip>
				<TooltipTrigger>
					<Button variant="ghost" href="/" class="w-min">
						<ChevronLeftIcon />
						Zpět
					</Button>
				</TooltipTrigger>
				<TooltipContent>Zpět na rozcestník</TooltipContent>
			</Tooltip>
			<h1 class="text-2xl">Prohledat Floriány</h1>
			<ModeSwitch class="ml-auto" />
		</div>
		<SearchBar class="flex-1" value={query} />
		<div class="flex gap-2">
			<Button
				variant="outline"
				class="mr-auto flex min-w-40 justify-start text-left"
				onclick={nextSorting}
			>
				{#if sorting === 'descending'}
					<CalendarArrowDownIcon />
					Od nejnovějšího
				{:else}
					<CalendarArrowUpIcon />
					Od nejstaršího
				{/if}
			</Button>
			<IssueFilter tabindex={-1} {issues} bind:filter>
				<Button variant="outline">
					<FunnelIcon />
					<span class="max-sm:hidden">Filtrování</span>
				</Button>
			</IssueFilter>
			<SearchSettingsComponent tabindex={-1} {settings}>
				<Button variant="outline">
					<SettingsIcon />
					<span class="max-sm:hidden">Nastavení vyhledávače</span>
				</Button>
			</SearchSettingsComponent>
		</div>
	</div>
	<p>
		{declenseFoundResults(results.length)}
		{declenseSearchedIssues(filter.issues.length)}
	</p>
	{#if results.length}
		<ScrollArea type="always" class="overflow-hidden w-full" bind:viewportRef={scrollArea}>
			<div class="flex w-full flex-col gap-4 pr-4">
				{#each results.slice(pageStart, pageEnd) as result, index (index)}
					{@const isNewGroup = results[pageStart + index - 1]?.issue.name !== result.issue.name}
					{@const issue = result.issue}
					{#if index === 0 || isNewGroup}
						<a
							target="_blank"
							href="{api}/issues/{issue.name}/view"
							class="sticky top-0 z-10 rounded bg-secondary px-4 py-2 text-xl font-bold"
						>
							{issue.year}
							{translatePeriod(issue.period)}
						</a>
					{/if}
					<Card class="relative flex w-full flex-col gap-2 p-4">
						<div class="flex gap-2 font-bold">
							<a target="_blank" href="{api}/issues/{issue.name}/view">
								strana {result.page + 1}
							</a>
						</div>
						<p
							class="relative h-[2ch] overflow-hidden px-4 font-mono text-sm text-primary/90 md:text-xl"
						>
							<span
								style="padding-left: {contextChars -
									result.before.length}ch; padding-right: {contextChars - result.after.length}ch;"
								class="absolute left-1/2 -translate-x-1/2 whitespace-pre text-nowrap"
							>
								{result.before}<span class="font-bold text-orange-500 underline">
									{result.term}
								</span>{result.after}
							</span>
						</p>
					</Card>
				{/each}
			</div>
		</ScrollArea>
	{:else if !searching}
		<div
			class="flex size-full flex-col items-center justify-center gap-4 text-center text-gray-500"
		>
			<h1 class="text-5xl">Nikde nic ˘︿˘</h1>
			<p class="mx-10">Zkuste změnit hledaný výraz nebo upravit filtrování a nastavení.</p>
		</div>
	{/if}
	<Pagination
		count={results.length}
		perPage={resultsPerPage}
		siblingCount={paginationSiblings}
		class="mt-auto"
		bind:page
	>
		{#snippet children({ pages, currentPage })}
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevButton>
						<ChevronLeftIcon class="size-4" />
						<span class="hidden sm:block">Předchozí</span>
					</PaginationPrevButton>
				</PaginationItem>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<PaginationItem>
							<PaginationEllipsis />
						</PaginationItem>
					{:else}
						<PaginationItem>
							<PaginationLink {page} isActive={currentPage === page.value}>
								{page.value}
							</PaginationLink>
						</PaginationItem>
					{/if}
				{/each}
				<PaginationItem>
					<PaginationNextButton>
						<span class="hidden sm:block">Další</span>
						<ChevronRightIcon class="size-4" />
					</PaginationNextButton>
				</PaginationItem>
			</PaginationContent>
		{/snippet}
	</Pagination>
</div>