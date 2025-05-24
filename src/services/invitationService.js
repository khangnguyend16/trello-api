import { invitationModel } from "~/models/invitationModel";
import ApiError from "~/utils/ApiError";
import { userModel } from "~/models/userModel";
import { boardModel } from "~/models/boardModel";
import { pickUser } from "~/utils/formatters";
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from "~/utils/constants";
import { StatusCodes } from "http-status-codes";

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    const inviter = await userModel.findOneById(inviterId);
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    const board = await boardModel.findOneById(reqBody.boardId);

    // Nếu ko tồn tại 1 trong 3 thì reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Inviter, Invitee or Board not found");
    }

    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // Chuyển từ ObjectId sang string vì sang bên model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING, // Default ban đầu là PENDING
      },
    };

    // Gọi sang Model để lưu vào db
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData);
    // Gọi sang Model để lấy lại thông tin invitation mới tạo
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId);

    // Ngoài thông tin của board invitation mới tạo thì trả về đủ luôn board, inviter, invitee
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
    };

    return resInvitation;
  } catch (error) {
    throw error;
  }
};

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId);
    // console.log("getInvitation: ", getInvitations);

    // Vì các dữ liệu inviter, invitee, board đang là mảng 1 phần tử -> nên biến đổi về json object trước khi trả về FE
    const resInvitations = getInvitations.map((i) => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {},
    }));
    return resInvitations;
  } catch (error) {
    throw error;
  }
};

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invitation not found");
    }

    // Sau khi có invitation rồi thì lấy full thông tin của board
    const boardId = getInvitation.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);
    if (!getBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found");
    }

    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString();
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "You are already a member of this board");
    }

    // Tạo dữ liệu để update bản ghi Invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status, // status là ACCEPTED hoặc REJECTED do FE gửi lên
      },
    };

    // Bước 1: Cập nhật status của bản ghi invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData);

    // Bước 2: Nếu status là ACCEPTED thì thêm thông tin userId vào memberIds của board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId);
    }
    return updatedInvitation;
  } catch (error) {
    throw error;
  }
};

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation,
};
