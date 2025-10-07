<script lang="ts" module>
	import type { IssueInfo } from '$types/newspaper';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ViewMode } from '../../../routes/+page.svelte';

	export interface IssueProps extends HTMLAttributes<HTMLDivElement> {
		info: IssueInfo;
		mode: ViewMode;
	}
</script>

<script lang="ts">
	import { DownloadIcon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { api, cn, translatePeriod } from '$lib/utils';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	const { info, mode, class: className, ...restProps }: IssueProps = $props();

	const apiLink = $derived<string>(`${api}/issues/${info.name}`);
</script>

{#snippet download()}
	<Tooltip>
		<TooltipTrigger class="z-20">
			<Button size="icon" variant="ghost" href="{apiLink}/download" target="_blank">
				<DownloadIcon />
			</Button>
		</TooltipTrigger>
		<TooltipContent side="bottom">Stáhnout PDF</TooltipContent>
	</Tooltip>
{/snippet}

<Card {...restProps} class={cn(
	'relative flex size-full gap-4 text-nowrap p-4',
	 mode === 'grid' ? 'flex-col' : 'flex-row h-20',
	 className
	 )}>
	{#if mode === 'list'}
		<a class="absolute left-0 top-0 size-full" target="_blank" href="{apiLink}/view" aria-label="Prohlédnout PDF"></a>
	{/if}
	<div class="h-full flex aspect-416/589 items-center justify-center">
		<a class="w-full" target="_blank" href="{apiLink}/view">
			<img
				class={cn(
					"w-full rounded border transition duration-300",
					mode === 'grid' && 'hover:scale-[103%]'
				)}
				fetchpriority="high"
				src="{apiLink}/preview"
				alt={info.name}
			/>
		</a>
	</div>
	<div class="flex w-full items-center gap-2">
		<div class={cn(
			"flex flex-1 flex-col",
			mode === 'list' && 'sm:flex-row sm:items-center'
		)}>
			<p class="text-lg font-bold">{info.year} {translatePeriod(info.period)}</p>
			<Tooltip>
				<TooltipTrigger class={cn(
					'w-min cursor-text select-text text-left z-20',
					mode === 'list' && 'sm:absolute sm:left-1/2'
				)}>
					{info.typesetter ?? 'neznámý sazeč'}
				</TooltipTrigger>
				<TooltipContent side="bottom">Sazeč čísla</TooltipContent>
			</Tooltip>
		</div>
		{#if mode === 'grid'}
			{@render download()}
		{/if}
	</div>
	{#if mode === 'list'}
		{@render download()}
	{/if}
</Card>