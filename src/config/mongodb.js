import { env } from "~/config/environment";

import { MongoClient, ServerApiVersion } from "mongodb";

// Khởi tạo 1 đối tượng trelloDatabaseInstance ban đầu là null (vì chưa connect)
let trelloDatabaseInstance = null;

// Khởi tạo 1 đối tượng mongoClientInstance để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // serverApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể ko cần dùng tới, còn nếu dùng thì ta sẽ chỉ dindnhj 1 Stable API Version của MongoDB
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Kết nối database
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect();

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược lại vào biến trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
};

// Đóng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
  await mongoClientInstance.close();
};

// Function GET_DB (không async) có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error("Must connect to Database first!");
  return trelloDatabaseInstance;
};
