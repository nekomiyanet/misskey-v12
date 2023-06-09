import define from '../../define.js';
import { sqlLikeEscape } from '@/misc/sql-like-escape.js';
import { Users } from '@/models/index.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	res: {
		type: 'array',
		nullable: false, optional: false,
		items: {
			type: 'object',
			nullable: false, optional: false,
			ref: 'UserDetailed',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		offset: { type: 'integer', default: 0 },
		sort: { type: 'string', enum: ['+follower', '-follower', '+createdAt', '-createdAt', '+updatedAt', '-updatedAt'] },
		state: { type: 'string', enum: ['all', 'available', 'admin', 'moderator', 'adminOrModerator', 'silenced', 'localsilenced', 'privatesilenced', 'forcesensitive', 'disabled', 'hidden', 'suspended', 'cat', 'bot', 'fox'], default: "all" },
		origin: { type: 'string', enum: ['combined', 'local', 'remote'], default: "local" },
		username: { type: 'string', default: null },
		hostname: { type: 'string', default: null },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const query = Users.createQueryBuilder('user');

	switch (ps.state) {
		case 'available': query.where('user.isSuspended = FALSE AND user.isDisabled = FALSE'); break;
		case 'admin': query.where('user.isAdmin = TRUE'); break;
		case 'moderator': query.where('user.isModerator = TRUE'); break;
		case 'adminOrModerator': query.where('user.isAdmin = TRUE OR user.isModerator = TRUE'); break;
		case 'alive': query.where('user.updatedAt > :date', { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) }); break;
		case 'silenced': query.where('user.isSilenced = TRUE'); break;
		case 'localsilenced': query.where('user.isLocalSilenced = TRUE'); break;
		case 'privatesilenced': query.where('user.isPrivateSilenced = TRUE'); break;
		case 'forcesensitive': query.where('user.isForceSensitive = TRUE'); break;
		case 'disabled': query.where('user.isDisabled = TRUE'); break;
		case 'hidden': query.where('user.isHidden = TRUE'); break;
		case 'suspended': query.where('user.isSuspended = TRUE'); break;
		case 'cat': query.where('user.isCat = TRUE'); break;
		case 'bot': query.where('user.isBot = TRUE'); break;
		case 'fox': query.where('user.isFox = TRUE'); break;
	}

	switch (ps.origin) {
		case 'local': query.andWhere('user.host IS NULL'); break;
		case 'remote': query.andWhere('user.host IS NOT NULL'); break;
	}

	if (ps.username) {
		query.andWhere('user.usernameLower like :username', { username: sqlLikeEscape(ps.username.toLowerCase()) + '%' });
	}

	if (ps.hostname) {
		query.andWhere('user.host like :hostname', { hostname: '%' + ps.hostname.toLowerCase() + '%' });
	}

	switch (ps.sort) {
		case '+follower': query.orderBy('user.followersCount', 'DESC'); break;
		case '-follower': query.orderBy('user.followersCount', 'ASC'); break;
		case '+createdAt': query.orderBy('user.createdAt', 'DESC'); break;
		case '-createdAt': query.orderBy('user.createdAt', 'ASC'); break;
		case '+updatedAt': query.orderBy('user.updatedAt', 'DESC', 'NULLS LAST'); break;
		case '-updatedAt': query.orderBy('user.updatedAt', 'ASC', 'NULLS FIRST'); break;
		default: query.orderBy('user.id', 'ASC'); break;
	}

	query.take(ps.limit);
	query.skip(ps.offset);

	const users = await query.getMany();

	return await Users.packMany(users, me, { detail: true });
});
