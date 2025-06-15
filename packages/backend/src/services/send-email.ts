import * as nodemailer from 'nodemailer';
import { fetchMeta } from '@/misc/fetch-meta.js';
import Logger from './logger.js';
import config from '@/config/index.js';

export const logger = new Logger('email');

export async function sendEmail(to: string, subject: string, html: string, text: string) {
	const meta = await fetchMeta(true);

	if (!meta.enableEmail) return;

	const iconUrl = `${config.url}/static-assets/mi-white.png`;
	const emailSettingUrl = `${config.url}/settings/email`;

	const configsmtpuser = config.enableSMTPOverride ? (config.smtp.user || null) : (meta.smtpUser || null);
	const configsmtppass = config.enableSMTPOverride ? (config.smtp.pass || null) : (meta.smtpPass || null);
	const configsmtphost = config.enableSMTPOverride ? (config.smtp.host || null) : (meta.smtpHost || null);
	const configsmtpport = config.enableSMTPOverride ? (config.smtp.port || null) : (meta.smtpPort || null);
	const configsmtpuseTLS = config.enableSMTPOverride ? config.smtp.useTLS : meta.smtpSecure;
	const senderaddress = config.enableSMTPOverride ? (config.smtp.senderaddress || null) : (meta.email || null);

	const enableAuth = configsmtpuser != null && configsmtpuser !== '';

	// メールドメインブロックしてたら中断
	const domain: string = to.split('@')[1];

	if (meta.blockedEmailDomains.some(x => domain.endsWith(x))) {
		logger.error(`Blocked Email Domain: ${domain}`);
		return;
	}

	const transporter = nodemailer.createTransport({
		host: configsmtphost,
		port: configsmtpport,
		secure: configsmtpuseTLS,
		ignoreTLS: !enableAuth,
		proxy: config.proxySmtp,
		auth: enableAuth ? {
			user: configsmtpuser,
			pass: configsmtppass,
		} : undefined,
	} as any);

	try {
		// TODO: htmlサニタイズ
		const info = await transporter.sendMail({
			from: senderaddress!,
			to: to,
			subject: subject,
			text: text,
			html: `<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>${ subject }</title>
		<style>
			html {
				background: #eee;
			}

			body {
				padding: 16px;
				margin: 0;
				font-family: sans-serif;
				font-size: 14px;
			}

			a {
				text-decoration: none;
				color: #86b300;
			}
			a:hover {
				text-decoration: underline;
			}

			main {
				max-width: 500px;
				margin: 0 auto;
				background: #fff;
				color: #555;
			}
				main > header {
					padding: 32px;
					background: #86b300;
				}
					main > header > img {
						max-width: 128px;
						max-height: 28px;
						vertical-align: bottom;
					}
				main > article {
					padding: 32px;
				}
					main > article > h1 {
						margin: 0 0 1em 0;
					}
				main > footer {
					padding: 32px;
					border-top: solid 1px #eee;
				}

			nav {
				box-sizing: border-box;
				max-width: 500px;
				margin: 16px auto 0 auto;
				padding: 0 32px;
			}
				nav > a {
					color: #888;
				}
		</style>
	</head>
	<body>
		<main>
			<header>
				<img src="${ meta.logoImageUrl || meta.iconUrl || iconUrl }"/>
			</header>
			<article>
				<h1>${ subject }</h1>
				<div>${ html }</div>
			</article>
			<footer>
				<a href="${ emailSettingUrl }">${ 'Email setting' }</a>
			</footer>
		</main>
		<nav>
			<a href="${ config.url }">${ config.host }</a>
		</nav>
	</body>
</html>`,
		});

		logger.info(`Message sent: ${info.messageId}`);
	} catch (err) {
		logger.error(err as Error);
		throw err;
	}
}
