import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "./boardRoute";

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

export const APIs_V1 = Router;
