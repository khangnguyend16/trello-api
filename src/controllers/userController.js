import { StatusCodes } from "http-status-codes";
// import ApiError from "~/utils/ApiError";
import { userService } from "~/services/userService";
import ms from "ms";

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);

    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);

    // Xử lý trả về httpOnly cookie cho phía trình duyệt
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"), // Thời gian sống của cookie sẽ để tối đa 14 ngày, tùy dự án. Thời gian sống của cookie khác với thời gian sống của token
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"), // Thời gian sống của cookie sẽ để tối đa 14 ngày, tùy dự án. Thời gian sống của cookie khác với thời gian sống của token
    });

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createNew,
  verifyAccount,
  login,
};
