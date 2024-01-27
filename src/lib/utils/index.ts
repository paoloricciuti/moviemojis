export function get_skewed_random(max: number, random_fn: () => number) {
	return Math.floor(Math.pow(random_fn(), 2.5) * max);
}

export function shuffle<T extends unknown[]>(arr: T) {
	const shuffled = [...arr];
	for (let i = shuffled.length; i >= 0; i--) {
		const to_swap = Math.floor(Math.random() * i);
		const temp = shuffled[i];
		shuffled[i] = shuffled[to_swap];
		shuffled[to_swap] = temp;
	}
	return shuffled;
}
