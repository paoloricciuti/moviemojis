import { form, getRequestEvent, query } from '$app/server';
import seedable_rand from 'seed-random';
import { get_random_popular_page, get_reccomendations_from_film_id } from './utils/tmdb';
import {
	add_new_movie,
	add_new_upvote,
	get_emojis_from_title_from_db,
	get_upvote_for_movie
} from './server/db/queries/index.server';
import { get_emojis_from_title_ai } from './utils/ai';
import { shuffle } from './utils';
import type { Upvotes } from './server/db/schema';
import { get_user } from './auth.remote';
import { error, invalid } from '@sveltejs/kit';
import { ValiError } from 'valibot';
import { HMAC } from '@oslojs/crypto/hmac';
import { SHA256 } from '@oslojs/crypto/sha2';
import { ANSWER_SECRET } from '$env/static/private';
import * as v from 'valibot';

const TODAY_COUNT_COOKIE_NAME = 'moviemojis-today-count';

function uint8array_to_hex(arr: Uint8Array) {
	return Array.from(arr)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function sign_id(id: string) {
	const text_encoder = new TextEncoder();
	const hs256 = new HMAC(SHA256, text_encoder.encode(ANSWER_SECRET));
	hs256.update(text_encoder.encode(id));
	return uint8array_to_hex(hs256.digest());
}

function get_today_count() {
	const { cookies } = getRequestEvent();
	const today_count = parseInt(cookies.get(TODAY_COUNT_COOKIE_NAME) ?? '0');
	return isNaN(today_count) ? 0 : today_count;
}

async function get_random_movie_with_emojis(today_count: number) {
	const date = new Date();
	date.setUTCHours(0);
	date.setUTCMinutes(0);
	date.setUTCSeconds(0);
	date.setUTCMilliseconds(0);

	const rand = seedable_rand(date.getTime().toString());
	let popular_page: Awaited<ReturnType<typeof get_random_popular_page>> | undefined = undefined;
	while ((popular_page?.results.length ?? 0) < 10) {
		popular_page = await get_random_popular_page();
	}
	const popular_page_results = popular_page?.results ?? [];
	const movies: typeof popular_page_results = [];
	while (movies.length < 10) {
		const random = Math.floor(rand() * popular_page_results.length);
		movies.push(popular_page_results[random]!);
		popular_page_results.splice(random, 1);
	}
	const random_movie = movies[today_count]!;

	let movie = await get_emojis_from_title_from_db(random_movie.title);
	if (!movie) {
		const emojis = (await get_emojis_from_title_ai(random_movie.title)).emoji;
		const [new_movie] = await add_new_movie(random_movie, emojis);
		movie = {
			...new_movie!,
			upvotes: 0
		};
	}

	return { random_movie, movie };
}

export const get_movie = query(async () => {
	try {
		const user = await get_user();
		const today_count = get_today_count();
		const date = new Date();
		date.setUTCHours(0);
		date.setUTCMinutes(0);
		date.setUTCSeconds(0);
		date.setUTCMilliseconds(0);
		if (today_count >= 10) {
			date.setUTCHours(date.getUTCHours() + 24);
			const come_back_in = Math.floor((date.getTime() - Date.now()) / 1000);
			return {
				exhausted: true as const,
				come_back_in
			};
		}

		const { random_movie, movie } = await get_random_movie_with_emojis(today_count);

		const similars_films = await get_reccomendations_from_film_id(random_movie.id);
		let options = similars_films.results
			.slice(0, 4)
			.map((film) => ({ title: film.title, id: film.id }));
		options.push({ title: random_movie.title, id: random_movie.id });
		options = shuffle(options, seedable_rand(random_movie.title));
		let old_upvote: Upvotes | undefined;
		if (user?.user.id && movie.upvotes !== 0) {
			old_upvote = await get_upvote_for_movie(movie.id, user.user.id);
		}
		return {
			emojis: movie.emojis,
			movie_id: movie.id,
			upvotes: movie.upvotes,
			old_upvote: old_upvote?.delta,
			correct_id: await sign_id(random_movie.id.toString()),
			options,
			exhausted: false as const,
			today_count: today_count + 1
		};
	} catch (e) {
		if (e instanceof ValiError) {
			error(500, { message: 'Validation error', issues: e.issues });
		}
		console.log(e);
		error(500);
	}
});

export const guess_movie = form(
	v.object({
		correct_id: v.string(),
		answer_id: v.string()
	}),
	async ({ correct_id, answer_id }) => {
		const signed_answer_id = await sign_id(answer_id);
		const correct = correct_id === signed_answer_id;
		if (correct) {
			const today_count = get_today_count();
			// since it takes a while to generate a new movie, we preemptively increase the count here
			// so that if it needs to be generated the user can get to it faster...a bit wasteful but oh well
			get_random_movie_with_emojis(today_count + 1);
		}
		return {
			correct,
			answer_id,
			correct_id
		};
	}
);

export const next = form(async () => {
	const { cookies } = getRequestEvent();
	const today_count = get_today_count();
	const date = new Date();
	date.setUTCHours(0);
	date.setUTCMinutes(0);
	date.setUTCSeconds(0);
	date.setUTCMilliseconds(0);
	// set date to tomorrow at midnight
	date.setHours(date.getHours() + 24);
	// set the expiration of the cookie at midnight of tomorrow
	const maxAge = Math.floor((date.getTime() - Date.now()) / 1000);
	cookies.set(TODAY_COUNT_COOKIE_NAME, (today_count + 1).toString(), {
		path: '/',
		httpOnly: false,
		maxAge
	});
	await get_movie().refresh();
});

export const vote = form(
	v.object({
		delta: v.pipe(
			v.string(),
			v.transform((str) => parseInt(str))
		),
		movie_id: v.string()
	}),
	async ({ delta, movie_id }) => {
		const user = await get_user();
		if (!user) {
			invalid();
		}
		const from_user = user.user.id;
		if (delta !== 1 && delta !== -1) {
			return invalid();
		}
		try {
			await add_new_upvote({
				delta,
				for_movie: movie_id,
				from_user
			});
		} catch (e) {
			console.log(e);
		}
	}
);
