import type { Handle } from '@sveltejs/kit';
import { SEED_ENDPOINT } from '../../constants';
import { db } from '$lib/db/index.server';
import { schemas } from '$lib/db/utils.server';
import { reset_db } from '$lib/db/utils.server';

const OriginalDate = globalThis.Date;
class MockDate extends OriginalDate {
	// this is 13 Feb 2024 in millisecs from Unix time + 4 hrs...i'm
	// hardcoding this so that it's consistent in GitHub CI
	static currentDate = new OriginalDate(1_707_778_800_000 + 14_400_000);
	static currentTimeStamp = new OriginalDate(MockDate.currentDate).getTime();
	static originalNow = OriginalDate.now();

	constructor(...args: unknown[]) {
		const params = args && args.length ? args : [MockDate.currentTimeStamp + MockDate.getTick()];
		// @ts-expect-error ts stuff that i don't want to care about
		super(...params);
	}

	static [Symbol.hasInstance](instance: Date) {
		return typeof instance?.getDate === 'function';
	}

	static getTick() {
		return OriginalDate.now() - MockDate.originalNow;
	}

	static now() {
		return MockDate.currentTimeStamp + MockDate.getTick();
	}
}

// @ts-expect-error ts stuff i don't want to deal with
globalThis.Date = MockDate;

const text_decoder = new TextDecoder();

function read_body(request: Request) {
	let body = '';
	let resolve: (value: Record<string, unknown>) => void;
	const body_promise = new Promise<Record<string, unknown>>((res) => {
		resolve = res;
	});
	request.body?.pipeTo(
		new WritableStream({
			write(chunk) {
				body += text_decoder.decode(chunk);
			},
			close() {
				resolve(JSON.parse(body));
			},
		}),
	);
	return body_promise;
}

function check_key_of(key: string): key is keyof typeof schemas {
	return key in schemas;
}

export const seed_handle: Handle = async ({ event, resolve }) => {
	const request = event.request.clone();
	if (request.method === 'POST') {
		const request_url = new URL(request.url);
		if (request_url.pathname === SEED_ENDPOINT) {
			const body = await read_body(request);
			await reset_db();
			for (const key in body) {
				const to_insert = body[key];
				if (to_insert && Array.isArray(to_insert) && to_insert.length > 0 && check_key_of(key)) {
					await db
						.insert(schemas[key])
						.values(body[key] as never)
						.execute();
				}
			}
			return new Response(null, {
				status: 204,
			});
		}
	}
	return resolve(event);
};
