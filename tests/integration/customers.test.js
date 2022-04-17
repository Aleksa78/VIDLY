const { Customer } = require("../../models/customer");
const request = require("supertest");
const mongoose = require("mongoose");

let server;

describe("/api/customers", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    server.close();
    await Customer.remove({});
  });
  describe("GET/", () => {
    it("should return all customers", async () => {
      Customer.collection.insertMany([
        { name: "customer1" },
        { name: "customer2" },
      ]);

      const res = await request(server).get("/api/customers");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });
  describe("GET /:id", () => {
    it("should return a customer if valid id is passed", async () => {
      const customer = new Customer({
        name: "customer1",
        isGold: true,
        phone: "063375785",
      });
      await customer.save();

      const res = await request(server).get("/api/customers/" + customer._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("isGold", customer.isGold);
      expect(res.body).toHaveProperty("phone", customer.phone);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/customers/1");

      expect(res.status).toBe(500);
    });

    it("should return 404 if no customers with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/customers/" + id);

      expect(res.status).toBe(404);
    });
  });
  describe("POST /", () => {
    let name;
    let isGold;
    let phone;

    const exec = async () => {
      return await request(server)
        .post("/api/customers")
        .send({ name, isGold, phone });
    };

    beforeEach(() => {
      name = "customer1";
      isGold = true;
      phone = "063375785";
    });

    it("should return 400 if customer is less than 5 characters", async () => {
      name = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer is more than 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the customer if it is valid", async () => {
      await exec();

      const customer = await Customer.find({
        name: "customer1",
        isGold: true,
        phone: "063375785",
      });

      expect(customer).not.toBeNull();
    });

    it("should return the customer if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("isGold", true);
      expect(res.body).toHaveProperty("phone", "063375785");
      expect(res.body).toHaveProperty("name", "customer1");
    });
  });
  describe("PUT /:id", () => {
    let newPhone;
    let newGold;
    let newName;
    let customer;
    let id;

    const exec = async () => {
      return await request(server)
        .put("/api/customers/" + id)
        .send({ name: newName, isGold: newGold, phone: newPhone });
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      customer = new Customer({
        name: "customer1",
        isGold: true,
        phone: "063375785",
      });
      await customer.save();

      id = customer._id;
      newName = "updatedName";
      newGold = false;
      newPhone = "000000000";
    });

    it("should return 400 if customer is less than 5 characters", async () => {
      newName = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer is more than 50 characters", async () => {
      newName = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the customer if input is valid", async () => {
      await exec();

      const updatedCustomer = await Customer.findById(customer.id);

      expect(updatedCustomer.name).toBe(newName);
      expect(updatedCustomer.isGold).toBe(newGold);
      expect(updatedCustomer.phone).toBe(newPhone);
    });

    it("should return the updated customer if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newName);
      expect(res.body).toHaveProperty("isGold", newGold);
      expect(res.body).toHaveProperty("phone", newPhone);
    });
  });
  describe("DELETE /:id", () => {
    let customer;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/customers/" + id)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      customer = new Customer({
        name: "customer1",
        isGold: true,
        phone: "063375785",
      });
      await customer.save();

      id = customer._id;
    });

    it("should return 404 if no customer with the given id was found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the customer if input is valid", async () => {
      await exec();

      const customerInDb = await Customer.findById(id);

      expect(customerInDb).toBeNull();
    });

    it("should return the removed genre", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", customer._id.toHexString());
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
      expect(res.body).toHaveProperty("isGold", customer.isGold);
    });
  });
});
