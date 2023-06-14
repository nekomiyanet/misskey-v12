import Bull from 'bull';
import { queueLogger } from '../logger.js';
import { Notes, Users } from '@/models/index.js';
import { DeleteNoteJobData } from '@/queue/types.js';
import deleteNote from '@/services/note/delete.js';

const logger = queueLogger.createSubLogger('delete-note');

export async function createDeleteNote(job: Bull.Job<DeleteNoteJobData>, done: any): Promise<void>  {
	logger.info(`deleting note ${job.data.noteId} ...`);

	const note = await Notes.findOne(job.data.noteId);
	if (note == null) {
		done();
		return;
	}

	const user = await Users.findOne(note.userId);
	if (user == null) {
		done();
		return;
	}

	await deleteNote(user, note);

	logger.succ(`deleted note: ${note.id}`);
	done();
}
