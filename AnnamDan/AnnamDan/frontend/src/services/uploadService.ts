import { api } from "@/api/client";

export interface UploadedImage {
  url: string;
  path: string;
}

export const uploadService = {
  async image(file: File): Promise<UploadedImage> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<UploadedImage>("/upload/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
