import Koa from 'koa';
import rndstr from 'rndstr';
import bcrypt from 'bcryptjs';
import { fetchMeta } from '@/misc/fetch-meta.js';
import { verifyHcaptcha, verifyRecaptcha } from '@/misc/captcha.js';
import { Users, RegistrationTickets, UserPendings } from '@/models/index.js';
import { signup } from '../common/signup.js';
import config from '@/config/index.js';
import { sendEmail } from '@/services/send-email.js';
import { emailDeliver } from '@/queue/index.js';
import { genId } from '@/misc/gen-id.js';
import { validateEmailForAccount } from '@/services/validate-email-for-account.js';
import { limiter } from '../limiter.js';
import { getIpHash } from '@/misc/get-ip-hash.js';

export default async (ctx: Koa.Context) => {
	const body = ctx.request.body;

	function error(status: number, error: { id: string }) {
		ctx.status = status;
		ctx.body = { error };
	}

	try {
		// not more than 1 attempt per second and not more than 5 attempts per hour
		await limiter({ key: 'signup', duration: 60 * 60 * 1000, max: 5, minInterval: 1000 }, getIpHash(ctx.ip));
	} catch (err) {
		ctx.status = 429;
		ctx.body = {
			error: {
				message: 'Too many attempts to sign up. Try again later.',
				code: 'TOO_MANY_AUTHENTICATION_FAILURES',
				id: '22d05606-fbcf-421a-a2db-b32610dcfd1b',
			},
		};
		return;
	}

	const instance = await fetchMeta(true);

	// Verify *Captcha
	// ただしテスト時はこの機構は障害となるため無効にする
	if (process.env.NODE_ENV !== 'test') {
		if (instance.enableHcaptcha && instance.hcaptchaSecretKey) {
			await verifyHcaptcha(instance.hcaptchaSecretKey, body['hcaptcha-response']).catch(e => {
				ctx.throw(400, e);
			});
		}

		if (instance.enableRecaptcha && instance.recaptchaSecretKey) {
			await verifyRecaptcha(instance.recaptchaSecretKey, body['g-recaptcha-response']).catch(e => {
				ctx.throw(400, e);
			});
		}
	}

	const username = body['username'];
	const password = body['password'];
	const host: string | null = process.env.NODE_ENV === 'test' ? (body['host'] || null) : null;
	const invitationCode = body['invitationCode'];
	const emailAddress = body['emailAddress'];

	if (instance.emailRequiredForSignup) {
		if (emailAddress == null || typeof emailAddress !== 'string') {
			ctx.status = 400;
			return;
		}

		const available = await validateEmailForAccount(emailAddress);
		if (!available.available) {
			ctx.status = 400;
			return;
		}
	}

	if (instance.disableRegistration) {
		if (invitationCode == null || typeof invitationCode !== 'string') {
			ctx.status = 400;
			return;
		}

		const ticket = await RegistrationTickets.findOne({
			code: invitationCode,
		});

		if (ticket == null) {
			ctx.status = 400;
			return;
		}

		RegistrationTickets.delete(ticket.id);
	}

	if (instance.emailRequiredForSignup) {
		const code = rndstr('a-z0-9', 16);

		// Generate hash of password
		const salt = await bcrypt.genSalt(8);
		const hash = await bcrypt.hash(password, salt);

		await UserPendings.insert({
			id: genId(),
			createdAt: new Date(),
			code,
			email: emailAddress,
			username: username,
			password: hash,
		});

		const link = `${config.url}/signup-complete/${code}`;

		emailDeliver(emailAddress, 'Signup',
			`To complete signup, please click this link:<br><a href="${link}">${link}</a>`,
			`To complete signup, please click this link: ${link}`);

		ctx.status = 204;
	} else {
		try {
			const { account, secret } = await signup({
				username, password, host,
			});

			const res = await Users.pack(account, account, {
				detail: true,
				includeSecrets: true,
			});

			(res as any).token = secret;

			ctx.body = res;
		} catch (e) {
			ctx.throw(400, e);
		}
	}
};
