<script lang="ts">
	import { get_user } from '$lib/auth.remote';
	import { get_movie, guess_movie, next, vote } from '$lib/movies.remote';

	const user = $derived(await get_user());
	const movie = $derived(await get_movie());

	let elapsed = $state(0);

	function parse_time() {
		if (!movie.exhausted) return;
		const unrounded_hrs = (movie.come_back_in - elapsed) / 60 / 60;
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
			hourCycle: 'h24'
		}).format(new Date(0, 0, 0, hrs, min, sec));
	}

	$effect(() => {
		if (movie.exhausted) {
			const interval = setInterval(() => {
				elapsed++;
			}, 1000);
			return () => {
				clearInterval(interval);
			};
		}
	});

	const votes_symbol = $derived((movie.upvotes ?? 0) < 0 ? '👎' : '👍');
	const parsed_time = $derived(parse_time());
	const remaining_count = $derived(10 - (movie.today_count ?? 0));
</script>

{#if movie.exhausted}
	<div class="intermission">
		<div class="intermission-icon">🎬</div>
		<h1 class="intermission-title">INTERMISSION</h1>
		<div class="intermission-divider">
			<span class="star">★</span>
			<span class="line"></span>
			<span class="star">★</span>
		</div>
		<p class="intermission-text">The show continues in</p>
		<div class="countdown">
			<div class="countdown-display">
				<span class="countdown-time">{parsed_time}</span>
			</div>
		</div>
		<p class="intermission-subtext">Visit the concession stand!</p>
		<div class="popcorn-row">
			<span>🍿</span>
			<span>🥤</span>
			<span>🍫</span>
		</div>
	</div>
{:else}
	<div class="scene">
		<!-- Reel counter -->
		<div class="reel-counter">
			<div class="reel-info">
				<span class="reel-label">REEL</span>
				<span class="reel-number">{movie.today_count ?? 0}/10</span>
			</div>
			<div class="reel-remaining">{remaining_count} left</div>
		</div>

		<form class="clapperboard" {...guess_movie}>
			<!-- Clapper top -->
			<div class="clapper-top">
				<div class="clapper-stripes">
					{#each Array(7), i (i)}
						<div class="stripe" class:white={i % 2 === 0}></div>
					{/each}
				</div>
			</div>

			<!-- Clapper body -->
			<div class="clapper-body">
				<div class="clapper-header">
					<div class="clapper-field">
						<span class="field-label">SCENE</span>
						<span class="field-value">#{movie.today_count ?? 0}</span>
					</div>
					<div class="clapper-field">
						<span class="field-label">RATING</span>
						<span class="field-value">{votes_symbol} {Math.abs(movie.upvotes)}</span>
					</div>
				</div>

				<div class="emoji-stage">
					<div class="stage-curtain left"></div>
					<div class="emoji-spotlight">
						<span class="emojis">{movie.emojis}</span>
					</div>
					<div class="stage-curtain right"></div>
				</div>

				<input
					{...guess_movie.fields.correct_id.as('hidden', movie.correct_id?.toString() ?? '')}
				/>

				<fieldset
					class="options"
					disabled={guess_movie.result?.correct &&
						guess_movie.result.correct_id === movie.correct_id}
				>
					{#each movie.options as option, i (option.id)}
						{@const correct =
							guess_movie.result?.correct && guess_movie.result.answer_id === option.id.toString()}
						{@const incorrect =
							!guess_movie.result?.correct &&
							guess_movie.result?.answer_id === option.id.toString()}
						<button
							class={['option', { correct, incorrect }]}
							style="--i: {i}"
							{...guess_movie.fields.answer_id.as('submit', option.id.toString())}
						>
							<span class="option-number">{i + 1}</span>
							<span class="option-title">{option.title}</span>
							{#if correct}
								<span class="option-result">★</span>
							{:else if incorrect}
								<span class="option-result">✗</span>
							{/if}
						</button>
					{/each}
				</fieldset>
			</div>
		</form>

		{#if guess_movie.result?.correct && guess_movie.result.correct_id === movie.correct_id}
			<div class="credits-roll">
				<div class="credits-header">
					<span class="credits-star">★</span>
					<h2 class="credits-title">CORRECT!</h2>
					<span class="credits-star">★</span>
				</div>

				{#if user}
					<form class="rating-card" {...vote}>
						<p class="rating-prompt">How was this scene?</p>
						<input {...vote.fields.movie_id.as('hidden', movie.movie_id?.toString() ?? '')} />
						<div class="rating-buttons">
							<button
								class="rating-btn thumbs-down"
								class:selected={movie.old_upvote === -1}
								disabled={movie.old_upvote === -1}
								{...vote.fields.delta.as('submit', '-1')}
							>
								<span>👎</span>
							</button>
							<button
								class="rating-btn thumbs-up"
								class:selected={movie.old_upvote === 1}
								disabled={movie.old_upvote === 1}
								{...vote.fields.delta.as('submit', '1')}
							>
								<span>👍</span>
							</button>
						</div>
					</form>
				{/if}

				<form {...next}>
					<button class="next-scene-btn">
						<span class="btn-text">Next Scene</span>
						<span class="btn-icon">▶</span>
					</button>
				</form>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Intermission */
	.intermission {
		text-align: center;
		animation: fade-in 0.6s ease;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.intermission-icon {
		font-size: 4rem;
		margin-bottom: 0.5rem;
		animation: projector-flicker 2s ease-in-out infinite;
	}

	@keyframes projector-flicker {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
		52% {
			opacity: 1;
		}
		54% {
			opacity: 0.9;
		}
	}

	.intermission-title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 8vw, 3.5rem);
		font-weight: 900;
		letter-spacing: 0.15em;
		color: var(--color-gold-light);
		text-shadow:
			0 0 20px var(--color-gold),
			0 4px 0 var(--color-gold-dark);
		margin-bottom: 1rem;
	}

	.intermission-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.intermission-divider .star {
		color: var(--color-gold);
		font-size: 1.2rem;
	}

	.intermission-divider .line {
		width: 80px;
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
	}

	.intermission-text {
		color: var(--color-cream);
		font-size: 1.1rem;
		margin-bottom: 1rem;
		opacity: 0.9;
	}

	.countdown {
		margin-bottom: 1.5rem;
	}

	.countdown-display {
		display: inline-block;
		background: var(--color-black);
		border: 3px solid var(--color-gold);
		padding: 1rem 2rem;
		border-radius: 8px;
	}

	.countdown-time {
		font-family: var(--font-display);
		font-size: 2.5rem;
		color: var(--color-gold-light);
		letter-spacing: 0.1em;
	}

	.intermission-subtext {
		color: #888;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		font-style: italic;
	}

	.popcorn-row {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		font-size: 2rem;
		opacity: 0.7;

		& span {
			animation: bounce-snack 1s ease-in-out infinite;
		}

		& span:nth-child(2) {
			animation-delay: 0.2s;
		}
		& span:nth-child(3) {
			animation-delay: 0.4s;
		}
	}

	@keyframes bounce-snack {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	/* Scene */
	.scene {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Reel counter */
	.reel-counter {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(0, 0, 0, 0.5);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid #333;
		align-self: flex-start;
	}

	.reel-info {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}

	.reel-label {
		font-size: 0.6rem;
		letter-spacing: 0.15em;
		color: #888;
	}

	.reel-number {
		font-family: var(--font-display);
		font-size: 1.25rem;
		color: var(--color-gold-light);
	}

	.reel-remaining {
		font-size: 0.75rem;
		color: #666;
		padding-left: 0.75rem;
		border-left: 1px solid #333;
	}

	/* Clapperboard */
	.clapperboard {
		background: transparent;
	}

	.clapper-top {
		height: 35px;
		background: var(--color-black);
		border-radius: 8px 8px 0 0;
		overflow: hidden;
	}

	.clapper-stripes {
		display: flex;
		height: 100%;
	}

	.stripe {
		flex: 1;
		background: var(--color-velvet-dark);
		transform: skewX(-20deg);
		margin: 0 -5px;

		&.white {
			background: var(--color-cream);
		}
	}

	.clapper-body {
		background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
		border: 3px solid #333;
		border-top: none;
		border-radius: 0 0 12px 12px;
		padding: 1.25rem;
	}

	.clapper-header {
		display: flex;
		justify-content: space-between;
		padding-bottom: 1rem;
		border-bottom: 2px solid #222;
		margin-bottom: 1rem;
	}

	.clapper-field {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.field-label {
		font-size: 0.65rem;
		letter-spacing: 0.15em;
		color: #666;
	}

	.field-value {
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: var(--color-cream);
	}

	/* Emoji stage */
	.emoji-stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		padding: 1rem 0;
	}

	.stage-curtain {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 30px;
		background: linear-gradient(
			90deg,
			var(--color-velvet-dark) 0%,
			var(--color-velvet) 50%,
			var(--color-velvet-dark) 100%
		);

		&.left {
			left: 0;
			border-radius: 4px 0 0 4px;
			background: linear-gradient(90deg, var(--color-velvet) 0%, var(--color-velvet-dark) 100%);
		}

		&.right {
			right: 0;
			border-radius: 0 4px 4px 0;
			background: linear-gradient(90deg, var(--color-velvet-dark) 0%, var(--color-velvet) 100%);
		}
	}

	.emoji-spotlight {
		position: relative;
		background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		padding: 1.5rem 3rem;
		border-radius: 8px;
	}

	.emojis {
		display: inline-block;
		text-align: center;
		text-wrap: pretty;
		font-size: clamp(2rem, 8vw, 3.5rem);
		letter-spacing: 0.15em;
		filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
	}

	/* Options */
	.options {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		border: none;
		padding: 0;

		&:disabled .option:not(.correct):not(.incorrect) {
			opacity: 0.4;
		}
	}

	.option {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.9rem 1.25rem;
		background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
		border: 2px solid #2a2a2a;
		border-radius: 8px;
		color: var(--color-cream);
		font-family: var(--font-body);
		font-size: 0.95rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		&:hover:not(:disabled) {
			border-color: var(--color-gold);
			background: linear-gradient(180deg, #252525 0%, #1a1a1a 100%);
			transform: translateX(5px);
		}

		&.correct {
			border-color: #2ecc71;
			background: linear-gradient(180deg, #1a3a2a 0%, #0f2a1f 100%);
			animation: correct-flash 0.5s ease;
		}

		&.incorrect {
			border-color: var(--color-velvet);
			background: linear-gradient(180deg, #3a1a1a 0%, #2a0f0f 100%);
			animation: wrong-shake 0.4s ease;
		}
	}

	@keyframes option-slide {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes correct-flash {
		0%,
		100% {
			box-shadow: 0 0 0 transparent;
		}
		50% {
			box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
		}
	}

	@keyframes wrong-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-8px);
		}
		40% {
			transform: translateX(8px);
		}
		60% {
			transform: translateX(-4px);
		}
		80% {
			transform: translateX(4px);
		}
	}

	.option-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--color-gold-dark);
		border-radius: 50%;
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--color-black);
		flex-shrink: 0;
	}

	.option-title {
		flex: 1;
	}

	.option-result {
		font-size: 1.25rem;
		font-weight: 700;

		.correct & {
			color: #2ecc71;
		}
		.incorrect & {
			color: var(--color-velvet-light);
		}
	}

	/* Credits roll */
	.credits-roll {
		background: linear-gradient(180deg, #0d0d0d 0%, #000 100%);
		border: 3px solid var(--color-gold);
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		transition: all 0.4s ease;
	}

	.credits-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.credits-star {
		color: var(--color-gold);
		font-size: 1.5rem;
		animation: star-pulse 1s ease-in-out infinite;
	}

	@keyframes star-pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.8;
		}
	}

	.credits-title {
		font-family: var(--font-display);
		font-size: 2rem;
		letter-spacing: 0.1em;
		color: var(--color-gold-light);
		text-shadow: 0 2px 0 var(--color-gold-dark);
	}

	.rating-card {
		margin-bottom: 1.25rem;
	}

	.rating-prompt {
		color: #888;
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
	}

	.rating-buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.rating-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 0.75rem 1.5rem;
		background: #1a1a1a;
		border: 2px solid #333;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;

		& span:first-child {
			font-size: 1.5rem;
		}

		&:hover:not(:disabled) {
			transform: scale(1.05);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&.thumbs-up:hover:not(:disabled),
		&.thumbs-up.selected {
			border-color: #2ecc71;
			background: #1a3a2a;
		}

		&.thumbs-down:hover:not(:disabled),
		&.thumbs-down.selected {
			border-color: var(--color-velvet);
			background: #3a1a1a;
		}

		&.selected {
			opacity: 1;
		}
	}

	.next-scene-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 2rem;
		background: linear-gradient(180deg, var(--color-velvet) 0%, var(--color-velvet-dark) 100%);
		border: 3px solid var(--color-gold);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);

		&:hover {
			transform: translateY(-2px);
			box-shadow:
				0 6px 20px rgba(0, 0, 0, 0.5),
				0 0 15px rgba(212, 175, 55, 0.3);

			.btn-icon {
				transform: translateX(3px);
			}
		}
	}

	.btn-text {
		font-family: var(--font-display);
		font-size: 1.1rem;
		letter-spacing: 0.05em;
		color: var(--color-gold-light);
	}

	.btn-icon {
		color: var(--color-gold);
		transition: transform 0.2s ease;
	}

	@media (max-width: 500px) {
		.clapper-body {
			padding: 1rem;
		}

		.emoji-spotlight {
			padding: 1rem 2rem;
		}

		.stage-curtain {
			width: 20px;
		}

		.option {
			padding: 0.75rem 1rem;
			font-size: 0.9rem;
		}

		.credits-roll {
			padding: 1.25rem;
		}

		.rating-btn {
			padding: 0.6rem 1rem;
		}

		.credits-star {
			display: none;
		}
	}
</style>
