import { publishMainStream } from '@/services/stream.js';
import { publishToFollowers } from '@/services/i/update.js';
import { resolveUser } from '@/remote/resolve-user.js';
import * as Acct from '@/misc/acct.js';
import define from '../../define.js';
import config from '@/config/index.js';
import ms from 'ms';
import bcrypt from 'bcryptjs';
import { Users, UserProfiles } from '@/models/index.js';
import { ApiError } from '../../error.js';
import { apiLogger } from '../../logger.js';
import { getUser } from '../../common/getters.js';

export const meta = {
	requireCredential: true,

	secure: true,

	limit: {
		duration: ms('1hour'),
		max: 3,
	},

	errors: {
		incorrectPassword: {
			message: 'Incorrect password.',
			code: 'INCORRECT_PASSWORD',
			id: 'e54c1d7e-e7d6-4103-86b6-0a95069b4ad3',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		password: { type: 'string' },
	},
	required: ['password'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user, me) => {
	const profile = await UserProfiles.findOneOrFail(user.id);

	// Compare password
	const same = await bcrypt.compare(ps.password, profile.password!);

	if (!same) {
		throw new ApiError(meta.errors.incorrectPassword);
	}

	await Users.update(user.id, {
		movedToUri: null
	});

	const iObj = await Users.pack(user.id, user, {
		detail: true,
		includeSecrets: false,
	});

	// Publish meUpdated event
	publishMainStream(user.id, 'meUpdated', iObj);

	// フォロワーにUpdateを配信
	publishToFollowers(user.id);

	return iObj;
});
