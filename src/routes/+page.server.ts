import { add_new_movie, get_emojis_from_title_from_db } from '$lib/db/queries/index.server.js';
import seedable_rand from 'seed-random';
import { get_emojis_from_title_ai } from '$lib/utils/openai';
import { get_random_popular_page, get_reccomendations_from_film_id } from '$lib/utils/tmdb';
import { error, fail } from '@sveltejs/kit';
import { ValiError } from 'valibot';
import { shuffle } from '$lib/utils/index.js';
import type { Actions, PageServerLoadEvent } from './$types.js';
import { HMAC } from 'oslo/crypto';
import { encodeHex, decodeHex } from 'oslo/encoding';
import { ANSWER_SECRET } from '$env/static/private';

const TODAY_COUNT_COOKIE_NAME = 'moviemojis-today-count';

function get_today_count(cookies: PageServerLoadEvent['cookies']) {
	const today_count = parseInt(cookies.get(TODAY_COUNT_COOKIE_NAME) ?? '0');
	return isNaN(today_count) ? 0 : today_count;
}
async function verify_id(correct_id: string, answer_id: string) {
	const hs256 = new HMAC('SHA-256');
	const text_encoder = new TextEncoder();
	const result = await hs256.verify(
		text_encoder.encode(ANSWER_SECRET),
		decodeHex(correct_id),
		text_encoder.encode(answer_id),
	);
	return result;
}

async function sign_id(id: number) {
	const hs256 = new HMAC('SHA-256');
	const text_encoder = new TextEncoder();
	const signature = encodeHex(
		await hs256.sign(text_encoder.encode(ANSWER_SECRET), text_encoder.encode(id.toString())),
	);
	return signature;
}

export async function load({ cookies }) {
	try {
		const today_count = get_today_count(cookies);
		const date = new Date();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		if (today_count >= 10) {
			date.setHours(date.getHours() + 24);
			const come_back_in = Math.floor((date.getTime() - Date.now()) / 1000);
			return {
				exhausted: true as const,
				come_back_in,
			};
		}
		const rand = seedable_rand(date.getTime().toString());
		let popular_page: Awaited<ReturnType<typeof get_random_popular_page>> | undefined = undefined;
		while ((popular_page?.results.length ?? 0) < 10) {
			popular_page = await get_random_popular_page();
		}
		const popular_page_results = popular_page?.results ?? [];
		const movies: typeof popular_page_results = [];
		while (movies.length < 10) {
			const random = Math.floor(rand() * popular_page_results.length);
			movies.push(popular_page_results[random]);
			popular_page_results.splice(random, 1);
		}
		const random_movie = movies[today_count];
		let emojis = await get_emojis_from_title_from_db(random_movie.title);
		if (!emojis) {
			emojis = (await get_emojis_from_title_ai(random_movie.title)).emoji;
			add_new_movie(random_movie, emojis);
		}
		const similars_films = await get_reccomendations_from_film_id(random_movie.id);
		let options = similars_films.results
			.slice(0, 4)
			.map((film) => ({ title: film.title, id: film.id }));
		options.push({ title: random_movie.title, id: random_movie.id });
		options = shuffle(options, seedable_rand(random_movie.title));
		return {
			emojis,
			correct_id: await sign_id(random_movie.id),
			options,
			exhausted: false as const,
			today_count: today_count + 1,
		};
	} catch (e) {
		if (e instanceof ValiError) {
			error(500, { message: 'Validation error', issues: e.issues });
		}
		console.log(e);
		error(500);
	}
}

export const actions: Actions = {
	async guess({ request }) {
		const data = await request.formData();
		const correct_id = data.get('correct_id');
		const answer_id = data.get('answer_id');
		if (!correct_id || !answer_id) {
			return fail(400);
		}
		if (await verify_id(correct_id.toString(), answer_id.toString())) {
			return {
				correct: true,
				answer_id,
			};
		}
		return {
			correct: false,
			answer_id,
		};
	},
	async next({ cookies }) {
		const today_count = get_today_count(cookies);
		const date = new Date();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		// set date to tomorrow at midnight
		date.setHours(date.getHours() + 24);
		// set the expiration of the cookie at midnight of tomorrow
		const maxAge = Math.floor((date.getTime() - Date.now()) / 1000);
		cookies.set(TODAY_COUNT_COOKIE_NAME, (today_count + 1).toString(), {
			path: '/',
			httpOnly: false,
			maxAge,
		});
	},
};
