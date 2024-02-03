<script lang="ts">
	import { enhance, applyAction } from '$app/forms';

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

<div class="grid place-items-center gap-2 p-4">
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
</div>
<main class="grid grid-cols-1 grid-rows-1 place-items-center">
	<div class="shadows col-start-1 col-end-1 row-start-1 row-end-1"></div>
	<article class="card grid place-items-center gap-2 p-4">
		{#if data.exhausted}
			<h1 class="text-4xl">That's it for today</h1>
			<p>Come back in: <code>{parsed_time}</code> to play again</p>
		{:else}
			<p class="fluid-font">
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
							class="fluid-font-small"
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
				<form
					use:enhance={() => {
						return ({ result, update }) => {
							async function apply_and_update() {
								await update();
								await applyAction(result);
							}
							if (document.startViewTransition) {
								document.startViewTransition(apply_and_update);
								return;
							}
							apply_and_update();
						};
					}}
					method="post"
					action="?/next"
				>
					This is correct!
					<button>Next</button>
				</form>
			{/if}
		{/if}
	</article>
</main>

<style>
	.card,
	.shadows {
		grid-column: 1/-1;
		grid-row: 1/-1;
		display: grid;
		width: min(90%, 30rem);
		border-radius: 1rem;
		aspect-ratio: 9/16;
	}
	.card {
		place-items: center;
		view-transition-name: cards;
		background-color: white;
		box-shadow: 0 2px 0.5rem 0 rgb(0 0 0 / 0.5);
	}
	.shadows {
		view-transition-name: cards-shadow;
		box-shadow:
			-2px 4px 0 -1px rgb(255 255 255),
			-2px 4px 0.5rem -1px rgb(0 0 0 / 0.5),
			2px 8px 0 -2px rgb(255 255 255),
			2px 8px 0.5rem -2px rgb(0 0 0 / 0.5),
			-1px 12px 0 -3px rgb(255 255 255),
			-1px 12px 0.5rem -3px rgb(0 0 0 / 0.5);
	}
	.fluid-font {
		font-size: clamp(1.728rem, 2rem + 2.0899vi, 2.9297rem);
	}
	.fluid-font-small {
		font-size: clamp(1rem, 0.8261rem + 0.8696vi, 1.5rem);
	}

	:root::view-transition-old(cards) {
		animation: drop 1s;
		transform-origin: 60% 120%;
		z-index: 2;
	}

	:root::view-transition-new(cards),
	:root::view-transition-new(cards-shadow) {
		animation: none;
	}

	@keyframes drop {
		80% {
			transform: rotatez(-10deg) translateY(170%);
			opacity: 1;
		}

		100% {
			transform: rotatez(-30deg) translateY(200%);
			opacity: 0;
		}
	}

	@keyframes slide {
		80% {
			transform: rotatez(-125deg);
			opacity: 1;
		}

		100% {
			transform: rotatez(-125deg);
			opacity: 0;
		}
	}
</style>
