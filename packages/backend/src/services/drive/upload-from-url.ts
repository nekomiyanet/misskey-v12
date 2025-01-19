import { URL } from 'node:url';
import { addFile } from './add-file.js';
import { User } from '@/models/entities/user.js';
import { driveLogger } from './logger.js';
import { createTemp } from '@/misc/create-temp.js';
import { downloadUrl } from '@/misc/download-url.js';
import { DriveFolder } from '@/models/entities/drive-folder.js';
import { DriveFile } from '@/models/entities/drive-file.js';
import { DriveFiles } from '@/models/index.js';

const logger = driveLogger.createSubLogger('downloader');

type Args = {
	url: string;
	user: { id: User['id']; host: User['host'] } | null;
	folderId?: DriveFolder['id'] | null;
	uri?: string | null;
	sensitive?: boolean;
	force?: boolean;
	isLink?: boolean;
	comment?: string | null;
};

export async function uploadFromUrl({
	url,
	user,
	folderId = null,
	uri = null,
	sensitive = false,
	force = false,
	isLink = false,
	comment = null
}: Args): Promise<DriveFile> {
	// Create temp file
	const [path, cleanup] = await createTemp();

	// write content at URL to temp file
	const { filename: name } = await downloadUrl(url, path);

	// If the comment is same as the name, skip comment
	// (image.name is passed in when receiving attachment)
	if (comment !== null && name === comment) {
		comment = null;
	}

	let driveFile: DriveFile;
	let error;

	try {
		driveFile = await addFile({ user, path, name, comment, folderId, force, isLink, url, uri, sensitive });
		logger.succ(`Got: ${driveFile.id}`);
	} catch (e) {
		error = e;
		logger.error(`Failed to create drive file: ${e}`, {
			url: url,
			e: e,
		});
	}

	// clean-up
	cleanup();

	if (error) {
		throw error;
	} else {
		return driveFile!;
	}
}
