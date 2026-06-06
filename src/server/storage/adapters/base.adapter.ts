export interface UploadParams {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface BaseStorageAdapter {
  readonly provider: string;
  upload(params: UploadParams): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}
