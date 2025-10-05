<script lang="ts" module>
	import type { DialogTriggerProps } from 'bits-ui';
	import type { IssueInfo } from '$types/newspaper';

	export type SearchFilterType = 'range' | 'individual';

	export interface SearchFilter {
		type: SearchFilterType;
		issues: IssueInfo[];
	}

	export interface IssueFilterProps extends DialogTriggerProps {
		filter: SearchFilter;
		issues: IssueInfo[];
	}
</script>

<script lang="ts">
	import { CheckIcon, CopyCheckIcon, CopyXIcon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { cn, comparePeriods, translatePeriod } from '$lib/utils';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import RangePointPicker, { type RangePoint } from './range-point-picker.svelte';

	let { filter = $bindable(), issues: issuesUnsorted, ...restProps }: IssueFilterProps = $props();

	const issues = $derived<IssueInfo[]>(
		[...issuesUnsorted].sort((issue1, issue2) => {
			const year1 = issue1.year;
			const year2 = issue2.year;
			if (year1 !== year2) return year2 - year1;
			return comparePeriods(issue1.period, issue2.period);
		})
	);
	let searchAll = $state<boolean>(true);

	const allIndividual = <T = boolean, >(value: T): Record<string, T> => {
		return issues.reduce(
			(acc, issue) => {
				acc[issue.name] = value;
				return acc;
			},
			{} as Record<string, T>
		);
	};

	let individual = $state<Record<string, boolean>>(allIndividual(true));

	// svelte-ignore state_referenced_locally
	let rangeFrom = $state<RangePoint>({
		year: issues[issues.length - 1].year.toString(),
		period: issues.find((issue) => issue.year === issues[issues.length - 1].year)!.period
	});

	// svelte-ignore state_referenced_locally
	let rangeTo = $state<RangePoint>({
		year: issues[0].year.toString(),
		period: issues.findLast((issue) => issue.year === issues[0].year)!.period
	});

	let rangeError = $state<boolean>(false);

	$effect(() => {
		if (searchAll) {
			filter.issues = issues;
			return;
		}
		switch (filter.type) {
			case 'individual':
				filter.issues = issues.filter((issue) => individual[issue.name]);
				break;
			case 'range':
				const fromYear: number = +rangeFrom.year;
				const toYear: number = +rangeTo.year;
				if (fromYear > toYear) {
					rangeError = true;
					break;
				}
				const fromPeriod: string = rangeFrom.period;
				const toPeriod: string = rangeTo.period;
				if (fromYear === toYear && comparePeriods(fromPeriod, toPeriod) > 0) {
					rangeError = true;
					break;
				}
				rangeError = false;
				filter.issues = issues.filter((issue) => {
					const year: number = issue.year;
					if (year < fromYear) return false;
					if (year > toYear) return false;
					if (year === fromYear) return comparePeriods(fromPeriod, issue.period) <= 0;
					if (year === toYear) return comparePeriods(toPeriod, issue.period) >= 0;
					return true;
				});
				break;
		}
	});
</script>

<Dialog>
	<Tooltip>
		<TooltipTrigger>
			<DialogTrigger {...restProps} />
		</TooltipTrigger>
		<TooltipContent side="bottom">Filtrovat čísla zpravodaje</TooltipContent>
	</Tooltip>
	<DialogContent class="min-w-[50svw]" onOpenAutoFocus={(e) => e.preventDefault()}>
		<DialogHeader>
			<DialogTitle>Filtrování čísel zpravodaje</DialogTitle>
			<DialogDescription>
				Zde můžete vybrat, která čísla zpravodaje budou prohledávána.
			</DialogDescription>
		</DialogHeader>
		<div class="flex items-center gap-2">
			<Checkbox id="search-all" aria-labelledby="search-all-label" bind:checked={searchAll} />
			<Label id="search-all-label" for="search-all">Prohledávat všechna čísla</Label>
		</div>
		<div class={cn('w-full transition-opacity', searchAll && 'pointer-events-none opacity-30')}>
			<Tabs bind:value={filter.type}>
				<TabsList class="mb-2 w-full *:flex-1">
					<TabsTrigger value="range">Rozsahový filtr</TabsTrigger>
					<TabsTrigger value="individual">Výběrový filtr</TabsTrigger>
				</TabsList>
				<TabsContent
					value="range"
					class={cn(
						'h-[40svh] flex-col gap-6 transition-colors data-[state=active]:flex',
						rangeError && 'text-red-500'
					)}
				>
					<div class="flex flex-col gap-2">
						Od čísla (včetně)
						<div class="flex w-full gap-2">
							<RangePointPicker {issues} bind:point={rangeFrom} />
						</div>
					</div>
					<div class="flex flex-col gap-2">
						Do čísla (včetně)
						<div class="flex w-full gap-2">
							<RangePointPicker {issues} bind:point={rangeTo} />
						</div>
					</div>
					{#if rangeError}
						<p class="font-bold">
							Chybné pořadí: Počáteční číslo zpravodaje musí časově předcházet konečné číslo.
						</p>
					{/if}
				</TabsContent>
				<TabsContent value="individual" class="flex-col gap-4 data-[state=active]:flex">
					<div class="flex items-center justify-between">
						<Button variant="outline" onclick={() => (individual = allIndividual(true))}>
							<CopyCheckIcon />
							Označit vše
						</Button>
						<Button variant="outline" onclick={() => (individual = allIndividual(false))}>
							<CopyXIcon />
							Zrušit výběr
						</Button>
					</div>
					<ScrollArea type="always" class="h-[40svh] pr-4">
						<div class="flex flex-col gap-2">
							{#each issues as issue, index (issue.name)}
								{#if issues[index - 1]?.year !== issue.year}
									<h2 class="sticky top-0 z-10 rounded bg-secondary px-2 text-lg font-bold">
										{issue.year}
									</h2>
								{/if}
								<div class="mx-2 flex items-center gap-2">
									<Checkbox
										id={issue.name}
										aria-labelledby="{issue.name}-label"
										bind:checked={individual[issue.name]}
									/>
									<Label id="{issue.name}-label" for={issue.name}>
										{translatePeriod(issue.period)}
									</Label>
								</div>
							{/each}
						</div>
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</div>
		<DialogFooter>
			<DialogClose tabindex={-1}>
				<Button>
					<CheckIcon />
					Hotovo
				</Button>
			</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
