import fs from 'fs';

// Helper function to read and write JSON data
export const readData = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
