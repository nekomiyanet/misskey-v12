import define from '../../define.js';
import bcrypt from 'bcryptjs';
import rndstr from 'rndstr';
import { Users, UserProfiles } from '@/models/index.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			password: {
				type: 'string',
				optional: false, nullable: false,
				minLength: 8,
				maxLength: 8,
			},
		},
	},
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
		throw new Error('cannot reset password of admin');
	}

	if (me.isModerator && user.isModerator) {
		throw new Error('cannot reset password of moderator');
	}

	const passwd = rndstr('a-zA-Z0-9', 8);

	// Generate hash of password
	const hash = bcrypt.hashSync(passwd);

	await UserProfiles.update({
		userId: user.id,
	}, {
		password: hash,
	});

	insertModerationLog(me, 'reset-password', {
		targetId: user.id,
	});

	return {
		password: passwd,
	};
});
