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

	export type ViewMode = 'grid' | 'list';
	const defaultViewMode: ViewMode = 'grid';
</script>

<script lang="ts">
	import { Issue } from '$lib/components/issue';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { CalendarArrowDownIcon, CalendarArrowUpIcon, Grid2x2Icon, ListIcon } from '@lucide/svelte';
	import { ModeSwitch } from '$lib/components/mode-switch/index.js';
	import { SearchBar } from '$lib/components/search-bar';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import { TooltipTrigger, Tooltip, TooltipContent } from '$lib/components/ui/tooltip';

	const { data } = $props();

	let sorting = $state<'ascending' | 'descending'>('descending');

	const groups = $derived<IssueGroup[]>(groupByYear(data.issues, sorting === 'descending'));

	const nextSorting = () => {
		sorting = sorting === 'descending' ? 'ascending' : 'descending';
	};

	let viewModeUnsafe = $state<ViewMode | undefined>(defaultViewMode);
	let viewMode = $state<ViewMode>(defaultViewMode);

	$effect(() => {
		if (!viewModeUnsafe) {
			viewModeUnsafe = viewMode;
			return;
		}
		viewMode = viewModeUnsafe;
	});
</script>

<svelte:head>
	<title>Listujeme Floriány</title>
</svelte:head>

<div class="flex h-full flex-col gap-4 overflow-hidden p-4 pr-0">
	<div class="mr-4 flex flex-col gap-4">
		<div class="flex items-center">
			<h1 class="sm:text-2xl font-bold text-base">Florián: Zpravodaj městyse Lázně Toušeň</h1>
			<ModeSwitch class="ml-auto" />
		</div>
		<div class="flex gap-4 max-sm:flex-col-reverse">
			<div class="flex flex-row gap-4 justify-between">
				<Button variant="outline" class="flex min-w-40 justify-start text-left" onclick={nextSorting}>
					{#if sorting === 'descending'}
						<CalendarArrowDownIcon />
						Od nejnovějšího
					{:else}
						<CalendarArrowUpIcon />
						Od nejstaršího
					{/if}
				</Button>
				<ToggleGroup type="single" class="outline-1" bind:value={viewModeUnsafe}>
					<Tooltip>
						<TooltipTrigger>
							<ToggleGroupItem class="!rounded-l-sm !rounded-r-none" value="grid"
															 aria-label="Přepnout na mřížkové zobrazení">
								<Grid2x2Icon />
							</ToggleGroupItem>
						</TooltipTrigger>
						<TooltipContent>
							Přepnout na mřížkové zobrazení
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger>
							<ToggleGroupItem class="!rounded-r-sm !rounded-l-none" value="list"
															 aria-label="Přepnout na seznamové zobrazení">
								<ListIcon />
							</ToggleGroupItem>
						</TooltipTrigger>
						<TooltipContent>
							Přepnout na seznamové zobrazení
						</TooltipContent>
					</Tooltip>
				</ToggleGroup>
			</div>
			<Separator orientation="vertical" class="max-sm:hidden" />
			<SearchBar class="flex-1" />
		</div>
	</div>
	<ScrollArea class="size-full pr-4" type="always">
		{#each groups as group (group[0].year)}
			<h2 class="sticky top-0 z-50 rounded bg-secondary px-8 py-2 text-xl font-bold">
				{group[0].year}
			</h2>
			<div class={cn(
				'flex items-center max-md:justify-center gap-4 p-4 w-full',
				viewMode === 'grid' ? 'md:flex-row flex-col-reverse md:flex-wrap' : 'flex-col'
			)}>
				{#each group as issue (issue.name)}
					<Issue class={cn(viewMode === 'grid' && 'w-[290px]')} info={issue} mode={viewMode} />
				{/each}
			</div>
		{/each}
	</ScrollArea>
</div>
