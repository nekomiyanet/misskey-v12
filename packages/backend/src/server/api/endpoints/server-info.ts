import * as os from 'node:os';
import si from 'systeminformation';
import define from '../define.js';
import config from '@/config/index.js';

export const meta = {
	requireCredential: false,

	tags: ['meta'],
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async () => {
	const memStats = await si.mem();
	const fsStats = await si.fsSize();

	return {
		machine: config.hideServerInfo ? 'Misskey Hosting Server' : os.hostname(),
		cpu: {
			model: config.hideServerInfo ? getRandomCPUModel() : os.cpus()[0].model,
			cores: config.hideServerInfo ? getRandomCPUCores() : os.cpus().length,
		},
		mem: {
			total: config.hideServerInfo ? 7881341952 + Math.floor(Math.random() * 8000000000) : memStats.total,
		},
		fs: {
			total: config.hideServerInfo ? 31525367808 + Math.floor(Math.random() * 6000000000) : fsStats[0].size,
			used: config.hideServerInfo ? 7881341952  + Math.floor(Math.random() * 6000000000) : fsStats[0].used,
		},
	};

	function getRandomCPUModel() {
		const models = [
			'AMD Ryzen 9 7950X',
			'Intel Core i9-9900K',
			'AMD Ryzen 7 5800X',
			'Intel Core i7-10700K',
			'AMD Ryzen 5 5600X',
			'Intel Core i5-11600K',
			'AMD Ryzen 9 5900X',
			'Intel Core i9-11900K',
			'AMD Ryzen Threadripper 3970X',
			'Intel Core i7-11700K'
		];
	  const randomIndex = Math.floor(Math.random() * models.length);
	  return models[randomIndex];
	}

	function getRandomCPUCores() {
	  const minCores = 4;
	  const maxCores = 32;
	  return Math.floor(Math.random() * (maxCores - minCores + 1)) + minCores;
	}

});
