<script lang="ts" module>
	import type { TooltipTriggerProps } from 'bits-ui';

	export interface ModeSwitchProps extends TooltipTriggerProps {
	}
</script>

<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { MoonIcon, SunIcon } from '@lucide/svelte';
	import { mode, setMode } from 'mode-watcher';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	let checked = $derived<boolean>(mode.current === 'light');

	const onChange = (newChecked: boolean) => {
		setMode(newChecked ? 'light' : 'dark');
	};

	const { class: className, ...restProps }: ModeSwitchProps = $props();
</script>

<Tooltip>
	<TooltipTrigger {...restProps} class={className}>
		<Switch class="bg-input!" {checked} onCheckedChange={onChange}>
			<SunIcon
				class="size-4 text-black rotate-0 scale-80 fill-current !transition-all dark:-rotate-180 dark:scale-0"
			/>
			<MoonIcon
				class="size-4 text-black absolute left-0 top-0 rotate-180 scale-0 fill-current !transition-all dark:rotate-0 dark:scale-80"
			/>
		</Switch>
	</TooltipTrigger>
	<TooltipContent>
		Přepnout na {mode.current === 'dark' ? 'světlý' : 'tmavý'} režim
	</TooltipContent>
</Tooltip>
