<script lang="ts">
	const { data } = $props();
</script>

<main class="grid place-items-center text-4xl gap-2">
	{#if data.exhausted}
		<h1>That's it for today</h1>
	{:else}
		<p>
			{data.emojis}
		</p>
		{#each data.options as option}
			<div>{option}</div>
		{/each}
		<details>
			<summary>Reveal answer</summary>
			{data.title}
		</details>
		<p>Remaining {10 - data.today_count}</p>
	{/if}
</main>
