<script lang="ts">
	import '@fontsource-variable/source-sans-3';
	import '@fontsource-variable/playfair-display';
	import './layout.css';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import { get_user, login_with_google, logout } from '$lib/auth.remote';

	let { children } = $props();

	const user = $derived(await get_user());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="theater">
	<!-- Film strip borders -->
	<div class="film-strip left"></div>
	<div class="film-strip right"></div>

	<!-- Curtain top -->
	<div class="curtain-valance"></div>

	<!-- Projector beam -->
	<div class="projector-beam"></div>

	<header>
		<a href={resolve('/')} class="marquee-logo">
			<div class="marquee-frame">
				<div class="bulbs top">
					{#each Array(12), i (i)}
						<span class="bulb" style="--delay: {i * 0.1}s"></span>
					{/each}
				</div>
				<div class="bulbs bottom">
					{#each Array(12), i (i)}
						<span class="bulb" style="--delay: {i * 0.1 + 0.05}s"></span>
					{/each}
				</div>
				<div class="bulbs left-side">
					{#each Array(3), i (i)}
						<span class="bulb" style="--delay: {i * 0.1 + 0.1}s"></span>
					{/each}
				</div>
				<div class="bulbs right-side">
					{#each Array(3), i (i)}
						<span class="bulb" style="--delay: {i * 0.1 + 0.15}s"></span>
					{/each}
				</div>
				<span class="marquee-text">MovieMojis</span>
			</div>
		</a>

		<nav class="user-nav">
			{#if user}
				<div class="ticket-stub">
					<div class="ticket-perforation"></div>
					<span class="ticket-text">ADMIT ONE</span>
					<span class="ticket-name">{user.user.name}</span>
				</div>
				<form {...logout}>
					<button class="btn-exit">
						<span>EXIT</span>
						<svg
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
						</svg>
					</button>
				</form>
			{:else}
				<form {...login_with_google}>
					<button class="btn-ticket">
						<span class="btn-ticket-text">🎟️ Get Your Ticket</span>
					</button>
				</form>
			{/if}
		</nav>
	</header>

	<main>
		<div class="screen-frame">
			<div class="screen">
				{@render children()}
			</div>
		</div>
	</main>

	<footer>
		<div class="footer-reel">
			<span class="reel-hole"></span>
			<span class="reel-hole"></span>
			<span class="footer-text">Now Showing • Guess the Movie from Emojis</span>
			<span class="reel-hole"></span>
			<span class="reel-hole"></span>
		</div>
	</footer>
</div>

<style>
	.theater {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		background: radial-gradient(ellipse at 50% 0%, #1a0a0a 0%, var(--color-black) 70%);
	}

	/* Film strip borders */
	.film-strip {
		position: fixed;
		top: 0;
		bottom: 0;
		width: 35px;
		background: var(--color-film);
		z-index: 100;

		&::before,
		&::after {
			content: '';
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			width: 20px;
			height: 100%;
			background-image: repeating-linear-gradient(
				to bottom,
				transparent 0px,
				transparent 8px,
				#333 8px,
				#333 12px,
				transparent 12px,
				transparent 28px
			);
		}

		&.left {
			left: 0;
			border-right: 2px solid #333;
		}

		&.right {
			right: 0;
			border-left: 2px solid #333;
		}
	}

	/* Curtain valance */
	.curtain-valance {
		position: fixed;
		top: 0;
		left: 35px;
		right: 35px;
		height: 20px;
		background: linear-gradient(
			180deg,
			var(--color-velvet-dark) 0%,
			var(--color-velvet) 50%,
			var(--color-velvet-dark) 100%
		);
		z-index: 50;

		&::after {
			content: '';
			position: absolute;
			bottom: -15px;
			left: 0;
			right: 0;
			height: 15px;
			background:
				repeating-linear-gradient(
					90deg,
					transparent 0px,
					transparent 20px,
					var(--color-velvet-dark) 20px,
					var(--color-velvet-dark) 22px
				),
				linear-gradient(180deg, var(--color-velvet) 0%, transparent 100%);
			clip-path: polygon(
				0% 0%,
				5% 100%,
				10% 0%,
				15% 100%,
				20% 0%,
				25% 100%,
				30% 0%,
				35% 100%,
				40% 0%,
				45% 100%,
				50% 0%,
				55% 100%,
				60% 0%,
				65% 100%,
				70% 0%,
				75% 100%,
				80% 0%,
				85% 100%,
				90% 0%,
				95% 100%,
				100% 0%
			);
		}
	}

	/* Projector beam */
	.projector-beam {
		position: fixed;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 300px;
		height: 100%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 40%);
		clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%);
		pointer-events: none;
		z-index: 1;
	}

	header {
		position: relative;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2.5rem 4rem;
		margin-left: 35px;
		margin-right: 35px;
		margin-top: 35px;
	}

	/* Marquee logo */
	.marquee-logo {
		text-decoration: none;
		color: inherit;
	}

	.marquee-frame {
		position: relative;
		background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
		padding: 0.75rem 2rem;
		border: 3px solid var(--color-gold);
		box-shadow:
			inset 0 2px 10px rgba(0, 0, 0, 0.5),
			0 0 20px rgba(212, 175, 55, 0.3);
	}

	.bulbs {
		position: absolute;
		display: flex;

		&.top {
			top: -8px;
			left: 10px;
			right: 10px;
			justify-content: space-between;
		}

		&.bottom {
			bottom: -8px;
			left: 10px;
			right: 10px;
			justify-content: space-between;
		}

		&.left-side {
			left: -8px;
			top: 10px;
			bottom: 10px;
			flex-direction: column;
			justify-content: space-between;
		}

		&.right-side {
			right: -8px;
			top: 10px;
			bottom: 10px;
			flex-direction: column;
			justify-content: space-between;
		}
	}

	.bulb {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-gold-light);
		box-shadow: 0 0 8px var(--color-gold-light);
		animation: bulb-flicker 1s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	@keyframes bulb-flicker {
		0%,
		100% {
			background: var(--color-gold-light);
			box-shadow:
				0 0 8px var(--color-gold-light),
				0 0 15px var(--color-gold);
		}
		50% {
			background: var(--color-gold-dark);
			box-shadow: 0 0 3px var(--color-gold-dark);
		}
	}

	.marquee-text {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 900;
		letter-spacing: 0.05em;
		color: var(--color-gold-light);
		text-shadow:
			0 0 10px var(--color-gold),
			0 2px 0 var(--color-gold-dark);
	}

	.user-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Ticket stub */
	.ticket-stub {
		position: relative;
		background: var(--color-gold);
		padding: 0.5rem 1.5rem;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		align-items: center;

		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			width: 12px;
			height: 12px;
			background: var(--color-black);
			border-radius: 50%;
			transform: translateY(-50%);
		}

		&::before {
			left: -6px;
		}
		&::after {
			right: -6px;
		}
	}

	.ticket-perforation {
		position: absolute;
		left: 15px;
		top: 5px;
		bottom: 5px;
		width: 1px;
		background: repeating-linear-gradient(
			to bottom,
			var(--color-gold-dark) 0px,
			var(--color-gold-dark) 3px,
			transparent 3px,
			transparent 6px
		);
	}

	.ticket-text {
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		color: var(--color-velvet-dark);
	}

	.ticket-name {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-black);
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.btn-exit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: transparent;
		border: 2px solid var(--color-velvet-light);
		border-radius: 4px;
		color: var(--color-velvet-light);
		font-family: var(--font-body);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: var(--color-velvet-dark);
			border-color: var(--color-velvet);
			color: var(--color-cream);
		}
	}

	.btn-ticket {
		position: relative;
		background: linear-gradient(180deg, var(--color-velvet) 0%, var(--color-velvet-dark) 100%);
		border: 3px solid var(--color-gold);
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);

		&:hover {
			transform: translateY(-2px);
			box-shadow:
				0 6px 20px rgba(0, 0, 0, 0.5),
				0 0 20px rgba(212, 175, 55, 0.3);
		}
	}

	.btn-ticket-text {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-gold-light);
		letter-spacing: 0.02em;
	}

	main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		margin-left: 35px;
		margin-right: 35px;
		position: relative;
		z-index: 5;
	}

	.screen-frame {
		width: 100%;
		max-width: 700px;
		background: #222;
		padding: 1rem;
		border-radius: 8px;
		box-shadow:
			inset 0 0 50px rgba(0, 0, 0, 0.8),
			0 0 100px rgba(255, 255, 255, 0.05);
	}

	.screen {
		background: var(--color-screen);
		border-radius: 4px;
		padding: 2rem;
		min-height: 400px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.5);
		position: relative;

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.02) 0%,
				transparent 5%,
				transparent 95%,
				rgba(0, 0, 0, 0.1) 100%
			);
			pointer-events: none;
			border-radius: 4px;
		}
	}

	footer {
		position: relative;
		z-index: 10;
		padding: 1.5rem;
		margin-left: 35px;
		margin-right: 35px;
		margin-bottom: 35px;
	}

	.footer-reel {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		background: var(--color-film);
		padding: 0.75rem 2rem;
		border-radius: 4px;
	}

	.reel-hole {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #333;
		border: 2px solid #444;
	}

	.footer-text {
		font-size: 0.85rem;
		color: #888;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	@media (max-width: 768px) {
		.film-strip {
			width: 20px;
		}

		header {
			flex-direction: column;
			gap: 1.5rem;
			padding: 2rem 1.5rem;
			margin-left: 20px;
			margin-right: 20px;
		}

		.marquee-frame {
			padding: 0.5rem 1.25rem;
		}

		.marquee-text {
			font-size: 1.5rem;
		}

		.bulbs.top,
		.bulbs.bottom {
			& .bulb:nth-child(n + 8) {
				display: none;
			}
		}

		main {
			margin-left: 20px;
			margin-right: 20px;
			padding: 1rem;
		}

		.screen-frame {
			padding: 0.5rem;
		}

		.screen {
			padding: 1rem;
			min-height: 300px;
		}

		footer {
			margin-left: 20px;
			margin-right: 20px;
			margin-bottom: 20px;
		}
	}
</style>
