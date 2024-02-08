import { http, HttpResponse } from 'msw';

export const handlers = [
	http.post('https://api.openai.com/v1/chat/completions', () => {
		return HttpResponse.json({
			id: 'chatcmpl-ksjdhsfkh9889373ljdl',
			object: 'chat.completion',
			created: 1707426829,
			model: 'gpt-3.5-turbo-1106',
			choices: [
				{
					index: 0,
					message: {
						role: 'assistant',
						content: '{"emoji": "🧙🏻🕸️🧡🪱"}',
					},
					logprobs: null,
					finish_reason: 'stop',
				},
			],
			usage: {
				prompt_tokens: 76,
				completion_tokens: 25,
				total_tokens: 101,
			},
			system_fingerprint: 'fp_djhgdjhd',
		});
	}),
];
