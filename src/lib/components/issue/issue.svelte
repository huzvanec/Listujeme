<script lang="ts" module>
	import type { IssueInfo } from '$types/newspaper';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface IssueProps extends HTMLAttributes<HTMLDivElement> {
		info: IssueInfo;
	}
</script>

<script lang="ts">
	import { DownloadIcon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { api, cn, translatePeriod } from '$lib/utils';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	const { info, class: className, ...restProps }: IssueProps = $props();

	const apiLink = $derived<string>(`${api}/issues/${info.name}`);
</script>

<Card {...restProps} class={cn('flex size-full flex-col gap-4 text-nowrap p-4', className)}>
	<div class="flex aspect-416/589 items-center justify-center">
		<a class="w-full" target="_blank" href="{apiLink}/view">
			<img
				class="w-full rounded border transition duration-300 hover:scale-[103%]"
				fetchpriority="high"
				src="{apiLink}/preview"
				alt={info.name}
			/>
		</a>
	</div>
	<div class="flex w-full items-center gap-2">
		<div class="flex flex-1 flex-col">
			<p class="text-lg font-bold">{info.year} {translatePeriod(info.period)}</p>
			<Tooltip>
				<TooltipTrigger class="w-min cursor-text select-text text-left">
					{info.typesetter ?? 'neznámý sazeč'}
				</TooltipTrigger>
				<TooltipContent side="bottom">Sazeč čísla</TooltipContent>
			</Tooltip>
		</div>
		<Tooltip>
			<TooltipTrigger>
				<Button size="icon" variant="ghost" href="{apiLink}/download" target="_blank">
					<DownloadIcon />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">Stáhnout PDF</TooltipContent>
		</Tooltip>
	</div>
</Card>
