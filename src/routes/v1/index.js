import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "~/routes/v1/boardRoute";
import { columnRoute } from "~/routes/v1/columnRoute";
import { cardRoute } from "~/routes/v1/cardRoute";
import { userRoute } from "~/routes/v1/userRoute";

const Router = express.Router();

// Check APIs v1/status
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "APIs V1 are ready to use",
    // code: StatusCodes.OK,  // 200
  });
});

// Board APIs
Router.use("/boards", boardRoute);

// Columns APIs
Router.use("/columns", columnRoute);

// Cards APIs
Router.use("/cards", cardRoute);

// Users APIs
Router.use("/users", userRoute);

export const APIs_V1 = Router;
