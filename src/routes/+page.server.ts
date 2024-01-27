import { get_emojis_from_film } from '$lib/utils/openai';
import { get_random_popular_page, get_reccomendations_from_film_id } from '$lib/utils/tmdb';
import { error } from '@sveltejs/kit';
import { ValiError } from 'valibot';
export async function load() {
	try {
		const popular_page = await get_random_popular_page();
		const random = Math.floor(Math.random() * popular_page.results.length);
		const random_film = popular_page.results[random];
		const emojis = await get_emojis_from_film(random_film.original_title);
		const similars_films = await get_reccomendations_from_film_id(random_film.id);
		const options = similars_films.results.slice(0, 4).map((film) => film.original_title);
		options.push(random_film.original_title);
		options.sort(() => Math.random() - 0.5);
		return { ...emojis, title: random_film.original_title, options };
	} catch (e) {
		if (e instanceof ValiError) {
			error(500, { message: 'Validation error', issues: e.issues });
		}
		error(500);
	}
}
