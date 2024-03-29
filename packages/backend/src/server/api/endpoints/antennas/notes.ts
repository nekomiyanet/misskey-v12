import define from '../../define.js';
import readNote from '@/services/note/read.js';
import { Antennas, Notes, AntennaNotes } from '@/models/index.js';
import { makePaginationQuery } from '../../common/make-pagination-query.js';
import { generateVisibilityQuery } from '../../common/generate-visibility-query.js';
import { generateMutedUserQuery } from '../../common/generate-muted-user-query.js';
import { ApiError } from '../../error.js';
import { generateBlockedUserQuery, generateBlockingUserQuery } from '../../common/generate-block-query.js';
import { generateMutedInstanceQuery } from '../../common/generate-muted-instance-query.js';

export const meta = {
	tags: ['antennas', 'account', 'notes'],

	requireCredential: true,

	kind: 'read:account',

	errors: {
		noSuchAntenna: {
			message: 'No such antenna.',
			code: 'NO_SUCH_ANTENNA',
			id: '850926e0-fd3b-49b6-b69a-b28a5dbd82fe',
		},
	},

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Note',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		antennaId: { type: 'string', format: 'misskey:id' },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		sinceDate: { type: 'integer' },
		untilDate: { type: 'integer' },
	},
	required: ['antennaId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const antenna = await Antennas.findOne({
		id: ps.antennaId,
		userId: user.id,
	});

	if (antenna == null) {
		throw new ApiError(meta.errors.noSuchAntenna);
	}

	const antennaQuery = AntennaNotes.createQueryBuilder('joining')
		.select('joining.noteId')
		.where('joining.antennaId = :antennaId', { antennaId: antenna.id });

	const query = makePaginationQuery(Notes.createQueryBuilder('note'),
			ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
		.andWhere(`note.id IN (${ antennaQuery.getQuery() })`)
		.innerJoinAndSelect('note.user', 'user')
		.leftJoinAndSelect('user.avatar', 'avatar')
		.leftJoinAndSelect('user.banner', 'banner')
		.leftJoinAndSelect('note.reply', 'reply')
		.leftJoinAndSelect('note.renote', 'renote')
		.leftJoinAndSelect('reply.user', 'replyUser')
		.leftJoinAndSelect('replyUser.avatar', 'replyUserAvatar')
		.leftJoinAndSelect('replyUser.banner', 'replyUserBanner')
		.leftJoinAndSelect('renote.user', 'renoteUser')
		.leftJoinAndSelect('renoteUser.avatar', 'renoteUserAvatar')
		.leftJoinAndSelect('renoteUser.banner', 'renoteUserBanner')
		.setParameters(antennaQuery.getParameters());

	generateVisibilityQuery(query, user);
	generateMutedUserQuery(query, user);
	generateBlockingUserQuery(query, user);
	if (user && !user.isAdmin && !user.isModerator) {
		generateBlockedUserQuery(query, user);
	}
	if (user) generateMutedInstanceQuery(query, user);

	const notes = await query
		.take(ps.limit)
		.getMany();

	if (notes.length > 0) {
		readNote(user.id, notes);
	}

	return await Notes.packMany(notes, user);
});
