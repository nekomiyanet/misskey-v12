import config from '@/config/index.js';
import { IncomingMessage } from 'http';
import { fetchMeta } from '@/misc/fetch-meta.js';
import httpSignature, { IParsedSignature } from '@peertube/http-signature';
import { URL } from 'url';
import { toPuny } from '@/misc/convert-host.js';
import DbResolver from '@/remote/activitypub/db-resolver.js';
import { getApId } from '@/remote/activitypub/type.js';
import { verify } from 'node:crypto';
import { toSingle } from '@/prelude/array.js';
import { createHash } from 'node:crypto';

export async function checkFetch(req: IncomingMessage): Promise<number> {
	const meta = await fetchMeta();
	if (meta.secureMode || meta.privateMode) {
		if (req.headers.host !== config.host) return 400;

		let signature;

		try {
			signature = httpSignature.parseRequest(req, { headers: ["(request-target)", "host", "date"] });
		} catch (e) {
			return 401;
		}

		const keyId = new URL(signature.keyId);
		const host = toPuny(keyId.hostname);

		if (meta.blockedHosts.some(x => host.endsWith(x))) {
			return 403;
		}

		if (meta.privateMode && host !== config.host && !meta.allowedHosts.includes(host)) {
			return 403;
		}

		const keyIdLower = signature.keyId.toLowerCase();
		if (keyIdLower.startsWith('acct:')) {
			// Old keyId is no longer supported.
			return 401;
		}

		const dbResolver = new DbResolver();

		// HTTP-Signature keyIdを元にDBから取得
		let authUser = await dbResolver.getAuthUserFromKeyId(signature.keyId);

		// keyIdでわからなければ、resolveしてみる
		if (authUser == null) {
			try {
				keyId.hash = '';
				authUser = await dbResolver.getAuthUserFromApId(getApId(keyId.toString()));
			} catch (e) {
				// できなければ駄目
				return 403;
			}
		}

		// publicKey がなくても終了
		if (authUser?.key == null) {
			return 403;
		}

		// もう一回チェック
		if (authUser.user.host !== host) {
			return 403;
		}

		// HTTP-Signatureの検証
		const httpSignatureValidated = httpSignature.verifySignature(signature, authUser.key.keyPem);

		if (!httpSignatureValidated) {
			return 403;
		}

		return verifySignature(signature, authUser.key) ? 200 : 401;
	}
	return 200;
}

export function verifySignature(sig: IParsedSignature, key: UserPublickey): boolean {
	if (!['hs2019', 'rsa-sha256'].includes(sig.algorithm.toLowerCase())) return false;
	try {
		return verify('rsa-sha256', Buffer.from(sig.signingString, 'utf8'), key.keyPem, Buffer.from(sig.params.signature, 'base64'));
	}
	catch {
		// Algo not supported
		return false;
	}
}

export function verifyDigest(body: string, digest: string | string[] | undefined): boolean {
	digest = toSingle(digest);
	if (body == null || digest == null || !digest.toLowerCase().startsWith('sha-256='))
		return false;

	return createHash('sha256').update(body).digest('base64') === digest.substring(8);
}
