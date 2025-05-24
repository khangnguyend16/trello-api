import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import exitHook from "async-exit-hook";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware";
import cookieParser from "cookie-parser";
// Xử lý socket real-time với gói socket.io
import http from "http";
import socketIo from "socket.io";
import { inviteUserToBoardSocket } from "./sockets/inviteUserToBoardSocket";

const START_SERVER = () => {
  const app = express();

  // Fix cái vụ Cache from disk của ExpressJS
  // Trình duyệt không được lưu bất kỳ nội dung nào của response này vào cache, kể cả memory cache lẫn disk cache.
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  // Cấu hình cookie parser
  app.use(cookieParser());

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

  // Tạo 1 server mới bọc app của express để làm real-time với socket.io
  const server = http.createServer(app);
  // Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions });
  io.on("connection", (socket) => {
    // Gọi các socket tùy theo tính năng ở đây
    inviteUserToBoardSocket(socket);

    //...vv
  });

  if (env.BUILD_MODE === "production") {
    // Môi trường Production (cụ thể hiện tại đang support Render.com)
    // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`3. Production: Hello ${env.AUTHOR}, Back-end server is running successfully at Port: ${process.env.PORT}`);
    });
  } else {
    // Môi trường Local Dev
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3. Local DEV: Hello ${env.AUTHOR}, Back-end server is running successfully at Host: ${env.LOCAL_DEV_APP_HOST} and Port: ${env.LOCAL_DEV_APP_PORT}`
      );
    });
  }

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
