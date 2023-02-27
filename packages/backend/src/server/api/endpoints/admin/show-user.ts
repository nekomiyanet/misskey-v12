import define from '../../define.js';
import { Users, UserProfiles } from '@/models/index.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	res: {
		type: 'object',
		nullable: false, optional: false,
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
	const [user, profile] = await Promise.all([
		Users.findOne(ps.userId as string),
		UserProfiles.findOneOrFail(ps.userId),
	]);

	if (user == null || profile == null) {
		throw new Error('user not found');
	}

	if ((me.isModerator && !me.isAdmin) && user.isAdmin) {
		throw new Error('cannot show info of admin');
	}

	const maskedKeys = ['accessToken', 'accessTokenSecret', 'refreshToken'];
	Object.keys(profile.integrations).forEach(integration => {
		maskedKeys.forEach(key => profile.integrations[integration][key] = '<MASKED>');
	});


	if (!me.isAdmin) {
		return {
			isModerator: user.isModerator,
			isSilenced: user.isSilenced,
			isSuspended: user.isSuspended,
			emailVerified: profile.emailVerified,
			isLocalSilenced: user.isLocalSilenced,
			isPrivateSilenced: user.isPrivateSilenced,
			isForceSensitive: user.isForceSensitive,
			isDisabled: user.isDisabled,
		};
	}

	return {
		email: profile.email,
		emailVerified: profile.emailVerified,
		autoAcceptFollowed: profile.autoAcceptFollowed,
		noCrawle: profile.noCrawle,
		alwaysMarkNsfw: profile.alwaysMarkNsfw,
		carefulBot: profile.carefulBot,
		injectFeaturedNote: profile.injectFeaturedNote,
		receiveAnnouncementEmail: profile.receiveAnnouncementEmail,
		integrations: profile.integrations,
		mutedWords: profile.mutedWords,
		mutedInstances: profile.mutedInstances,
		mutingNotificationTypes: profile.mutingNotificationTypes,
		isModerator: user.isModerator,
		isSilenced: user.isSilenced,
		isSuspended: user.isSuspended,
		isLocalSilenced: user.isLocalSilenced,
		isPrivateSilenced: user.isPrivateSilenced,
		isForceSensitive: user.isForceSensitive,
		isDisabled: user.isDisabled,
	};
});
