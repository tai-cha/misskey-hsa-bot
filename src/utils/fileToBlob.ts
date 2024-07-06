import { readFileSync } from 'fs';

export function fileToBlob(filePath: string): Blob {
    // ファイルをバイナリデータとして読み込む
    const fileBuffer = readFileSync(filePath);
    
    // バイナリデータをUint8Arrayに変換
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Blobオブジェクトを作成
    const blob = new Blob([uint8Array]);

    return blob;
}