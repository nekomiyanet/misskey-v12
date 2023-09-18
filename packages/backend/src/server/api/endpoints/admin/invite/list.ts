import define from '../../../define.js';
import { RegistrationTickets } from '@/models/index.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';
import { makePaginationQuery } from '../../../common/make-pagination-query.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const query = makePaginationQuery(RegistrationTickets.createQueryBuilder('code'), ps.sinceId, ps.untilId);

	const codes = await query.take(ps.limit).getMany();

	return codes;
});
