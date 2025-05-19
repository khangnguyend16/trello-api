import { userModel } from "~/models/userModel";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pickUser } from "~/utils/formatters";
import { WEBSITE_DOMAIN } from "~/utils/constants";
// import { BrevoProvider } from "~/providers/BrevoProvider";
import { MailjetProvider } from "~/providers/MailjetProvider";
import { env } from "~/config/environment";
import { JwtProvider } from "~/providers/JwtProvider";

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists"); // 409
    }

    // Tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split("@")[0];
    const newUSer = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 10),
      username: nameFromEmail,
      displayName: nameFromEmail, // mặc định để giống username khi đky mới, về sau làm tính năng update cho user
      verifyToken: uuidv4(),
    };

    // Lưu thông tin user vào database
    const createdUser = await userModel.createNew(newUSer);
    const getNewUser = await userModel.findOneById(createdUser.insertedId);

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject = "Please verify your email before using our services!";
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br/> Khang Nguyen </h3>
    `;

    // Gọi tới Provider gửi mail
    await MailjetProvider.sendEmail(getNewUser.email, customSubject, htmlContent);

    // Return trả về dữ liệu cho phía Controller
    return pickUser(getNewUser);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");

    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your account is already active"); // 406

    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid!");

    // Nếu mọi thứ ok thì chúng ta bắt đầu update lại thông tin của user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null,
    };
    // Thực hiện update thông tin user
    const updatedUser = await userModel.update(existUser._id, updateData);

    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");

    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your account is not active"); // 406

    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your Email or Password is incorrect!");
    }

    /** Nếu mọi thứ ok thì bắt đầu tạo tokens đăng nhập để trả về phía FE */
    // Tạo thông tin để đính kèm trong JWT token: bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email,
    };

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    );
    const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE);

    // Trả về thông tin của user kèm theo 2 tokens vừa tạo
    return { accessToken, refreshToken, ...pickUser(existUser) };
  } catch (error) {
    throw error;
  }
};

export const userService = {
  createNew,
  verifyAccount,
  login,
};
