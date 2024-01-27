import { add_new_movie, get_emojis_from_title_from_db } from '$lib/db/queries';
import seedable_rand from 'seed-random';
import { get_emojis_from_title_ai } from '$lib/utils/openai';
import { get_random_popular_page, get_reccomendations_from_film_id } from '$lib/utils/tmdb';
import { error } from '@sveltejs/kit';
import { ValiError } from 'valibot';
import { shuffle } from '$lib/utils/index.js';

const TODAY_COUNT_COOKIE_NAME = 'moviemojis-today-count';

export async function load({ cookies }) {
	try {
		let today_count = parseInt(cookies.get(TODAY_COUNT_COOKIE_NAME) ?? '0');
		today_count = isNaN(today_count) ? 0 : today_count;
		if (today_count >= 10) {
			return {
				exhausted: true as const,
			};
		}
		const today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		today.setMilliseconds(0);
		const rand = seedable_rand((today.getTime() + today_count).toString());
		const popular_page = await get_random_popular_page();
		const random = Math.floor(rand() * popular_page.results.length);
		const random_movie = popular_page.results[random];
		let emojis = await get_emojis_from_title_from_db(random_movie.original_title);
		if (!emojis) {
			emojis = (await get_emojis_from_title_ai(random_movie.original_title)).emoji;
			add_new_movie(random_movie, emojis);
		}
		const similars_films = await get_reccomendations_from_film_id(random_movie.id);
		let options = similars_films.results.slice(0, 4).map((film) => film.title);
		options.push(random_movie.original_title);
		options = shuffle(options);
		cookies.set(TODAY_COUNT_COOKIE_NAME, (today_count + 1).toString(), {
			path: '/',
			httpOnly: false,
		});
		return {
			emojis,
			title: random_movie.original_title,
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
