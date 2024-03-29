import { default as Xev } from 'xev';
import Channel from '../channel.js';
import config from '@/config/index.js';

const ev = new Xev.default();

export default class extends Channel {
	public readonly chName = 'serverStats';
	public static shouldShare = true;
	public static requireCredential = false;

	constructor(id: string, connection: Channel['connection']) {
		super(id, connection);
		this.onStats = this.onStats.bind(this);
		this.onMessage = this.onMessage.bind(this);
	}

	public async init(params: any) {
		if (config.hideServerInfo) return;
		ev.addListener('serverStats', this.onStats);
	}

	private onStats(stats: any) {
		if (config.hideServerInfo) return;
		this.send('stats', stats);
	}

	public onMessage(type: string, body: any) {
		if (config.hideServerInfo) return;
		switch (type) {
			case 'requestLog':
				ev.once(`serverStatsLog:${body.id}`, statsLog => {
					this.send('statsLog', statsLog);
				});
				ev.emit('requestServerStatsLog', {
					id: body.id,
					length: body.length,
				});
				break;
		}
	}

	public dispose() {
		ev.removeListener('serverStats', this.onStats);
	}
}
