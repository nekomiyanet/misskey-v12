import * as Acct from 'misskey-js/built/acct';
import { i18n } from '@/i18n';
import * as os from '@/os';

export async function lookupUser() {
	const { canceled, result } = await os.inputText({
		title: i18n.ts.usernameOrUserId,
	});
	if (canceled) return;

	const show = (user) => {
		os.pageWindow(`/user-info/${user.id}`);
	};

	const usernamePromise = os.api('users/show', Acct.parse(result));
	const idPromise = os.api('users/show', { userId: result });
	let _notFound = false;
	const notFound = () => {
		if (_notFound) {
			os.alert({
				type: 'error',
				text: i18n.ts.noSuchUser
			});
		} else {
			_notFound = true;
		}
	};
	usernamePromise.then(show).catch(e => {
		if (e.code === 'NO_SUCH_USER') {
			notFound();
		}
	});
	idPromise.then(show).catch(e => {
		notFound();
	});
}

export async function lookupUserByEmail() {
	const { canceled, result } = await os.inputText({
		title: i18n.ts.emailAddress,
		type: 'email',
	});
	if (canceled) return;

	try {
		const user = await os.apiWithDialog('admin/accounts/find-by-email', { email: result });

		os.pageWindow(`/user-info/${user.id}`);
	} catch (err) {
		throw err;
	}
}

export async function lookupFile() {
	const { canceled, result } = await os.inputText({
		title: i18n.ts.fileIdOrUrl,
	});
	if (canceled) return;

	try {
		const file = await os.api('admin/drive/show-file', result.startsWith('http://') || result.startsWith('https://') ? { url: result.trim() } : { fileId: result.trim() });
		os.popup(import('../pages/admin/file-dialog.vue'), {
			fileId: file.id
		}, {}, 'closed');
	} catch (err) {
		if (err.code === 'NO_SUCH_FILE') {
			os.alert({
				type: 'error',
				text: i18n.ts.notFound
			});
		}
	}
}
