<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export interface CounterProps extends HTMLAttributes<HTMLDivElement> {
		value: number;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	let { value, class: className, ...restProps }: CounterProps = $props();
</script>

<div
	{...restProps}
	class={cn('flex h-[50px] flex-row-reverse justify-center overflow-hidden', className)}
>
	{#each Array(Math.floor(Math.log10(value || 1) + 1)) as _, index (index)}
		{@const reduced = Math.floor(value / 10 ** index)}
		{@const digit = reduced % 10}
		<div
			style="margin-top: -{(9 - digit) * 50}px"
			class={cn(
				'flex flex-col font-mono text-3xl leading-[50px] transition-all duration-75 ease-linear',
				(index + 1) % 4 === 0 && 'mr-4'
			)}
		>
			<span>9</span>
			<span>8</span>
			<span>7</span>
			<span>6</span>
			<span>5</span>
			<span>4</span>
			<span>3</span>
			<span>2</span>
			<span>1</span>
			<span>0</span>
		</div>
	{/each}
</div>
