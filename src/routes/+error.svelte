<script lang="ts">
	import { page } from '$app/state';

	const status: number = page.status;
	const message: string = page.error!.message;
</script>

<div class="flex h-svh w-full flex-col items-center justify-center gap-10 text-center">
	<h1 class="text-7xl font-bold text-red-500">Něco se rozbilo! 😥</h1>
	<h2 class="rounded-xl bg-black p-4 font-mono text-4xl text-white">
		{status}: {message}
	</h2>
</div>
