import { readFileSync } from 'fs';

export function makeFileMultipart(filePath: string) : File {
  const fileBuffer = readFileSync(filePath);
  const file = new File([fileBuffer], filePath, { type: 'application/octet-stream' });

  return file;
}