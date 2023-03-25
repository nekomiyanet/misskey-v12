export function isBlockeeUserRelated(note: any, blockeeUserIds: Set<string>): boolean {
	if (blockeeUserIds.has(note.userId)) {
		return true;
	}

	if (note.reply != null && blockeeUserIds.has(note.reply.userId)) {
		return true;
	}

	if (note.renote != null && blockeeUserIds.has(note.renote.userId)) {
		return true;
	}

	return false;
}
