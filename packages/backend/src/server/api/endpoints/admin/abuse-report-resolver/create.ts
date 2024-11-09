import ms from 'ms';
import define from '../../../define.js';
import { AbuseReportResolvers } from '@/models/index.js';
import { genId } from '@/misc/gen-id.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	res: {
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

	errors: {
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
		name: { type: 'string', minLength: 1 },
		targetUserPattern: { type: 'string', nullable: true },
		reporterPattern: { type: 'string', nullable: true },
		reportContentPattern: { type: 'string', nullable: true },
		forward: { type: 'boolean' },
	},
	required: ['name', 'targetUserPattern', 'reporterPattern', 'reportContentPattern', 'forward'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	if (ps.targetUserPattern) {
		try {
			new RegExp(ps.targetUserPattern);
		} catch (e) {
			throw new ApiError(meta.errors.invalidRegularExpressionForTargetUser);
		}
	}
	if (ps.reporterPattern) {
		try {
			new RegExp(ps.reporterPattern);
		} catch (e) {
			throw new ApiError(meta.errors.invalidRegularExpressionForReporter);
		}
	}
	if (ps.reportContentPattern) {
		try {
			new RegExp(ps.reportContentPattern);
		} catch (e) {
			throw new ApiError(meta.errors.invalidRegularExpressionForReportContent);
		}
	}
	const now = new Date();

	return await AbuseReportResolvers.insert({
		id: genId(),
		createdAt: now,
		updatedAt: now,
		name: ps.name,
		targetUserPattern: ps.targetUserPattern,
		reporterPattern: ps.reporterPattern,
		reportContentPattern: ps.reportContentPattern,
		expirationDate: null,
		expiresAt: 'indefinitely',
		forward: ps.forward,
	}).then(x => AbuseReportResolvers.findOneOrFail(x.identifiers[0]));
});
