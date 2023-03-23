import define from '../../define.js';
import { Users } from '@/models/index.js';
import { User } from '@/models/entities/user.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';
import { publishUserEvent } from '@/services/stream.js';

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

	if (user.isAdmin) {
		throw new Error('cannot disable admin');
	}

	if (user.isModerator && !me.isAdmin) {
		throw new Error('cannot disable moderator');
	}

	await Users.update(user.id, {
		isDisabled: true,
	});

	insertModerationLog(me, 'disable', {
		targetId: user.id,
	});

	// Terminate streaming
	if (Users.isLocalUser(user)) {
		publishUserEvent(user.id, 'terminate', {});
	}

});
