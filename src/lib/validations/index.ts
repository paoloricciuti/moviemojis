import * as v from 'valibot';

export const open_ai_result_schema = v.object({
	emoji: v.string()
});
export const film_schema = v.object({
	adult: v.boolean(),
	backdrop_path: v.string(),
	genre_ids: v.array(v.number()),
	id: v.number(),
	original_language: v.string(),
	original_title: v.string(),
	overview: v.string(),
	popularity: v.number(),
	poster_path: v.string(),
	release_date: v.string(),
	title: v.string(),
	video: v.boolean(),
	vote_average: v.number(),
	vote_count: v.number()
});

export const popular_films_schema = v.object({
	page: v.number(),
	results: v.array(film_schema),
	total_pages: v.number(),
	total_results: v.number()
});

export const reccomendations_films_schema = v.object({
	page: v.number(),
	results: v.array(film_schema),
	total_pages: v.number(),
	total_results: v.number()
});
