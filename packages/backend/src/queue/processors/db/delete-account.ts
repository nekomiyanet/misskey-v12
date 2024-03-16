import Bull from 'bull';
import { queueLogger } from '../../logger.js';
import { AccessTokens, DriveFiles, Notes, UserProfiles, Users, UserNotePinings, MessagingMessages, Followings, Mutings, Blockings, RenoteMutings, Notifications, FollowRequests, Antennas, NoteReactions, Clips } from '@/models/index.js';
import { DbUserDeleteJobData } from '@/queue/types.js';
import { Note } from '@/models/entities/note.js';
import { DriveFile } from '@/models/entities/drive-file.js';
import { MoreThan } from 'typeorm';
import { deleteFileSync } from '@/services/drive/delete-file.js';
import { sendEmail } from '@/services/send-email.js';
import { emailDeliver } from '@/queue/index.js';
import deleteFollowing from '@/services/following/delete.js';

const logger = queueLogger.createSubLogger('delete-account');

export async function deleteAccount(job: Bull.Job<DbUserDeleteJobData>): Promise<string | void> {
	logger.info(`Deleting account of ${job.data.user.id} ...`);

	const user = await Users.findOne(job.data.user.id);
	if (user == null) {
		return;
	}

	{ // Reject Follows
		// When deleting a remote account, the account obviously doesn't
		// actually become deleted on its origin server, i.e. unlike a
		// locally deleted account it continues to have access to its home
		// feed and other content. To prevent it from being able to continue
		// to access toots it would receive because it follows local accounts,
		// we have to force it to unfollow them.

		if (!Users.isLocalUser(job.data.user)) {
			const follower = user;

			const followings = await Followings.find({
				followerId: follower.id,
			});

			for (const following of followings) {
				const followee = await Users.findOne({
					id: following.followeeId,
				});

				if (followee == null) {
					throw `Cant find followee ${following.followeeId}`;
				}

				await deleteFollowing(follower, followee, true);
			}
		}
	}

	{ // Undo Follows
		// When deleting a remote account, the account obviously doesn't
    // actually become deleted on its origin server, but following relationships
    // are severed on our end. Therefore, make the remote server aware that the
    // follow relationships are severed to avoid confusion and potential issues
    // if the remote account gets un-suspended.

		if (!Users.isLocalUser(job.data.user)) {
			const followee = user;

			const followers = await Followings.find({
				followeeId: followee.id,
			});

			for (const following of followers) {
				const follower = await Users.findOne({
					id: following.followerId,
				});

				if (follower == null) {
					throw `Cant find follower ${following.followerId}`;
				}

				await deleteFollowing(follower, followee, true);
			}
		}
	}

	{ // Delete notes
		let cursor: Note['id'] | null = null;

		const notesCount = await Notes.createQueryBuilder('note')
    .where('note.userId = :userId', { userId: job.data.user.id })
    .getCount();

		while (true) {
			const notes = await Notes.find({
				where: {
					userId: user.id,
					...(cursor ? { id: MoreThan(cursor) } : {}),
				},
				take: 100,
				order: {
					id: 1,
				},
			}) as Note[];

			if (notes.length === 0) {
				break;
			}

			let userStatus = await Users.findOne(job.data.user.id);
			if (!userStatus.isDeleted) break;

			cursor = notes[notes.length - 1].id;

			for (const note of notes) {
				await Notes.delete(note.id);
				await new Promise(resolve => setTimeout(resolve, 500)); // 0.5秒待機
			}

			let currentNotesCount = await Notes.createQueryBuilder('note')
			.where('note.userId = :userId', { userId: job.data.user.id })
			.getCount();

			let deleteprogress = currentNotesCount === 0 ? 99 : Math.floor(100 - (currentNotesCount / notesCount) * 100);

			job.progress(deleteprogress);
		}

		let userStatus = await Users.findOne(job.data.user.id);
		if (!userStatus.isDeleted) return;

		logger.succ(`All of notes deleted`);
	}

	{ // Delete files
		let cursor: DriveFile['id'] | null = null;

		while (true) {
			const files = await DriveFiles.find({
				where: {
					userId: user.id,
					...(cursor ? { id: MoreThan(cursor) } : {}),
				},
				take: 10,
				order: {
					id: 1,
				},
			}) as DriveFile[];

			if (files.length === 0) {
				break;
			}

			let userStatus = await Users.findOne(job.data.user.id);
			if (!userStatus.isDeleted) break;

			cursor = files[files.length - 1].id;

			for (const file of files) {
				await deleteFileSync(file);
			}
		}

		let userStatus = await Users.findOne(job.data.user.id);
		if (!userStatus.isDeleted) return;

		logger.succ(`All of files deleted`);
	}

	{ // Send email notification
		const profile = await UserProfiles.findOneOrFail(user.id);
		if (profile.email && profile.emailVerified) {
			emailDeliver(profile.email, 'Account deleted',
				`Your account has been deleted.`,
				`Your account has been deleted.`);
		}
	}

	// soft指定されている場合は物理削除しない
	if (job.data.soft) {
		// nop
	} else {
		if (Users.isLocalUser(job.data.user)) {
			await UserProfiles.update(job.data.user.id, {
				description: null,
				email: null,
				emailVerifyCode: null,
				emailVerified: false,
				password: null,
				twoFactorSecret: null,
				twoFactorTempSecret: null,
				twoFactorEnabled: false,
				location: null,
				birthday: null,
				description: null,
				fields: [],
				clientData: {},
				integrations: {},
			});
			await Users.update(job.data.user.id, {
				isDeleted: true,
				isSuspended: true,
				name: null,
				followersCount: 0,
				followingCount: 0,
				notesCount: 0,
				avatarId: null,
				bannerId: null,
			});
			await UserNotePinings.delete({
				userId: job.data.user.id,
			});
			await AccessTokens.delete({
				userId: job.data.user.id,
			});
			await MessagingMessages.delete({
				userId: job.data.user.id,
			});
			await Followings.delete({
				followerId: job.data.user.id,
			});
			await Followings.delete({
				followeeId: job.data.user.id,
			});
			await Mutings.delete({
				muteeId: job.data.user.id,
			});
			await Mutings.delete({
				muterId: job.data.user.id,
			});
			await RenoteMutings.delete({
				muteeId: job.data.user.id,
			});
			await RenoteMutings.delete({
				muterId: job.data.user.id,
			});
			await Blockings.delete({
				blockeeId: job.data.user.id,
			});
			await Blockings.delete({
				blockerId: job.data.user.id,
			});
			await Notifications.delete({
				notifierId: job.data.user.id,
			});
			await Notifications.delete({
				notifieeId: job.data.user.id,
			});
			await FollowRequests.delete({
				followerId: job.data.user.id,
			});
			await FollowRequests.delete({
				followeeId: job.data.user.id,
			});
			await Antennas.delete({
				userId: job.data.user.id,
			});
			await NoteReactions.delete({
				userId: job.data.user.id,
			});
			await Clips.delete({
				userId: job.data.user.id,
			});
		} else {
			await Users.delete(job.data.user.id);
		}
	}

	return 'Account deleted';
}
