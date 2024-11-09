import define from '../../../define.js';
import { AbuseReportResolvers } from '@/models/index.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	errors: {
		resolverNotFound: {
			message: 'Resolver not found.',
			code: 'RESOLVER_NOT_FOUND',
			id: '121fbea9-3e49-4456-998a-d4095c7ac5c5',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		resolverId: { type: 'string', format: 'misskey:id' },
	},
	required: ['resolverId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const resolver = await AbuseReportResolvers.findOne({
		id: ps.resolverId,
	});
	if (resolver == null) {
		throw new ApiError(meta.errors.resolverNotFound);
	}
	await AbuseReportResolvers.delete(resolver.id);
});
