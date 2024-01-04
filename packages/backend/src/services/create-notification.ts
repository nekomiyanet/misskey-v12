import { publishMainStream } from '@/services/stream.js';
import pushSw from './push-notification.js';
import { Notifications, Mutings, UserProfiles, Users, Blockings, Notes, UserGroups, UserGroupInvitations } from '@/models/index.js';
import { genId } from '@/misc/gen-id.js';
import { User } from '@/models/entities/user.js';
import { Notification } from '@/models/entities/notification.js';
import { sendEmailNotification } from './send-email-notification.js';
import config from '@/config/index.js';

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

	// Create notification
	const notification = await Notifications.insert({
		id: genId(),
		createdAt: new Date(),
		notifieeId: notifieeId,
		type: type,
		// 相手がこの通知をミュートしているようなら、既読を予めつけておく
		isRead: isMuted,
		...data,
	} as Partial<Notification>)
		.then(x => Notifications.findOneOrFail(x.identifiers[0]));

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
			sendEmailNotification.reply(notifieeId, await Users.findOneOrFail(data.notifierId!), note.text);
		}
		if (type === 'mention') {
			const note = await Notes.findOneOrFail(data.noteId);
			sendEmailNotification.mention(notifieeId, await Users.findOneOrFail(data.notifierId!), note.text);
		}
		if (type === 'quote') {
			const note = await Notes.findOneOrFail(data.noteId);
			const renoteUrl = `${config.url}/notes/${note.renoteId}`;
			sendEmailNotification.quote(notifieeId, await Users.findOneOrFail(data.notifierId!), note.text, renoteUrl);
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
