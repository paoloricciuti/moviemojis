<svelte:options runes={false} />

<script lang="ts">
	import { page } from '$app/stores';
</script>

<ul>
	{#each $page.error?.issues || [] as issue}
		<li>{issue.message}{issue.path?.map((item) => item.key).join('>')}</li>
	{/each}
</ul>
