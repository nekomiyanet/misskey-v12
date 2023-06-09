import define from '../../../define.js';
import { Announcements } from '@/models/index.js';
import { ApiError } from '../../../error.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	errors: {
		noSuchAnnouncement: {
			message: 'No such announcement.',
			code: 'NO_SUCH_ANNOUNCEMENT',
			id: 'ecad8040-a276-4e85-bda9-015a708d291e',
		},
	},
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
	const announcement = await Announcements.findOne(ps.id);

	if (announcement == null) throw new ApiError(meta.errors.noSuchAnnouncement);

	await Announcements.delete(announcement.id);

	insertModerationLog(me, 'deleteAnnouncements', {
		id: announcement.id,
		title: announcement.title,
		text: announcement.text,
	});
});
