"use strict";

const {createServer} = require("http");
const Router = require("./router");

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

// const filmPath = /^\/films\/([^\/]*)$/;
const filmPath = /films/;

router.add("GET", filmPath, async (server) => {
  return {body: JSON.stringify(server.films),
          headers: {"Content-Type": "application/json"}};
});

new WebServer().start(8010);