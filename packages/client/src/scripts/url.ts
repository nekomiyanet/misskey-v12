export function query(obj: {}): string {
	const params = Object.entries(obj)
		.filter(([, v]) => Array.isArray(v) ? v.length : v !== undefined)
		.reduce((a, [k, v]) => (a[k] = v, a), {} as Record<string, any>);

	return Object.entries(params)
		.map((e) => `${e[0]}=${encodeURIComponent(e[1])}`)
		.join('&');
}

export function appendQuery(url: string, query: string): string {
	return `${url}${/\?/.test(url) ? url.endsWith('?') ? '' : '&' : '?'}${query}`;
}

export function tryParseUrl(url: string | URL, base?: string | URL): URL | null {
	try {
		return new URL(url, base);
	} catch {
		return null;
	}
}

export function maybeMakeRelative(urlStr: string, baseStr: string): string {
	try {
		const baseObj = new URL(baseStr);
		const urlObj = new URL(urlStr);

		/* in all places where maybeMakeRelative is used, baseStr is the
		 * instance's public URL, which can't have path components, so the
		 * relative URL will always have the whole path from the urlStr
		*/

		if (urlObj.origin === baseObj.origin) {
			return urlObj.pathname + urlObj.search + urlObj.hash;
		}
		return urlStr;
	} catch (e) {
		return urlStr;
	}
}
