/* eslint-disable no-useless-catch */
import { slugify } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { cloneDeep } from "lodash";
import { columnModel } from "~/models/columnModel";
import { cardModel } from "~/models/cardModel";

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };
    // Gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard);

    // Lấy bản ghi board sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án...
    // Bắn email, notification về cho admin khi có 1 cái board mới dc tạo...

    // Trả kq về, trong Service luôn phải có return
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found");
    }

    // Deep Clone board ra 1 cái mới để xử lý, ko ảnh hưởng tới board ban đầu
    const resBoard = cloneDeep(board);

    // Đưa card về đúng column của nó
    resBoard.columns.forEach((column) => {
      // ObjectId trong MongoDB có support method .equals
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id));

      // Cách khác là convert ObjectId về string bằng hàm toString() của Javascript
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString());
    });

    // Xóa mảng cards khỏi board ban đầu
    delete resBoard.cards;

    return resBoard;
  } catch (error) {
    throw error;
  }
};

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now(),
    };
    const updatedBoard = await boardModel.update(boardId, updateData);
    return updatedBoard;
  } catch (error) {
    throw error;
  }
};

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật lại mảng columnCardOrderIds của column ban đầu chứa nó (xóa cái _id của card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now(),
    });

    // B2: Cập nhật mảng cardOrderIds của column tiếp theo (thêm _id của card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now(),
    });

    // B3: Cập nhật lại trường columnId mới của cái card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
    });

    return { updateResult: "Successfully!" };
  } catch (error) {
    throw error;
  }
};

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
};
