import { StatusCodes } from "http-status-codes";
import { JwtProvider } from "~/providers/JwtProvider";
import { env } from "~/config/environment";
import ApiError from "~/utils/ApiError";

// Middleware này sẽ xác thực JWT accessToken nhận dc từ phía FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phía client - withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken;

  // Nếu như clientAccessToken ko tồn tại -> trả về lỗi
  if (!clientAccessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized (token not found)!")); // 401
  }

  try {
    // B1: Thực hiện giải mã token xem nó có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE);
    // console.log(accessTokenDecoded);

    // B2: Nếu như token hợp lệ, cần phải lưu thông tin giải mã dc vào req.jwtDecoded, để sử dụng cho các tầng cần xử lý phía sau
    req.jwtDecoded = accessTokenDecoded;

    // B3: Cho phép request đi tiếp
    next();
  } catch (error) {
    // console.log("authMiddleware: ", error);
    // Nếu accessToken hết hạn (expired) thì cần trả về 1 mã lỗi GONE - 410 cho FE biết để gọi api refreshToken
    if (error?.message.includes("jwt expired")) {
      return next(new ApiError(StatusCodes.GONE, "Need to refresh token"));
    }

    // Nếu accessToken ko hợp lệ do bất kỳ lý do nào khác thì trả về mã 401 cho FE gọi api sign-out
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
  }
};

export const authMiddleware = { isAuthorized };
