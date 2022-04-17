const movie = require("../../routes/movies");
const request = require("supertest");
const { Movie, validate } = require("../../models/movie");
const mongoose = require("mongoose");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

let server;

describe("api/movies", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    server.close;
    await Movie.remove({});
  });
  describe("GET /", () => {
    it("should return all movies", async () => {
      Movie.collection.insertMany([{ name: "movie1" }, { name: "movie2" }]);
      const res = await request(server).get("/api/movies");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });
  describe("/:id", () => {
    it("should return movie if valid id is passed", async () => {
      const movie = new Movie({
        title: "movie1",
        genre: {
          _id: "123456789012",
          name: "horror",
        },
        numberInStock: "1",
        dailyRentalRate: "2",
      });
      await movie.save();

      const res = await request(server).get("/api/movies/" + movie._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", movie.name);
    });
    it("should return 404 if no genre with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/movies/" + id);

      expect(res.status).toBe(404);
    });
  });
});
