export function seedable_rand(seed: number) {
	const a = 1664525;
	const c = 1013904223;
	const m = Math.pow(2, 32);

	// Set the initial seed
	let z = seed;

	// Return a function that when called, will generate the next random number
	return () => {
		// Generate the next number in the sequence
		z = (a * z + c) % m;
		// Return a floating-point number in [0, 1)
		return z / m;
	};
}

export function get_skewed_random(max: number, random_fn: () => number) {
	return Math.floor(Math.pow(random_fn(), 2.5) * max) + 1;
}
