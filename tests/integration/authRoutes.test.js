const request = require("supertest");
const { User } = require("../../models/user");
const bcrypt = require("bcrypt");
let server;
describe("/api/users", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    server.close();
    await User.remove({});
  });
  describe("POST / ", () => {
    let name;
    let email;
    let password;
    let isAdmin;
    const exec = async () => {
      return await request(server)
        .post("/api/users")
        .set("x-auth-token", token)
        .send({ name, email, password, isAdmin });
    };
    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "user1";
      email = "email@email";
      password = "12345";
      isAdmin = true;
    });

    it("should return 400 if email is less than 5 characters", async () => {
      email = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 50 characters", async () => {
      email = new Array(257).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is less than 5 characters", async () => {
      password = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 50 characters", async () => {
      password = new Array(257).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid email", async () => {
      email = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if invalid password", async () => {
      password = "123456";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should save the user if it is valid", async () => {
      await exec();

      const user = await User.find({ email: "email@email" });

      expect(user).not.toBeNull();
    });
  });
});
