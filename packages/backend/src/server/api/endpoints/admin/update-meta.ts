import define from '../../define.js';
import { getConnection } from 'typeorm';
import { Meta } from '@/models/entities/meta.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';
import { DB_MAX_NOTE_TEXT_LENGTH } from '@/misc/hard-limits.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireAdmin: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		disableRegistration: { type: 'boolean', nullable: true },
		disableLocalTimeline: { type: 'boolean', nullable: true },
		disableGlobalTimeline: { type: 'boolean', nullable: true },
		useStarForReactionFallback: { type: 'boolean', nullable: true },
		pinnedUsers: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		hiddenTags: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		blockedHosts: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		silencedHosts: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		selfSilencedHosts: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		allowedHosts: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		blockedEmailDomains: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		blockedWords: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		sensitiveWords: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		themeColor: { type: 'string', nullable: true },
		mascotImageUrl: { type: 'string', nullable: true },
		bannerUrl: { type: 'string', nullable: true },
		errorImageUrl: { type: 'string', nullable: true },
		iconUrl: { type: 'string', nullable: true },
		backgroundImageUrl: { type: 'string', nullable: true },
		logoImageUrl: { type: 'string', nullable: true },
		name: { type: 'string', nullable: true },
		description: { type: 'string', nullable: true },
		defaultLightTheme: { type: 'string', nullable: true },
		defaultDarkTheme: { type: 'string', nullable: true },
		localDriveCapacityMb: { type: 'integer' },
		emailRequiredForSignup: { type: 'boolean' },
		enableHcaptcha: { type: 'boolean' },
		hcaptchaSiteKey: { type: 'string', nullable: true },
		hcaptchaSecretKey: { type: 'string', nullable: true },
		enableRecaptcha: { type: 'boolean' },
		recaptchaSiteKey: { type: 'string', nullable: true },
		recaptchaSecretKey: { type: 'string', nullable: true },
		proxyAccountId: { type: 'string', format: 'misskey:id', nullable: true },
		maintainerName: { type: 'string', nullable: true },
		maintainerEmail: { type: 'string', nullable: true },
		pinnedPages: { type: 'array', items: {
			type: 'string',
		} },
		pinnedClipId: { type: 'string', format: 'misskey:id', nullable: true },
		langs: { type: 'array', items: {
			type: 'string',
		} },
		summalyProxy: { type: 'string', nullable: true },
		deeplAuthKey: { type: 'string', nullable: true },
		deeplIsPro: { type: 'boolean' },
		enableTwitterIntegration: { type: 'boolean' },
		twitterConsumerKey: { type: 'string', nullable: true },
		twitterConsumerSecret: { type: 'string', nullable: true },
		enableGithubIntegration: { type: 'boolean' },
		githubClientId: { type: 'string', nullable: true },
		githubClientSecret: { type: 'string', nullable: true },
		enableDiscordIntegration: { type: 'boolean' },
		discordClientId: { type: 'string', nullable: true },
		discordClientSecret: { type: 'string', nullable: true },
		enableEmail: { type: 'boolean' },
		enableServiceWorker: { type: 'boolean' },
		swPublicKey: { type: 'string', nullable: true },
		swPrivateKey: { type: 'string', nullable: true },
		tosUrl: { type: 'string', nullable: true },
		repositoryUrl: { type: 'string' },
		feedbackUrl: { type: 'string' },
		privateMode: { type: 'boolean' },
		secureMode: { type: 'boolean' },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const set = {} as Partial<Meta>;

	if (typeof ps.disableRegistration === 'boolean') {
		set.disableRegistration = ps.disableRegistration;
	}

	if (typeof ps.disableLocalTimeline === 'boolean') {
		set.disableLocalTimeline = ps.disableLocalTimeline;
	}

	if (typeof ps.disableGlobalTimeline === 'boolean') {
		set.disableGlobalTimeline = ps.disableGlobalTimeline;
	}

	if (typeof ps.useStarForReactionFallback === 'boolean') {
		set.useStarForReactionFallback = ps.useStarForReactionFallback;
	}

	if (Array.isArray(ps.pinnedUsers)) {
		set.pinnedUsers = ps.pinnedUsers.filter(Boolean);
	}

	if (Array.isArray(ps.hiddenTags)) {
		set.hiddenTags = ps.hiddenTags.filter(Boolean);
	}

	if (Array.isArray(ps.blockedHosts)) {
		set.blockedHosts = ps.blockedHosts.filter(Boolean).map(x => x.toLowerCase());
	}

	if (Array.isArray(ps.silencedHosts)) {
		set.silencedHosts = ps.silencedHosts.filter(Boolean).map(x => x.toLowerCase());
	}

	if (Array.isArray(ps.selfSilencedHosts)) {
		set.selfSilencedHosts = ps.selfSilencedHosts.filter(Boolean).map(x => x.toLowerCase());
	}

	if (Array.isArray(ps.allowedHosts)) {
		set.allowedHosts = ps.allowedHosts.filter(Boolean).map(x => x.toLowerCase());
	}

	if (Array.isArray(ps.blockedEmailDomains)) {
		set.blockedEmailDomains = ps.blockedEmailDomains.filter(Boolean).map(x => x.toLowerCase());
	}

	if (Array.isArray(ps.blockedWords)) {
		set.blockedWords = ps.blockedWords.filter(Boolean);
	}

	if (Array.isArray(ps.sensitiveWords)) {
		set.sensitiveWords = ps.sensitiveWords.filter(Boolean);
	}

	if (ps.themeColor !== undefined) {
		set.themeColor = ps.themeColor;
	}

	if (ps.mascotImageUrl !== undefined) {
		set.mascotImageUrl = ps.mascotImageUrl;
	}

	if (ps.bannerUrl !== undefined) {
		set.bannerUrl = ps.bannerUrl;
	}

	if (ps.iconUrl !== undefined) {
		set.iconUrl = ps.iconUrl;
	}

	if (ps.backgroundImageUrl !== undefined) {
		set.backgroundImageUrl = ps.backgroundImageUrl;
	}

	if (ps.logoImageUrl !== undefined) {
		set.logoImageUrl = ps.logoImageUrl;
	}

	if (ps.name !== undefined) {
		set.name = ps.name;
	}

	if (ps.description !== undefined) {
		set.description = ps.description;
	}

	if (ps.defaultLightTheme !== undefined) {
		set.defaultLightTheme = ps.defaultLightTheme;
	}

	if (ps.defaultDarkTheme !== undefined) {
		set.defaultDarkTheme = ps.defaultDarkTheme;
	}

	if (ps.localDriveCapacityMb !== undefined) {
		set.localDriveCapacityMb = ps.localDriveCapacityMb;
	}

	if (ps.emailRequiredForSignup !== undefined) {
		set.emailRequiredForSignup = ps.emailRequiredForSignup;
	}

	if (ps.enableHcaptcha !== undefined) {
		set.enableHcaptcha = ps.enableHcaptcha;
	}

	if (ps.hcaptchaSiteKey !== undefined) {
		set.hcaptchaSiteKey = ps.hcaptchaSiteKey;
	}

	if (ps.hcaptchaSecretKey !== undefined) {
		set.hcaptchaSecretKey = ps.hcaptchaSecretKey;
	}

	if (ps.enableRecaptcha !== undefined) {
		set.enableRecaptcha = ps.enableRecaptcha;
	}

	if (ps.recaptchaSiteKey !== undefined) {
		set.recaptchaSiteKey = ps.recaptchaSiteKey;
	}

	if (ps.recaptchaSecretKey !== undefined) {
		set.recaptchaSecretKey = ps.recaptchaSecretKey;
	}

	if (ps.proxyAccountId !== undefined) {
		set.proxyAccountId = ps.proxyAccountId;
	}

	if (ps.maintainerName !== undefined) {
		set.maintainerName = ps.maintainerName;
	}

	if (ps.maintainerEmail !== undefined) {
		set.maintainerEmail = ps.maintainerEmail;
	}

	if (Array.isArray(ps.langs)) {
		set.langs = ps.langs.filter(Boolean);
	}

	if (Array.isArray(ps.pinnedPages)) {
		set.pinnedPages = ps.pinnedPages.filter(Boolean);
	}

	if (ps.pinnedClipId !== undefined) {
		set.pinnedClipId = ps.pinnedClipId;
	}

	if (ps.summalyProxy !== undefined) {
		set.summalyProxy = ps.summalyProxy;
	}

	if (ps.enableTwitterIntegration !== undefined) {
		set.enableTwitterIntegration = ps.enableTwitterIntegration;
	}

	if (ps.twitterConsumerKey !== undefined) {
		set.twitterConsumerKey = ps.twitterConsumerKey;
	}

	if (ps.twitterConsumerSecret !== undefined) {
		set.twitterConsumerSecret = ps.twitterConsumerSecret;
	}

	if (ps.enableGithubIntegration !== undefined) {
		set.enableGithubIntegration = ps.enableGithubIntegration;
	}

	if (ps.githubClientId !== undefined) {
		set.githubClientId = ps.githubClientId;
	}

	if (ps.githubClientSecret !== undefined) {
		set.githubClientSecret = ps.githubClientSecret;
	}

	if (ps.enableDiscordIntegration !== undefined) {
		set.enableDiscordIntegration = ps.enableDiscordIntegration;
	}

	if (ps.discordClientId !== undefined) {
		set.discordClientId = ps.discordClientId;
	}

	if (ps.discordClientSecret !== undefined) {
		set.discordClientSecret = ps.discordClientSecret;
	}

	if (ps.enableEmail !== undefined) {
		set.enableEmail = ps.enableEmail;
	}

	if (ps.errorImageUrl !== undefined) {
		set.errorImageUrl = ps.errorImageUrl;
	}

	if (ps.enableServiceWorker !== undefined) {
		set.enableServiceWorker = ps.enableServiceWorker;
	}

	if (ps.swPublicKey !== undefined) {
		set.swPublicKey = ps.swPublicKey;
	}

	if (ps.swPrivateKey !== undefined) {
		set.swPrivateKey = ps.swPrivateKey;
	}

	if (ps.tosUrl !== undefined) {
		set.ToSUrl = ps.tosUrl;
	}

	if (ps.repositoryUrl !== undefined) {
		set.repositoryUrl = ps.repositoryUrl;
	}

	if (ps.feedbackUrl !== undefined) {
		set.feedbackUrl = ps.feedbackUrl;
	}

	if (ps.deeplAuthKey !== undefined) {
		if (ps.deeplAuthKey === '') {
			set.deeplAuthKey = null;
		} else {
			set.deeplAuthKey = ps.deeplAuthKey;
		}
	}

	if (ps.deeplIsPro !== undefined) {
		set.deeplIsPro = ps.deeplIsPro;
	}

	if (ps.privateMode !== undefined) {
		set.privateMode = ps.privateMode;
	}

	if (ps.secureMode !== undefined) {
		set.secureMode = ps.secureMode;
	}

	await getConnection().transaction(async transactionalEntityManager => {
		const meta = await transactionalEntityManager.findOne(Meta, {
			order: {
				id: 'DESC',
			},
		});

		if (meta) {
			await transactionalEntityManager.update(Meta, meta.id, set);
		} else {
			await transactionalEntityManager.save(Meta, set);
		}
	});

	insertModerationLog(me, 'updateMeta');
});
