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

	const votes_simbol = $derived((data.upvotes ?? 0) < 0 ? '⬇️' : '⬆️');

	const parsed_time = $derived(parse_time());
</script>

<main class="grid place-items-center gap-2 p-4">
	{#if data.user}
		<div class="justify-self-end grid grid-cols-[1fr_auto] grid-rows-2 gap-x-4">
			{data.user.username}
			{#if data.user.picture}
				<img
					class="size-16 rounded-full row-span-2"
					src={data.user.picture}
					alt={data.user.username}
				/>
			{/if}
			<a class="justify-self-end" href="/logout">Logout</a>
		</div>
	{:else}
		<a class="justify-self-end" href="/login/google">Login</a>
	{/if}
	{#if data.exhausted}
		<h1 class="text-4xl">That's it for today</h1>
		<p>Come back in: <code>{parsed_time}</code> to play again</p>
	{:else}
		<p class="text-6xl">
			{data.emojis}
		</p>
		<p>
			{votes_simbol}
			{Math.abs(data.upvotes)}
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
			{#if data.user}
				<form class="grid place-items-center" use:enhance method="post" action="?/vote">
					<input type="hidden" value={data.movie_id} name="movie_id" />
					<input type="hidden" value={form.answer_id} name="answer_id" />
					<div>
						<button
							disabled={data.old_upvote === -1}
							class="disabled:opacity-35"
							name="delta"
							value="-1">⬇️</button
						>
						<button
							disabled={data.old_upvote === 1}
							class="disabled:opacity-35"
							name="delta"
							value="1">⬆️</button
						>
					</div>
					{#if form.upvote_error}
						<p>Cannot vote this time</p>
					{/if}
				</form>
			{/if}
			<form use:enhance method="post" action="?/next">
				This is correct!
				<button>Next</button>
			</form>
		{/if}
	{/if}
</main>
