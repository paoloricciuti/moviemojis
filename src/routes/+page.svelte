<script lang="ts">
	import { enhance } from '$app/forms';

	const { data, form } = $props();

	let elapsed = $state(0);

	function parse_time() {
		if (!data.exhausted) return;
		const unrounded_hrs = (data.come_back_in - elapsed) / 60 / 60;
		const hrs = Math.floor(unrounded_hrs);
		const unrounded_min = unrounded_hrs - hrs;
		const min = Math.floor(unrounded_min * 60);
		const unrounded_sec = unrounded_min * 60 - min;
		const sec = Math.floor(unrounded_sec * 60);
		return Intl.DateTimeFormat('en', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
			hourCycle: 'h24',
		}).format(new Date(0, 0, 0, hrs, min, sec));
	}

	$effect(() => {
		if (data.exhausted) {
			const interval = setInterval(() => {
				elapsed++;
			}, 1000);
			return () => {
				clearInterval(interval);
			};
		}
	});

	const parsed_time = $derived(parse_time());
</script>

<main class="grid place-items-center gap-2">
	{#if data.exhausted}
		<h1 class="text-4xl">That's it for today</h1>
		<p>Come back in: <code>{parsed_time}</code> to play again</p>
	{:else}
		<p class="text-6xl">
			{data.emojis}
		</p>
		<form class="grid text-3xl" use:enhance method="post" action="?/guess">
			<input type="hidden" value={data.correct_id} name="correct_id" />
			<fieldset class="grid" disabled={form?.correct}>
				{#each data.options as option}
					<button
						class:bg-green-500={form?.correct && form.answer_id === option.id.toString()}
						class:bg-red-500={form && !form.correct && form.answer_id === option.id.toString()}
						name="answer_id"
						value={option.id}>{option.title}</button
					>
				{/each}
			</fieldset>
		</form>
		<p>Remaining {10 - data.today_count}</p>
		{#if form?.correct}
			<form use:enhance method="post" action="?/next">
				This is correct!
				<button>Next</button>
			</form>
		{/if}
	{/if}
</main>
