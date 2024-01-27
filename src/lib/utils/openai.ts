import { OPENAI_API_KEY } from '$env/static/private';
import { open_ai_result_schema } from '$lib/validations';
import OpenAi from 'openai';
import { parse } from 'valibot';

export async function get_emojis_from_film(film: string, retry = 0) {
	const openai = new OpenAi({
		apiKey: OPENAI_API_KEY
	});
	const result = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo-1106',
		messages: [
			{
				role: 'system',
				content: `You are a film expert that knows the plot of every film and can quickly summarize a film title in a series of emojo in JSON format with the schema {"emoji": string} the emoji field should have a maximum length of 7 emoji.`
			},
			{ role: 'user', content: `Generate a series of emoji that can represent the film "${film}"` }
		],
		response_format: { type: 'json_object' }
	});
	try {
		return parse(open_ai_result_schema, JSON.parse(result.choices[0].message.content ?? ''));
	} catch (e) {
		console.log(JSON.stringify(e));
		if (retry < 0) {
			return get_emojis_from_film(film, retry + 1);
		}
		throw new Error('OpenAi was not able to generate this film');
	}
}
