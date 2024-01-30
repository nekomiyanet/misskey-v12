/**
 * ユーザーが設定する必要のある情報
 */
export type Source = {
	repository_url?: string;
	feedback_url?: string;
	url: string;
	port: number;
	disableHsts?: boolean;
	db: {
		host: string;
		port: number;
		db: string;
		user: string;
		pass: string;
		disableCache?: boolean;
		extra?: { [x: string]: string };
	};
	redis: {
		host: string;
		port: number;
		pass: string;
		db?: number;
		prefix?: string;
	};
	elasticsearch: {
		host: string;
		port: number;
		ssl?: boolean;
		user?: string;
		pass?: string;
		index?: string;
	};
	s3?: {
		baseUrl: string;
		bucket: string;
		prefix: string;
		endpoint: string;
		region?: string;
		useSSL: boolean;
		accessKey: string;
		secretKey: string;
		options: {
			setPublicRead?: boolean;
			forcePathStyle?: boolean;
			useProxy?: boolean;
		}
	}
	smtp?: {
		host: string;
		port: number;
		useTLS: boolean;
		user: string;
		pass: string;
		senderaddress: string;
	}

	proxy?: string;
	proxySmtp?: string;
	proxyBypassHosts?: string[];

	allowedPrivateNetworks?: string[];

	maxFileSize?: number;

	accesslog?: string;

	clusterLimit?: number;

	id: string;

	outgoingAddressFamily?: 'ipv4' | 'ipv6' | 'dual';

	deliverJobConcurrency?: number;
	inboxJobConcurrency?: number;
	deliverJobPerSec?: number;
	inboxJobPerSec?: number;
	deliverJobMaxAttempts?: number;
	inboxJobMaxAttempts?: number;

	syslog: {
		host: string;
		port: number;
	};

	mediaProxy?: string;
	proxyRemoteFiles?: boolean;

	signToActivityPubGet?: boolean;

	disableFederation?: boolean;
	hideServerInfo?: boolean;
	disableAntenna?: boolean;
	disableSearch?: boolean;
};

/**
 * Misskeyが自動的に(ユーザーが設定した情報から推論して)設定する情報
 */
export type Mixin = {
	version: string;
	host: string;
	hostname: string;
	scheme: string;
	wsScheme: string;
	apiUrl: string;
	wsUrl: string;
	authUrl: string;
	driveUrl: string;
	userAgent: string;
};

export type Config = Source & Mixin;
