import define from '../../define.js';
import { NoteReactions, UserProfiles } from '@/models/index.js';
import { makePaginationQuery } from '../../common/make-pagination-query.js';
import { generateVisibilityQuery } from '../../common/generate-visibility-query.js';
import { generateMutedUserQuery } from '../../common/generate-muted-user-query.js';
import { generateBlockedUserQuery } from '../../common/generate-block-query.js';
import { generateMutedInstanceQuery } from '../../common/generate-muted-instance-query.js';
import { ApiError } from '../../error.js';
import { getUser } from '../../common/getters.js';

export const meta = {
	tags: ['users', 'reactions'],

	requireCredential: false,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'NoteReaction',
		},
	},

	errors: {
		reactionsNotPublic: {
			message: 'Reactions of the user is not public.',
			code: 'REACTIONS_NOT_PUBLIC',
			id: '673a7dd2-6924-1093-e0c0-e68456ceae5c',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		sinceDate: { type: 'integer' },
		untilDate: { type: 'integer' },
	},
	required: ['userId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	// Lookup user
	const user = await getUser(ps.userId).catch(e => {
		if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new ApiError(meta.errors.noSuchUser);
		throw e;
	});
	const profile = await UserProfiles.findOneOrFail(ps.userId);

	if (me == null || (me.id !== ps.userId && !profile.publicReactions)) {
		throw new ApiError(meta.errors.reactionsNotPublic);
	}

	const query = makePaginationQuery(NoteReactions.createQueryBuilder('reaction'),
			ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
		.andWhere(`reaction.userId = :userId`, { userId: ps.userId })
		.leftJoinAndSelect('reaction.note', 'note');

	generateVisibilityQuery(query, me);
	if (me) {
		generateMutedUserQuery(query, me, user);
		generateMutedInstanceQuery(query, me);
		if (!me.isAdmin && !me.isModerator) {
			generateBlockedUserQuery(query, me);
		}
	}

	const reactions = await query
		.take(ps.limit)
		.getMany();

	return await Promise.all(reactions.map(reaction => NoteReactions.pack(reaction, me, { withNote: true })));
});
