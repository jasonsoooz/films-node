"use strict";

const {createServer} = require("http");
const Router = require("./router");
const isEqual = require('lodash.isequal');

const router = new Router();
let defaultHeaders = {"Content-Type": "text/plain"};


class WebServer {
  constructor() {
    this.films = [];

    this.server = createServer((request, response) => {
        let resolved = router.resolve(this, request);
        if (resolved) {
            resolved.catch(error => {
                if (error.status != null) return error;
                return {body: String(error), status: 500};
            }).then(({body,
                         status = 200,
                         headers = defaultHeaders}) => {
                response.writeHead(status, headers);
                response.end(body);
            });
        } else {
            response.writeHead(404, defaultHeaders);
            response.end(`status: 404, reason: url mapping not found: ${request.url}`);
        }
    });
  }
  start(port) {
      this.server.listen(port);
      console.log(`Listening on port: ${port}`);
  }
  stop() {
      this.server.close();
      console.log("Stopping web server");
  }
}


function readStream(stream) {
  return new Promise((resolve, reject) => {
      let data = "";
      stream.on("error", reject);
      stream.on("data", chunk => data += chunk.toString());
      stream.on("end", () => resolve(data));
  });
}

// const filmPath = /^\/films\/([^\/]*)$/;
const filmPath = /films/;

router.add("GET", filmPath, async (server) => {
  return {body: JSON.stringify(server.films),
          headers: {"Content-Type": "application/json"}};
});

// curl -d '{"year":2004,"title":"Spiderman 2","imdbRating":7.3,"director":"Sam Raimi"}' -H "Content-Type: application/json" -X POST http://localhost:8010/films
router.add("POST", filmPath, async (server, request) => {
  let requestBody = await readStream(request);
  let film;
  try { film = JSON.parse(requestBody); }
  catch (_) { return {status: 400, body: "Invalid JSON"}; }

  if (!film) {
    return {status: 400, body: "Bad comment data"};
  } else {
    server.films.push(film);
    return {status: 201};
  }
});

router.add("DELETE", filmPath, async (server, request) => {
  let requestBody = await readStream(request);
  let film;
  try { film = JSON.parse(requestBody); }
  catch (_) { return {status: 400, body: "Invalid JSON"}; }

  if (!film) {
    return {status: 400, body: "Bad comment data"};
  } else {
    // let filteredFilms = server.films.filter(elem => JSON.stringify(elem) != JSON.stringify(film));
    server.films = server.films.filter(elem => ! isEqual(elem, film));
    return {status: 204};
  }
});

new WebServer().start(8010);