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

		destinationAccountForbids: {
			message:
				'Destination account has already moved.',
			code: 'DESTINATION_ACCOUNT_FORBIDS',
			id: 'b5c90186-4ab0-49c8-9bba-a1f766282ba4',
		},

		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: 'fcd2eef9-a9b2-4c4f-8624-038099e90aa5',
		},

		alreadyMoved: {
			message: 'Account was already moved to another account.',
			code: 'ALREADY_MOVED',
			id: 'b234a14e-9ebe-4581-8000-074b3c215962',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		password: { type: 'string' },
		moveToAccount: { type: 'string' },
	},
	required: ['password','moveToAccount'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const profile = await UserProfiles.findOneOrFail(user.id);

	// Compare password
	const same = await bcrypt.compare(ps.password, profile.password!);

	if (!same) {
		throw new ApiError(meta.errors.incorrectPassword);
	}

	// check parameter
	if (!ps.moveToAccount) throw new ApiError(meta.errors.noSuchUser);

	// abort if user has already moved
	if (user.movedToUri !== null) throw new ApiError(meta.errors.alreadyMoved);

	// parse user's input into the destination account
	const { username, host } = Acct.parse(ps.moveToAccount);

	// retrieve the destination account
	const moveTo = await resolveUser(username, host).catch(e => {
		apiLogger.warn(`failed to resolve remote user: ${e}`);
		throw new ApiError(meta.errors.noSuchUser);
	});

	const destination = await getUser(moveTo.id) as ILocalUser | IRemoteUser;
	const newUri = await Users.isLocalUser(moveTo) ? `${config.url}/users/${moveTo.id}` : destination.uri;

	if (destination.movedToUri !== null) throw new ApiError(meta.errors.destinationAccountForbids);

	await Users.update(user.id, {
		movedToUri: newUri
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
