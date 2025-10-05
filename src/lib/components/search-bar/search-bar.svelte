<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export interface SearchBarProps extends HTMLAttributes<HTMLDivElement> {
		value?: any;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { TextSearchIcon } from '@lucide/svelte';

	let { class: className, value = $bindable(), ...restProps }: SearchBarProps = $props();

	let ref = $state<HTMLInputElement | null>(null);

	const search = async (): Promise<boolean> => {
		if (!ref) return false;
		const query = ref.value;
		if (query.trim() === '') return false;
		await goto(`/search?q=${encodeURIComponent(query)}`);
		return true;
	};
</script>

<div {...restProps} class={cn('flex items-center gap-2', className)}>
	<Input
		bind:ref
		bind:value
		placeholder="Prohledat Floriány..."
		class="rounded-r-none"
		onkeydown={(e) => {
			if (e.key === 'Enter') search();
		}}
	/>
	<Button class="rounded-l-none px-[6%]" onclick={search}>
		<TextSearchIcon /> Hledat
	</Button>
</div>
