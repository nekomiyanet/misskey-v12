import { publishNoteStream } from '@/services/stream.js';
import renderDelete from '@/remote/activitypub/renderer/delete.js';
import renderAnnounce from '@/remote/activitypub/renderer/announce.js';
import renderUndo from '@/remote/activitypub/renderer/undo.js';
import { renderActivity } from '@/remote/activitypub/renderer/index.js';
import renderTombstone from '@/remote/activitypub/renderer/tombstone.js';
import config from '@/config/index.js';
import { registerOrFetchInstanceDoc } from '../register-or-fetch-instance-doc.js';
import { User, ILocalUser, IRemoteUser } from '@/models/entities/user.js';
import { Note, IMentionedRemoteUsers } from '@/models/entities/note.js';
import { Notes, Users, Instances, DriveFiles } from '@/models/index.js';
import { notesChart, perUserNotesChart, instanceChart } from '@/services/chart/index.js';
import { deliverToFollowers, deliverToUser } from '@/remote/activitypub/deliver-manager.js';
import { countSameRenotes } from '@/misc/count-same-renotes.js';
import { deliverToRelays } from '../relay.js';
import { Brackets, In } from 'typeorm';
import { deleteFile } from '@/services/drive/delete-file.js';

/**
 * 投稿を削除します。
 * @param user 投稿者
 * @param note 投稿
 */
export default async function(user: User, note: Note, quiet = false) {
	const deletedAt = new Date();

	// この投稿を除く指定したユーザーによる指定したノートのリノートが存在しないとき
	if (note.renoteId && (await countSameRenotes(user.id, note.renoteId, note.id)) === 0) {
		Notes.decrement({ id: note.renoteId }, 'renoteCount', 1);
		Notes.decrement({ id: note.renoteId }, 'score', 1);
	}

	if (note.replyId) {
		await Notes.decrement({ id: note.replyId }, 'repliesCount', 1);
	}

	if (!quiet) {
		publishNoteStream(note.id, 'deleted', {
			deletedAt: deletedAt,
		});

		//#region ローカルの投稿なら削除アクティビティを配送
		if (Users.isLocalUser(user) && !note.localOnly) {
			let renote: Note | undefined;

			// if deletd note is renote
			if (note.renoteId && note.text == null && !note.hasPoll && (note.fileIds == null || note.fileIds.length === 0)) {
				renote = await Notes.findOne({
					id: note.renoteId,
				});
			}

			const content = renderActivity(renote
				? renderUndo(renderAnnounce(renote.uri || `${config.url}/notes/${renote.id}`, note), user)
				: renderDelete(renderTombstone(`${config.url}/notes/${note.id}`), user));

			deliverToConcerned(user, note, content);
		}

		// also send delete activity of cascaded notes to stream
		const allCascadingNotes = (await findAllCascadingNotes(note));
		for (const eachCascadingNote of allCascadingNotes) {
			publishNoteStream(eachCascadingNote.id, 'deleted', {
				deletedAt: deletedAt,
			});
		}

		// also deliever delete activity to cascaded notes
		const cascadingNotes = (await findCascadingNotes(note)).filter(note => !note.localOnly); // filter out local-only notes
		for (const cascadingNote of cascadingNotes) {
			if (!cascadingNote.user) continue;
			if (!Users.isLocalUser(cascadingNote.user)) continue;
			const content = renderActivity(renderDelete(renderTombstone(`${config.url}/notes/${cascadingNote.id}`), cascadingNote.user));
			deliverToConcerned(cascadingNote.user, cascadingNote, content);
		}
		//#endregion

		// 統計を更新
		notesChart.update(note, false);
		perUserNotesChart.update(user, note, false);

		if (Users.isRemoteUser(user)) {
			registerOrFetchInstanceDoc(user.host).then(i => {
				Instances.decrement({ id: i.id }, 'notesCount', 1);
				instanceChart.updateNote(i.host, note, false);
			});
		}
	}

	await Notes.delete({
		id: note.id,
		userId: user.id,
	});

	// delete Remote Orphan drive files
	if (note.userHost !== null) {
		const attachedFiles = note.fileIds;
		for (const attachedFile of attachedFiles) {
			if ((attachedFile !== user.avatarId) && (attachedFile !== user.bannerId))	{
				const file = await DriveFiles.findOne(attachedFile);
				const notes = await Notes.createQueryBuilder('note')
					.where(':file = ANY(note.fileIds)', { file: file.id })
					.getMany();
				if (notes.length === 0) {
					deleteFile(file);
				}
			}
		}
	}
}

async function findCascadingNotes(note: Note) {
	const cascadingNotes: Note[] = [];

	const recursive = async (noteId: string) => {
		const query = Notes.createQueryBuilder('note')
			.where('note.replyId = :noteId', { noteId })
			.orWhere(new Brackets(q => {
				q.where('note.renoteId = :noteId', { noteId })
				.andWhere('note.text IS NOT NULL');
			}))
			.leftJoinAndSelect('note.user', 'user');
		const replies = await query.getMany();
		for (const reply of replies) {
			cascadingNotes.push(reply);
			await recursive(reply.id);
		}
	};
	await recursive(note.id);

	return cascadingNotes.filter(note => note.userHost === null); // filter out non-local users
}

async function findAllCascadingNotes(note: Note) {
	const cascadingNotes: Note[] = [];

	const recursive = async (noteId: string) => {
		const query = Notes.createQueryBuilder('note')
			.where('note.replyId = :noteId', { noteId })
			.orWhere(new Brackets(q => {
				q.where('note.renoteId = :noteId', { noteId })
				.andWhere('note.text IS NOT NULL');
			}))
			.leftJoinAndSelect('note.user', 'user');
		const replies = await query.getMany();
		for (const reply of replies) {
			cascadingNotes.push(reply);
			await recursive(reply.id);
		}
	};
	await recursive(note.id);

	return cascadingNotes;
}

async function getMentionedRemoteUsers(note: Note) {
	const where = [] as any[];

	// mention / reply / dm
	const uris = (JSON.parse(note.mentionedRemoteUsers) as IMentionedRemoteUsers).map(x => x.uri);
	if (uris.length > 0) {
		where.push(
			{ uri: In(uris) }
		);
	}

	// renote / quote
	if (note.renoteUserId) {
		where.push({
			id: note.renoteUserId,
		});
	}

	if (where.length === 0) return [];

	return await Users.find({
		where,
	}) as IRemoteUser[];
}

async function deliverToConcerned(user: ILocalUser, note: Note, content: any) {
	const retryable = true;
	deliverToFollowers(user, content);
	deliverToRelays(user, content, retryable);
	const remoteUsers = await getMentionedRemoteUsers(note);
	for (const remoteUser of remoteUsers) {
		deliverToUser(user, content, remoteUser);
	}
}
