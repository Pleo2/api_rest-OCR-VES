import type { FastifyMultipartOptions } from '@fastify/multipart';

function mb(n: number) {
  return n * 1024 * 1024;
}

export function buildMultipartOptions(): FastifyMultipartOptions {
  const maxFileMb = Number(process.env.MULTIPART_MAX_FILE_SIZE_MB || '5');
  const allowedMime = (
    process.env.ACCEPTED_IMAGE_MIME_TYPES ?? 'image/jpeg,image/png,image/webp'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    attachFieldsToBody: false, // Do not attach fields to body
    throwFileSizeLimit: true, // Throw error if file size exceeds limit
    limits: {
      fileSize: mb(Math.max(1, maxFileMb)), // max size per file in MB
      files: Number(process.env.MULTIPART_MAX_FILES ?? 1), // amount of files
      fields: Number(process.env.MULTIPART_MAX_FIELDS ?? 10),
      parts: Number(process.env.MULTIPART_TOTAL_PARTS ?? 20),
    },
    onFile: (_fieldName, stream, _filename, _encoding, mimetype) => {
      if (!allowedMime.includes(mimetype)) {
        stream.destroy(new Error('File type not allowed'));
      }
    },
  };
}
