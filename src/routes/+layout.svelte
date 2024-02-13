<script>
	import { onMount } from 'svelte';
	import '../app.css';

	onMount(() => {
		document.body.setAttribute('data-kit-started', '');
	});

	export let data;
</script>

<slot />
