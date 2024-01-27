<script lang="ts">
	const { data } = $props();
</script>

Guess what's this film: {data.emoji}
<details>
	<summary>Open</summary>
	{data.title}
</details>
{#each data.options as option}
	<div>{option}</div>
{/each}
