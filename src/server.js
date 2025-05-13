import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import exitHook from "async-exit-hook";
import { CONNECT_DB, CLOSE_DB, GET_DB } from "~/config/mongodb";
import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware";

const START_SERVER = () => {
  const app = express();

  // Xử lý CORS
  app.use(cors(corsOptions));

  app.use(express.json());

  // Use APIs V1
  app.use("/v1", APIs_V1);

  app.get("/", async (req, res) => {
    res.end("<h1>Hello World!</h1><hr>");
  });

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware);

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Hello ${env.AUTHOR}, Back-end server is running successfully at Host: ${env.APP_HOST} and Port: ${env.APP_PORT}`);
  });

  // Thực hiện các tác vụ clean-up trước khi dừng server (dừng server khi Ctrl+C hoặc process.exit)
  exitHook(() => {
    console.log("4. Server is shutting down...");
    CLOSE_DB();
    console.log("5. Disconnected from MongoDB Cloud Atlas!");
  });
};

// IIFE
(async () => {
  try {
    console.log("1. Connecting to MongoDB Cloud Atlas...");
    await CONNECT_DB();
    console.log("2. Connected to MongoDB Cloud Atlas!");

    // Khởi động server back-end sau khi connect database thành công!
    START_SERVER();
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();

// // Chỉ khi kết nối Database thành công thì mới start server back-end lên
// console.log("1. Connecting to MongoDB Cloud Atlas...");
// CONNECT_DB()
//   .then(() => console.log("2. Connected to MongoDB Cloud Atlas!"))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     {
//       console.error(error);
//       process.exit(0);
//     }
//   });
