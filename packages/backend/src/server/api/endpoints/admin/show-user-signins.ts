import define from '../../define.js';
import { Users, Signins } from '@/models/index.js';
import { makePaginationQuery } from '../../common/make-pagination-query.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireAdmin: true,

	res: {
		type: 'object',
		nullable: false, optional: false,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    sinceId: { type: 'string', format: 'misskey:id' },
    untilId: { type: 'string', format: 'misskey:id' },
	},
	required: ['userId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
  const user = await Users.findOne(ps.userId as string);

  if (user == null) {
    throw new Error('user not found');
  }

  if ((me.isModerator && !me.isAdmin) && user.isAdmin) {
		throw new Error('cannot show info of admin');
	}

	const query = makePaginationQuery(Signins.createQueryBuilder('signin'), ps.sinceId, ps.untilId)
		.andWhere(`signin.userId = :meId`, { meId: user.id });

	const history = await query.take(ps.limit).getMany();

	return await Promise.all(history.map(record => Signins.pack(record)));
});
