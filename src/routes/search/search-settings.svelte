<script lang="ts" module>
	import type { DialogTriggerProps } from 'bits-ui';

	export interface SearchSettingsProps extends DialogTriggerProps {
		settings: SearchSettings;
	}

	export interface SearchSettings {
		caseSensitive: boolean;
		diacriticSensitive: boolean;
		trimQuery: boolean;
	}
</script>

<script lang="ts">
	import { CheckIcon } from 'lucide-svelte';
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

	let { settings, ...restProps }: SearchSettingsProps = $props();
</script>

<Dialog>
	<Tooltip>
		<TooltipTrigger>
			<DialogTrigger {...restProps} />
		</TooltipTrigger>
		<TooltipContent side="bottom">Nastavit pravidla vyhledávání</TooltipContent>
	</Tooltip>
	<DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
		<DialogHeader>
			<DialogTitle>Nastavení vyhledávání</DialogTitle>
			<DialogDescription>Zde můžete měnit pravidla vyhledávání.</DialogDescription>
		</DialogHeader>
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-2">
				<Checkbox id="case" aria-labelledby="case-label" bind:checked={settings.caseSensitive} />
				<Label id="case-label" for="case">Rozlišovat velká a malá písmena</Label>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					id="diacritic"
					aria-labelledby="diacritic-label"
					bind:checked={settings.diacriticSensitive}
				/>
				<Label id="diacritic-label" for="diacritic">Rozlišovat diakritiku</Label>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox id="trim" aria-labelledby="trim-label" bind:checked={settings.trimQuery} />
				<Label id="trim-label" for="trim">Odstraňovat okolní prázné znaky</Label>
			</div>
		</div>
		<DialogFooter>
			<DialogClose tabindex={-1}>
				<Button><CheckIcon /> Hotovo</Button>
			</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
