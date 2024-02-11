import { IRemoteUser } from '@/models/entities/user.js';
import {IUndo, isFollow, isBlock, isLike, isAnnounce, getApType, isAccept, validActor} from '../../type.js';
import unfollow from './follow.js';
import unblock from './block.js';
import undoLike from './like.js';
import undoAccept from './accept.js';
import { undoDeleteActor } from './actor.js';
import { undoAnnounce } from './announce.js';
import Resolver from '../../resolver.js';
import { apLogger } from '../../logger.js';

const logger = apLogger;

export default async (actor: IRemoteUser, activity: IUndo): Promise<string> => {
	if ('actor' in activity && actor.uri !== activity.actor) {
		throw new Error('invalid actor');
	}

	const uri = activity.id || activity;

	logger.info(`Undo: ${uri}`);

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch(e => {
		logger.error(`Resolution failed: ${e}`);
		throw e;
	});

	const apid = getApId(activity.object);

	if (isFollow(object)) return await unfollow(actor, object);
	if (isBlock(object)) return await unblock(actor, object);
	if (isLike(object)) return await undoLike(actor, object);
	if (isAnnounce(object)) return await undoAnnounce(actor, object);
	if (isAccept(object)) return await undoAccept(actor, object);
	if (validActor.includes(object.type)) return await undoDeleteActor(actor, apid);

	return `skip: unknown object type ${getApType(object)}`;
};
