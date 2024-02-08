import { http, HttpResponse } from 'msw';
import discover_movie from './fixtures/tmdb/popular.json';
import recommendation from './fixtures/tmdb/recommendation.json';
import completion from './fixtures/openai/completion.json';

export const handlers = [
	http.get('https://api.themoviedb.org/3/movie/:movieId/recommendations', () => {
		return HttpResponse.json(recommendation);
	}),
	http.get('https://api.themoviedb.org/3/discover/movie', () => {
		return HttpResponse.json(discover_movie);
	}),
	http.post('https://api.openai.com/v1/chat/completions', () => {
		return HttpResponse.json(completion);
	}),
];
