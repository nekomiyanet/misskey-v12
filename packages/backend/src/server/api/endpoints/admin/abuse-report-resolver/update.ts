import define from '../../../define.js';
import { AbuseReportResolvers } from '@/models/index.js';
import { ApiError } from '../../../error.js';
import { AbuseReportResolver } from '@/models/entities/abuse-report-resolver.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	errors: {
		resolverNotFound: {
			message: 'Resolver not found.',
			id: 'fd32710e-75e1-4d20-bbd2-f89029acb16e',
			code: 'RESOLVER_NOT_FOUND',
		},
		invalidRegularExpressionForTargetUser: {
			message: 'Invalid regular expression for target user.',
			code: 'INVALID_REGULAR_EXPRESSION_FOR_TARGET_USER',
			id: 'c008484a-0a14-4e74-86f4-b176dc49fcaa',
		},
		invalidRegularExpressionForReporter: {
			message: 'Invalid regular expression for reporter.',
			code: 'INVALID_REGULAR_EXPRESSION_FOR_REPORTER',
			id: '399b4062-257f-44c8-87cc-4ffae2527fbc',
		},
		invalidRegularExpressionForReportContent: {
			message: 'Invalid regular expression for report content.',
			code: 'INVALID_REGULAR_EXPRESSION_FOR_REPORT_CONTENT',
			id: '88c124d8-f517-4c63-a464-0abc274168b',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		resolverId: { type: 'string', format: 'misskey:id' },
		name: { type: 'string' },
		targetUserPattern: { type: 'string', nullable: true },
		reporterPattern: { type: 'string', nullable: true },
		reportContentPattern: { type: 'string', nullable: true },
		forward: { type: 'boolean' },
	},
	required: ['resolverId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const resolver = await AbuseReportResolvers.findOne({
		id: ps.resolverId,
	});

	if (resolver === null) throw new ApiError(meta.errors.resolverNotFound);

	const properties = {} as Partial<AbuseReportResolver>;

	if (ps.name) properties.name = ps.name;
	if (ps.targetUserPattern) {
		try {
			new RegExp(ps.targetUserPattern);
		} catch (e) {
			throw new ApiError(meta.errors.invalidRegularExpressionForTargetUser);
		}
		properties.targetUserPattern = ps.targetUserPattern;
	} else if (ps.targetUserPattern === null) {
		properties.targetUserPattern = null;
	}
	if (ps.reporterPattern) {
		try {
			new RegExp(ps.reporterPattern);
		} catch (e) {
			throw new ApiError(meta.errors.invalidRegularExpressionForReporter);
		}
		properties.reporterPattern = ps.reporterPattern;
	} else if (ps.reporterPattern === null) {
		properties.reporterPattern = null;
	}
	if (ps.reportContentPattern) {
		try {
			new RegExp(ps.reportContentPattern);
		} catch (e) {
			throw new ApiError(meta.errors.invalidRegularExpressionForReportContent);
		}
		properties.reportContentPattern = ps.reportContentPattern;
	} else if (ps.reportContentPattern === null) {
		properties.reportContentPattern = null;
	}
	if (ps.forward) properties.forward = ps.forward;

	await AbuseReportResolvers.update(resolver.id, {
		...properties,
		updatedAt: new Date(),
	});

});
