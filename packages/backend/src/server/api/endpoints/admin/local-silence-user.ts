import define from '../../define.js';
import { Users, Followings, FollowRequests } from '@/models/index.js';
import { insertModerationLog } from '@/services/insert-moderation-log.js';
import deleteFollowing from '@/services/following/delete.js';
import { Not, IsNull } from 'typeorm';
import cancelFollowRequest from '@/services/following/requests/cancel.js';
import { rejectFollowRequest } from '@/services/following/reject.js';
import { doPostSuspend } from '@/services/suspend-user.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
		isDelete: { type: 'boolean', default: false },
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
		throw new Error('cannot silence admin');
	}

	await Users.update(user.id, {
		isLocalSilenced: true,
	});

	insertModerationLog(me, 'local-silence', {
		targetId: user.id,
	});

	(async () => {
		if (ps.isDelete) {
			await removeLocalToRemoteFollowAll(user).catch(e => {});
			await removeRemoteToLocalFollowAll(user).catch(e => {});
			await doPostSuspend(user).catch(e => {});
		}
	})();
});

async function removeLocalToRemoteFollowAll(follower: User) {
	// Follow Direction: Local Susupended User to Remote Follower
	if (follower.host != null) return;
	const followings = await Followings.find({
		followerId: follower.id,
		followeeHost: Not(IsNull()),
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

	const requests = await FollowRequests.find({
		followerId: follower.id,
		followeeHost: Not(IsNull()),
	});

	for (const request of requests) {
		const followee = await Users.findOne(request.followeeId);
		if (followee == null) {
			throw `Cant find followee ${following.followeeId}`;
		}
		await cancelFollowRequest(followee, follower);
	}
}

async function removeRemoteToLocalFollowAll(followee: User) {
	// Follow Direction: Remote Follower to Local Susupended User
	if (followee.host != null) return;
	const followings = await Followings.find({
		followeeId: followee.id,
		followerHost: Not(IsNull()),
	});

	for (const following of followings) {
		const follower = await Users.findOne({
			id: following.followerId,
		});

		if (follower == null) {
			throw `Cant find follower ${following.followerId}`;
		}

		await deleteFollowing(follower, followee, true);
	}

	const requests = await FollowRequests.find({
		followeeId: followee.id,
		followerHost: Not(IsNull()),
	});

	for (const request of requests) {
		const follower = await Users.findOne(request.followerId);

		if (follower != null) {
			await rejectFollowRequest(followee, follower);
		}
	}
}
