import { OPENROUTER_API_KEY } from '$env/static/private';
import { ai_result_schema } from '$lib/validations';
import { OpenRouter } from '@openrouter/sdk';
import { parse } from 'valibot';
import { toJsonSchema } from '@valibot/to-json-schema';

const openai = new OpenRouter({
	apiKey: OPENROUTER_API_KEY,
});

export async function get_emojis_from_title_ai(film: string, retry = 0) {
	const result = await openai.chat.send({
		model: 'openai/gpt-oss-120b:free',
		messages: [
			{
				role: 'system',
				content: `You are a film expert that knows the plot of every film and can quickly summarize a film title in a series of emoji in JSON format with the schema {"emoji": string} the emoji field should have a maximum length of 7 emoji.`,
			},
			{ role: 'user', content: `Generate a series of emoji that can represent the film "${film}"` },
		],
		stream: false,
		responseFormat: {
			type: 'json_schema',
			jsonSchema: {
				name: 'emoji',
				strict: true,
				schema: toJsonSchema(ai_result_schema),
			},
		},
	});
	try {
		return parse(
			ai_result_schema,
			JSON.parse(result.choices?.[0]?.message.content?.toString() ?? ''),
		);
	} catch (e) {
		console.log(JSON.stringify(e));
		if (retry < 10) {
			return get_emojis_from_title_ai(film, retry + 1);
		}
		throw new Error('OpenAi was not able to generate this film');
	}
}
