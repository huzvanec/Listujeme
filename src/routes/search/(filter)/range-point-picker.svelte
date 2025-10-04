<script lang="ts" module>
	import type { IssueInfo } from '$types/newspaper';

	export interface RangePoint {
		year: string;
		period: string;
	}

	export interface RangePointPickerProps {
		point: RangePoint;
		issues: IssueInfo[];
	}
</script>

<script lang="ts">
	import { translatePeriod } from '$lib/utils';
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectGroupHeading,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';

	let { point: parentPoint = $bindable(), issues }: RangePointPickerProps = $props();

	let point = $state<RangePoint>(parentPoint);

	$effect(() => {
		console.log('upd');
		if (
			!issues
				.filter((issue) => issue.year === +point.year)
				.some((issue) => issue.period === point.period)
		)
			point.period = issues.find((issue) => issue.year === +point.year)!.period;
		parentPoint = { ...point };
	});
</script>

<Select type="single" bind:value={point.year}>
	<SelectTrigger>
		{point.year}
	</SelectTrigger>
	<SelectContent>
		<SelectGroup>
			<SelectGroupHeading>Rok</SelectGroupHeading>
			{#each new Set(issues
					.map((issue) => issue.year)
					.sort((year1, year2) => year1 - year2)) as year}
				<SelectItem value={year.toString()} label={year.toString()}>
					{year}
				</SelectItem>
			{/each}
		</SelectGroup>
	</SelectContent>
</Select>
<Select type="single" bind:value={point.period}>
	<SelectTrigger>
		{translatePeriod(point.period)}
	</SelectTrigger>
	<SelectContent>
		<SelectGroup>
			<SelectGroupHeading>Období</SelectGroupHeading>
			{#each issues
				.filter((issue) => issue.year === +point.year)
				.map((issue) => issue.period) as period}
				{@const periodLabel = translatePeriod(period)}
				<SelectItem value={period} label={periodLabel}>
					{periodLabel}
				</SelectItem>
			{/each}
		</SelectGroup>
	</SelectContent>
</Select>
