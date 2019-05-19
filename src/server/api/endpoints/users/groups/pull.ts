import $ from 'cafy';
import { ID } from '../../../../../misc/cafy-id';
import define from '../../../define';
import { ApiError } from '../../../error';
import { getUser } from '../../../common/getters';
import { UserGroups, UserGroupJoinings } from '../../../../../models';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーグループから指定したユーザーを削除します。',
		'en-US': 'Remove a user to a user group.'
	},

	tags: ['groups', 'users'],

	requireCredential: true,

	kind: 'write:user-groups',

	params: {
		groupId: {
			validator: $.type(ID),
		},

		userId: {
			validator: $.type(ID),
			desc: {
				'ja-JP': '対象のユーザーのID',
				'en-US': 'Target user ID'
			}
		},
	},

	errors: {
		noSuchGroup: {
			message: 'No such group.',
			code: 'NO_SUCH_GROUP',
			id: '4662487c-05b1-4b78-86e5-fd46998aba74'
		},

		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '0b5cc374-3681-41da-861e-8bc1146f7a55'
		}
	}
};

export default define(meta, async (ps, me) => {
	// Fetch the group
	const userGroup = await UserGroups.findOne({
		id: ps.groupId,
		userId: me.id,
	});

	if (userGroup == null) {
		throw new ApiError(meta.errors.noSuchGroup);
	}

	// Fetch the user
	const user = await getUser(ps.userId).catch(e => {
		if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new ApiError(meta.errors.noSuchUser);
		throw e;
	});

	// Pull the user
	await UserGroupJoinings.delete({ userId: user.id });
});