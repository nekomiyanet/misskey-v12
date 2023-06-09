import { EntityRepository, Repository } from 'typeorm';
import { Instance } from '@/models/entities/instance.js';
import { Packed } from '@/misc/schema.js';
import { sanitizeUrl } from '@/misc/sanitize-url.js';

@EntityRepository(Instance)
export class InstanceRepository extends Repository<Instance> {
	public async pack(
		instance: Instance,
	): Promise<Packed<'FederationInstance'>> {
		return {
			id: instance.id,
			caughtAt: instance.caughtAt.toISOString(),
			host: instance.host,
			usersCount: instance.usersCount,
			notesCount: instance.notesCount,
			followingCount: instance.followingCount,
			followersCount: instance.followersCount,
			latestRequestSentAt: instance.latestRequestSentAt ? instance.latestRequestSentAt.toISOString() : null,
			lastCommunicatedAt: instance.lastCommunicatedAt.toISOString(),
			isNotResponding: instance.isNotResponding,
			isSuspended: instance.isSuspended,
			softwareName: instance.softwareName,
			softwareVersion: instance.softwareVersion,
			openRegistrations: instance.openRegistrations,
			name: instance.name,
			description: instance.description,
			maintainerName: instance.maintainerName,
			maintainerEmail: instance.maintainerEmail,
			iconUrl: sanitizeUrl(instance.iconUrl) ?? null,
			infoUpdatedAt: instance.infoUpdatedAt ? instance.infoUpdatedAt.toISOString() : null,
			latestStatus: instance.latestStatus,
			latestRequestReceivedAt: instance.latestRequestReceivedAt ? instance.latestRequestReceivedAt.toISOString() : null,
		};
	}

	public packMany(
		instances: Instance[],
	) {
		return Promise.all(instances.map(x => this.pack(x)));
	}
}
