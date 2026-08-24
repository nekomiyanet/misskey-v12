import Bull from 'bull';
import { LessThan } from 'typeorm';
import { MutedNotes, AntennaNotes } from '@/models/index.js';
import { genId } from '@/misc/gen-id.js';

import { queueLogger } from '../../logger.js';

const logger = queueLogger.createSubLogger('clean');

export async function clean(job: Bull.Job<Record<string, unknown>>, done: any): Promise<void> {
	logger.info('Cleaning...');

	MutedNotes.delete({
		id: LessThan(genId(new Date(Date.now() - (1000 * 60 * 60 * 24 * 90)))),
	});

	AntennaNotes.delete({
		id: LessThan(genId(new Date(Date.now() - (1000 * 60 * 60 * 24 * 90)))),
	});

	logger.succ('Cleaned.');
	done();
}
