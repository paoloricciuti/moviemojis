export function get_skewed_random(max: number, random_fn: () => number) {
	return Math.floor(Math.pow(random_fn(), 2.5) * max);
}

export function shuffle<T extends unknown[]>(arr: T, random_fn = Math.random) {
	const shuffled = [...arr];
	for (let i = shuffled.length - 1; i >= 0; i--) {
		const to_swap = Math.floor(random_fn() * i);
		const temp = shuffled[i];
		shuffled[i] = shuffled[to_swap];
		shuffled[to_swap] = temp;
	}
	return shuffled;
}
