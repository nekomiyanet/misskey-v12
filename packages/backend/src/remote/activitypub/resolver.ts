import config from '@/config/index.js';
import { getJson } from '@/misc/fetch.js';
import { ILocalUser } from '@/models/entities/user.js';
import { getInstanceActor } from '@/services/instance-actor.js';
import { apGet } from './request.js';
import { IObject, isCollectionOrOrderedCollection, ICollection, IOrderedCollection } from './type.js';
import { fetchMeta } from '@/misc/fetch-meta.js';
import { extractDbHost } from '@/misc/convert-host.js';

export default class Resolver {
	private history: Set<string>;
	private user?: ILocalUser;
	private recursionLimit?: number;

	constructor(recursionLimit = 100) {
		this.history = new Set();
		this.recursionLimit = recursionLimit;
	}

	public getHistory(): string[] {
		return Array.from(this.history);
	}

	public async resolveCollection(value: string | IObject): Promise<ICollection | IOrderedCollection> {
		const collection = typeof value === 'string'
			? await this.resolve(value)
			: value;

		if (isCollectionOrOrderedCollection(collection)) {
			return collection;
		} else {
			throw new Error(`unrecognized collection type: ${collection.type}`);
		}
	}

	public async resolve(value: string | IObject): Promise<IObject> {
		if (value == null) {
			throw new Error('resolvee is null (or undefined)');
		}

		if (typeof value !== 'string') {
			return value;
		}

		if (this.history.has(value)) {
			throw new Error('cannot resolve already resolved one');
		}

		if (this.recursionLimit && this.history.size > this.recursionLimit) {
			throw new Error('hit recursion limit');
		}

		this.history.add(value);

		const meta = await fetchMeta();
		const host = extractDbHost(value);
		if (meta.blockedHosts.some(x => host.endsWith(x))) {
			throw new Error('Instance is blocked');
		}

		if (meta.privateMode && config.host !== host && !meta.allowedHosts.includes(host)) {
			throw new Error('Instance is not allowed');
		}

		if (config.signToActivityPubGet && !this.user) {
			this.user = await getInstanceActor();
		}

		const object = await apGet(value, this.user);

		if (object == null || (
			Array.isArray(object['@context']) ?
				!object['@context'].includes('https://www.w3.org/ns/activitystreams') :
				object['@context'] !== 'https://www.w3.org/ns/activitystreams'
		)) {
			throw new Error('invalid response');
		}

		return object;
	}
}
