import { URL } from 'node:url';
import S3 from 'aws-sdk/clients/s3.js';
import { getAgentByUrl } from '@/misc/fetch.js';
import config from '@/config/index.js';

export function getS3() {

	const u = config.s3!.endpoint != null
		? `${config.s3!.useSSL ? 'https://' : 'http://'}${config.s3!.endpoint}`
		: `${config.s3!.useSSL ? 'https://' : 'http://'}example.net`;

	return new S3({
		endpoint: config.s3!.endpoint || undefined,
		accessKeyId: config.s3!.accessKey!,
		secretAccessKey: config.s3!.secretKey!,
		region: config.s3!.region || undefined,
		sslEnabled: config.s3!.useSSL,
		s3ForcePathStyle: !config.s3!.endpoint	// AWS with endPoint omitted
			? false
			: config.s3!.options.forcePathStyle,
		httpOptions: {
			agent: getAgentByUrl(new URL(u), !config.s3!.options.useProxy),
		},
	});
}
