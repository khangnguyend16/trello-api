import JWT from "jsonwebtoken";
/**
 * Function tạo mới 1 token - cần 3 tham số đầu vào
 * userInfo: thông tin muốn đính kèm vào token
 * secretSignature: chữ ký bí mật (dạng 1 chuỗi string ngẫu nhiên), trên docs để tên là privateKey
 * tokenLife: thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign của jwt thuật toán mặc định là HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: "HS256", expiresIn: tokenLife });
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Function kiểm tra 1 token có hợp lệ không
 * Hợp lệ ở đây hiểu đơn giản là token dc tạo ra có đúng vs cái chữ ký bí mật secretSignature trong dự án hay không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    // hàm verify của thư viện jwt
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken,
};
