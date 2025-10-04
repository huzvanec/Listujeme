<script lang="ts" module>
	import type { TooltipTriggerProps } from 'bits-ui';

	export interface ModeSwitchProps extends TooltipTriggerProps {}
</script>

<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { MoonIcon, SunIcon } from 'lucide-svelte';
	import { mode, setMode } from 'mode-watcher';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	let checked = $derived<boolean>($mode === 'light');

	const onChange = (newChecked: boolean) => {
		setMode(newChecked ? 'light' : 'dark');
	};

	const { class: className, ...restProps }: ModeSwitchProps = $props();
</script>

<Tooltip>
	<TooltipTrigger {...restProps} class={className}>
		<Switch class="bg-input!" {checked} onCheckedChange={onChange}>
			<SunIcon
				class="rotate-0 scale-100 fill-current transition-all! dark:-rotate-180 dark:scale-0"
			/>
			<MoonIcon
				class="absolute rotate-180 scale-0 fill-current transition-all! dark:rotate-0 dark:scale-100"
			/>
		</Switch>
	</TooltipTrigger>
	<TooltipContent>
		Přepnout na {$mode === 'dark' ? 'světlý' : 'tmavý'} režim
	</TooltipContent>
</Tooltip>
