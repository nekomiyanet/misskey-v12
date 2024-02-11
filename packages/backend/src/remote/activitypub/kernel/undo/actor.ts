import { apLogger } from '../../logger.js';
import { IRemoteUser } from '@/models/entities/user.js';
import { Users } from '@/models/index.js';

const logger = apLogger;

export async function undoDeleteActor(actor: IRemoteUser, uri: string): Promise<string> {
	logger.info(`Stop Deleting the Actor: ${uri}`);

	if (actor.uri !== uri) {
		return `skip: undo delete actor ${actor.uri} !== ${uri}`;
	}

	if (!actor.isDeleted) {
		logger.info(`skip: not deleted`);
	}

	await Users.update(actor.id, {
		isDeleted: false,
	});

	return `ok: stopped`;
}
