import cloudinary from "cloudinary";
import streamifier from "streamifier";
import { env } from "~/config/environment";

// Bước cấu hình cloudinary, sử dụng v2 - version 2
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Khởi tạo 1 function upload file lên cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    // Tạo 1 luồng stream upload lên cloudinary
    const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
    // Sử dụng streamifier để chuyển đổi file thành stream
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const CloudinaryProvider = { streamUpload };
