import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Uploads storage configuration.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const avatarUploads = path.join(uploadsRoot, 'avatars');

fs.mkdirSync(avatarUploads, { recursive: true });

export const UPLOADS_DIR = uploadsRoot;
export const AVATAR_UPLOAD_DIR = avatarUploads;
