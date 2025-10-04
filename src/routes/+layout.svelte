<script lang="ts">
	import '../app.css';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />

<TooltipProvider>
	{@render children()}
</TooltipProvider>
