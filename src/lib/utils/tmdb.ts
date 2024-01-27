import { TMDB_BEARER } from '$env/static/private';
import { popular_films_schema, reccomendations_films_schema } from '$lib/validations';
import { parse } from 'valibot';
import { get_skewed_random, seedable_rand } from '.';

function fetch_tmdb(path: string) {
	const url = `https://api.themoviedb.org/3${path}`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${TMDB_BEARER}`,
		},
	};
	return fetch(url, options);
}

export async function get_reccomendations_from_film_id(id: number) {
	const recommendations_res = await fetch_tmdb(
		`/movie/${id}/recommendations?language=en-US&page=1`,
	);
	const recommendations_json = await recommendations_res.json();
	return parse(reccomendations_films_schema, recommendations_json);
}

export async function get_random_popular_page() {
	const today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	const random_page = get_skewed_random(281, seedable_rand(today.getTime())) + 1;
	const populars_res = await fetch_tmdb(
		`/discover/movie?include_adult=false&include_video=true&language=en-US&sort_by=vote_average.desc&vote_count.gte=500&with_original_language=en&page=${random_page}`,
	);
	const populars_json = await populars_res.json();
	return parse(popular_films_schema, populars_json);
}
