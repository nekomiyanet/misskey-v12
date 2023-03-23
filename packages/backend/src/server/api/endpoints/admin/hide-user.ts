import define from '../../define.js';
import { Users } from '@/models/index.js';
import { User } from '@/models/entities/user.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
	},
	required: ['userId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const user = await Users.findOne(ps.userId as string);

	if (user == null) {
		throw new Error('user not found');
	}

	if (user.isAdmin && !me.isAdmin) {
		throw new Error('cannot hide admin');
	}

	if (user.isModerator && !me.isAdmin) {
		throw new Error('cannot hide moderator');
	}

	await Users.update(user.id, {
		isHidden: true,
	});

	insertModerationLog(me, 'hide', {
		targetId: user.id,
	});

});
