import define from '../../../define.js';
import { Relays } from '@/models/index.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		inbox: { type: 'string' },
		onlyHashtag: { type: 'boolean' },
	},
	required: ['inbox', 'onlyHashtag'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const relay = await Relays.findOne({ inbox: ps.inbox });

	if (relay == null) {
		throw new Error('relay not found');
	}

	Relays.update({ id: relay.id }, {
		onlyHashtag: ps.onlyHashtag,
	});
});
