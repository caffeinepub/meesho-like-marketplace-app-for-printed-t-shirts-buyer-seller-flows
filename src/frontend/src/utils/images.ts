export function blobToImageUrl(blob: Uint8Array | null | undefined): string {
  if (!blob || blob.length === 0) {
    return '/assets/generated/product-placeholder.dim_800x800.png';
  }

  try {
    const blobObj = new Blob([new Uint8Array(blob)], { type: 'image/jpeg' });
    return URL.createObjectURL(blobObj);
  } catch (error) {
    console.error('Error converting blob to URL:', error);
    return '/assets/generated/product-placeholder.dim_800x800.png';
  }
}

export function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
