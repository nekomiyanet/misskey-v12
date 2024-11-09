import define from '../../../define.js';
import { AbuseReportResolvers } from '@/models/index.js';
import { makePaginationQuery } from '../../../common/make-pagination-query.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			properties: {
				name: {
					type: 'string',
					nullable: false, optional: false,
				},
				targetUserPattern: {
					type: 'string',
					nullable: true, optional: false,
				},
				reporterPattern: {
					type: 'string',
					nullable: true, optional: false,
				},
				reportContentPattern: {
					type: 'string',
					nullable: true, optional: false,
				},
				expiresAt: {
					type: 'string',
					nullable: false, optional: false,
					format: 'date-time',
				},
				forward: {
					type: 'boolean',
					nullable: false, optional: false,
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps) => {
	const query = makePaginationQuery(AbuseReportResolvers.createQueryBuilder('abusereportresolver'), ps.sinceId, ps.untilId);

	const abusereportresolvers = await query.take(ps.limit).getMany();

	return abusereportresolvers;
});
