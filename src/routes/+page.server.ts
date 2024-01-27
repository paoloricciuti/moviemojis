import { add_new_movie, get_emojis_from_title_from_db } from '$lib/db/queries';
import { get_emojis_from_title_ai } from '$lib/utils/openai';
import { get_random_popular_page, get_reccomendations_from_film_id } from '$lib/utils/tmdb';
import { error } from '@sveltejs/kit';
import { ValiError } from 'valibot';
export async function load() {
	try {
		const popular_page = await get_random_popular_page();
		const random = Math.floor(Math.random() * popular_page.results.length);
		const random_movie = popular_page.results[random];
		let emojis = await get_emojis_from_title_from_db(random_movie.original_title);
		if (!emojis) {
			emojis = (await get_emojis_from_title_ai(random_movie.original_title)).emoji;
			add_new_movie(random_movie, emojis);
		}
		const similars_films = await get_reccomendations_from_film_id(random_movie.id);
		const options = similars_films.results.slice(0, 4).map((film) => film.original_title);
		options.push(random_movie.original_title);
		// TODO: better shuffling
		options.sort(() => Math.random() - 0.5);
		return { emojis, title: random_movie.original_title, options };
	} catch (e) {
		if (e instanceof ValiError) {
			error(500, { message: 'Validation error', issues: e.issues });
		}
		error(500);
	}
}
