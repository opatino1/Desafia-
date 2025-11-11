
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const parseDataUrl = (dataUrl: string): { data: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL');
  }
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const data = parts[1];
  return { data, mimeType };
};
