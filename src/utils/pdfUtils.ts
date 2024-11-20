// Function to split data URI into chunks of approximately 40KB
export function splitDataUri(dataUri: string): string[] {
  const chunkSize = 40000; // 40KB chunks
  const chunks: string[] = [];
  let position = 0;

  while (position < dataUri.length) {
    chunks.push(dataUri.slice(position, position + chunkSize));
    position += chunkSize;
  }

  return chunks;
}

// Function to compress image
export function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image onto canvas
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Get compressed image data
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = dataUrl;
  });
}