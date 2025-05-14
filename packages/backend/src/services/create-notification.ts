import { publishMainStream } from '@/services/stream.js';
import pushSw from './push-notification.js';
import { Notifications, Mutings, UserProfiles, Users, Blockings, Notes, UserGroups, UserGroupInvitations, Followings } from '@/models/index.js';
import { genId } from '@/misc/gen-id.js';
import { User } from '@/models/entities/user.js';
import { Notification } from '@/models/entities/notification.js';
import { sendEmailNotification } from './send-email-notification.js';
import config from '@/config/index.js';

let silencedUsersCache: Set<string> | null = null;
const CACHE_TTL_MS = 1 * 60 * 1000;
let lastFetchedAt = 0;

export async function getSilencedUsers(): Promise<Set<string>> {
	const now = Date.now();

	if (silencedUsersCache && (now - lastFetchedAt < CACHE_TTL_MS)) return silencedUsersCache;

	const silencedUsers = await Users.find({
		where: { isSilenced: true },
		select: ['id'],
	});
	silencedUsersCache = new Set(silencedUsers.map(user => user.id));
	lastFetchedAt = now;
	return silencedUsersCache;
}

export function clearSilencedUserCache() {
	silencedUsersCache = null;
	lastFetchedAt = 0;
}

export async function createNotification(
	notifieeId: User['id'],
	type: Notification['type'],
	data: Partial<Notification>
) {
	if (data.notifierId && (notifieeId === data.notifierId)) {
		return null;
	}

	const profile = await UserProfiles.findOne({ userId: notifieeId });

	const isMuted = profile?.mutingNotificationTypes.includes(type);

	// Mute For Silenced and non-following Users
	let isMutedForSilenced = false;
	const silencedUserSet = await getSilencedUsers();

	if (data.notifierId && silencedUserSet.has(data.notifierId)) {
		const followingsExists = await Followings.findOne({
			followerId: notifieeId,
			followeeId: data.notifierId,
		});
		if (!followingsExists) {
			isMutedForSilenced = true;
		}
	}

	// Create notification
	const notification = await Notifications.insert({
		id: genId(),
		createdAt: new Date(),
		notifieeId: notifieeId,
		type: type,
		// 相手がこの通知をミュートしているようなら、既読を予めつけておく
		isRead: (isMuted || isMutedForSilenced),
		...data,
	} as Partial<Notification>)
		.then(x => Notifications.findOneOrFail(x.identifiers[0]));

	if (isMutedForSilenced) return notification;

	const packed = await Notifications.pack(notification, {});

	// Publish notification event
	publishMainStream(notifieeId, 'notification', packed);

	// 2秒経っても(今回作成した)通知が既読にならなかったら「未読の通知がありますよ」イベントを発行する
	setTimeout(async () => {
		const fresh = await Notifications.findOne(notification.id);
		if (fresh == null) return; // 既に削除されているかもしれない
		if (fresh.isRead) return;

		//#region ただしミュートかブロックしているユーザーからの通知なら無視
		const mutings = await Mutings.find({
			muterId: notifieeId,
		});
		const blockings = await Blockings.find({
			blockerId: notifieeId,
		});
		if (data.notifierId && mutings.map(m => m.muteeId).includes(data.notifierId)) {
			return;
		}
		if (data.notifierId && blockings.map(m => m.blockeeId).includes(data.notifierId)) {
			return;
		}
		if (data.notifierId) {
			const notifierData = await Users.findOne({
				id: data.notifierId,
			});
			if (notifierData.host != null) {
				if (profile.mutedInstances.includes(notifierData.host)) {
					const updates = {
						isRead: true,
					};
					await Notifications.update({
						notifierId: data.notifierId,
						notifieeId: notifieeId,
					}, updates);
					return;
				}
			}
		}
		//#endregion

		publishMainStream(notifieeId, 'unreadNotification', packed);

		pushSw(notifieeId, 'notification', packed);
		if (type === 'reply') {
			const note = await Notes.findOneOrFail(data.noteId);
			const noteUrl = `${config.url}/notes/${note.id}`;
			sendEmailNotification.reply(notifieeId, await Users.findOneOrFail(data.notifierId!), note.text, noteUrl);
		}
		if (type === 'mention') {
			const note = await Notes.findOneOrFail(data.noteId);
			const noteUrl = `${config.url}/notes/${note.id}`;
			sendEmailNotification.mention(notifieeId, await Users.findOneOrFail(data.notifierId!), note.text, noteUrl);
		}
		if (type === 'quote') {
			const note = await Notes.findOneOrFail(data.noteId);
			const noteUrl = `${config.url}/notes/${note.id}`;
			const renoteUrl = `${config.url}/notes/${note.renoteId}`;
			sendEmailNotification.quote(notifieeId, await Users.findOneOrFail(data.notifierId!), note.text, noteUrl, renoteUrl);
		}
		if (type === 'groupInvited') {
			const invite = await UserGroupInvitations.findOneOrFail(data.userGroupInvitationId);
			const group = await UserGroups.findOneOrFail(invite.userGroupId);
			sendEmailNotification.groupInvited(notifieeId, group.name);
		}
		if (type === 'app') sendEmailNotification.app(notifieeId, data.customHeader, data.customBody);
		if (type === 'follow') sendEmailNotification.follow(notifieeId, await Users.findOneOrFail(data.notifierId!));
		if (type === 'receiveFollowRequest') sendEmailNotification.receiveFollowRequest(notifieeId, await Users.findOneOrFail(data.notifierId!));
	}, 2000);

	return notification;
}
