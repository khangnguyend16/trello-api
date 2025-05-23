import express from "express";
import { boardValidation } from "~/validations/boardValidation";
import { boardController } from "~/controllers/boardController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

Router.route("/")
  .get(authMiddleware.isAuthorized, boardController.getBoards) // get all boards
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew);

Router.route("/:id")
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update); // update

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong 1 board
Router.route("/supports/moving_card").put(
  authMiddleware.isAuthorized,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
);

export const boardRoute = Router;
