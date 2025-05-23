import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });

    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
    next(customError);
  }
};

const update = async (req, res, next) => {
  // Lưu ý không dùng required() trong trường hợp Update
  const correctCondition = Joi.object({
    // Nếu cần làm tính năng di chuyển column sang board khác thì cần validate boardId
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  });

  try {
    // abortEarly: false => trường hợp có nhiều lỗi validation thì trả về tất cả
    // Đối với update, cho phép Unknown để không cần đẩy 1 số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
    next(customError);
  }
};

const deleteItem = async (req, res, next) => {
  // Lưu ý không dùng required() trong trường hợp Update
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  });

  try {
    await correctCondition.validateAsync(req.params);

    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
    next(customError);
  }
};

export const columnValidation = {
  createNew,
  update,
  deleteItem,
};
