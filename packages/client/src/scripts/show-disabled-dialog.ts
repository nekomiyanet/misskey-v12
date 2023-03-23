import * as os from '@/os';
import { i18n } from '@/i18n';

export function showDisabledDialog() {
	return os.alert({
		type: 'error',
		title: i18n.ts.yourAccountDisabledTitle,
		text: i18n.ts.yourAccountDisabledDescription
	});
}
