import fs from 'fs';

// Helper function to read and write JSON data
export const readData = (file: fs.PathOrFileDescriptor) =>
  JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeData = (
  file: fs.PathOrFileDescriptor,
  data: Record<string, any>,
) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
