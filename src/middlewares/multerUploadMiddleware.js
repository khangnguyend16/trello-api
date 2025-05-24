import { StatusCodes } from "http-status-codes";
import multer from "multer";
import ApiError from "~/utils/ApiError";
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from "~/utils/validators";

// Function kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, cb) => {
  //   console.log("Multer file: ", file);

  // Đối với multer, kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = "File type is invalid. Only accept jpg, jpeg and png";
    return cb(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null);
  }
  // Nếu kiểu file hợp lệ
  return cb(null, true);
};

// Khởi tạo function upload được bọc bởi multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE }, // 10MB
  fileFilter: customFileFilter,
});

export const multerUploadMiddleware = { upload };
