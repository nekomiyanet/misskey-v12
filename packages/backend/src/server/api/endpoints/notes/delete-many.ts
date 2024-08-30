import deleteNote from '@/services/note/delete.js';
import { Users } from '@/models/index.js';
import define from '../../define.js';
import { getNote } from '../../common/getters.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,
	requireAdmin: true,

	kind: 'write:notes',

	// Since only admins can use this API endpoint, a rate limit would not
	// apply to them anyway so the rate limit for deletions is not added here.

	errors: {
		noSuchNote: {
			message: 'No such note.',
			code: 'NO_SUCH_NOTE',
			id: '490be23f-8c1f-4796-819f-94cb4f9d1630',
		},

		accessDenied: {
			message: 'Access denied.',
			code: 'ACCESS_DENIED',
			id: 'fe8d7103-0ea8-4ec3-814d-f8b401dc69e9',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteIds: {
			type: 'array',
			uniqueItems: true,
			minItems: 1,
			items: { type: 'string', format: 'misskey:id' },
		},
	},
	required: ['noteIds'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	for (const noteId of ps.noteIds) {
		const note = await getNote(noteId).catch(e => {
			if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new ApiError(meta.errors.noSuchNote);
			throw e;
		});

		if ((!user.isAdmin && !user.isModerator) && (note.userId !== user.id)) {
			throw new ApiError(meta.errors.accessDenied);
		}

		// この操作を行うのが投稿者とは限らない(例えばモデレーター)ため
		await deleteNote(await Users.findOneByOrFail({ id: note.userId }), note);
	}
});
