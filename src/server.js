"use strict";

const {createServer} = require("http");
const Router = require("./router");

const router = new Router();
let defaultHeaders = {"Content-Type": "text/plain"};

const server = createServer((request, response) => {
  let films = [];
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

// const filmPath = /^\/films\/([^\/]*)$/;
const filmPath = /films/;

router.add("GET", filmPath, async (server) => {
  return {body: JSON.stringify({year:"2002", title: "Spiderman",
  imdbRating: "7.3", director:"Sam Raimi"}),
          headers: {"Content-Type": "application/json"}};
  // return {status: 404, body: `No talk '${title}' found`};
});

const port = 8010
server.listen(port);
console.log(`Listening on port: ${port}`);