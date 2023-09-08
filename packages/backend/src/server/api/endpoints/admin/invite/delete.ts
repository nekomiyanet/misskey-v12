import define from '../../../define.js';
import { RegistrationTickets } from '@/models/index.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		id: { type: 'string', format: 'misskey:id' },
	},
	required: ['id'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const ticket = await RegistrationTickets.findOne({
		id: ps.id,
	});

	if (ticket == null) {
		return;
	}

	await RegistrationTickets.delete(ticket.id);
});
