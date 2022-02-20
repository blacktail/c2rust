const open = require("open");
const http = require("http");
const path = require("path");
const { execFile } = require("child_process");

const server = http.createServer((req, res) => {
  let cSourceCode = "";

  req.on("data", (chunk) => {
    cSourceCode += chunk;
  });

  req.on("end", () => {
    // here, call c2rust tool to convert c source code to rust code
    console.log("\nInput Code\n", cSourceCode);

    const child = execFile(
      path.join(__dirname, "../c2rust"),
      [cSourceCode],
      (error, stdout, stderr) => {
        if (error) {
          throw error;
        }

        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        });
        res.write(stdout);
        res.end();

        console.log("\nTranslated Code\n", stdout);
      }
    );
  });
});

server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.listen(3010);
open(path.join(__dirname, "../index.html"), { wait: true });
console.log("Open Browser successfully");
