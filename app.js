const http = require("http");
const fs = require("fs");
const fsPromise = fs.promises;
const { success, failure } = require("./write/message");
const fetch = require("./manga");
const server = http.createServer((req, res) => {
    const getQueryParams = () => {
        const params = new URLSearchParams(req.url.split("?")[1]);
        const queryParams = {};
        for (const param of params) {
            queryParams[param[0]] = param[1];
        }
        return queryParams;
    };

    function createLogFile(message) {
        const time = new Date().toISOString();
        const text = `${time}:${message}\n`
        fs.appendFile("log.txt", text, (err) => {
            if (err) {
                return { message: "Error writing the file" };
            }

        })
    }

    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    })
    req.on("end", async () => {
        const myUrl = req.url.split("?")[0];
        res.setHeader("Content-Type", "application/json");
        if (req.url === "/products/all" && req.method === "GET") {
            try {
                const result = await fetch.getAll();
                if (result.success) {
                    const jsonData = JSON.parse(result.data);
                    createLogFile("Data has been fetched successfully")
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(success("Data fetched Successfully", jsonData))
                    res.end();
                }

            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" })
                res.write(failure("Internal Server Error"))
                return res.end();
            }
        }
        else if (req.url === "/products/add" && req.method === "POST") {
            try {
                const result = await fetch.add(body);
                if (result.success) {
                    createLogFile("Data has been added successfully")
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(success("Data added successfully", result.data))
                    res.end()
                }
                else if (!result.success) {
                    res.writeHead(500, { "Content-Type": "application/json" })
                    res.write(failure(result.message))
                    res.end();
                }
                else if (result.failure) {
                    res.writeHead(400, { "Content-Type": "application/json" })
                    res.write(failure(result.message));
                    res.end();
                }
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" })
                res.write(failure("Something went wrong!"))
                res.end()
            }
        }

        else if (myUrl === "/products/byId" && req.method === "GET") {
            try {
                const result = await fetch.getById(getQueryParams().id)
                if (result.success) {
                    createLogFile("Data has been fetched by id successfully")
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(success("Data found successfully", result.data))
                    res.end()
                }
                else {
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(failure(result.message))
                    res.end()
                }
            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" })
                res.write(failure("Something went wrong"))
                res.end()
            }
        }

        else if (myUrl === "/products/update" && req.method === "PUT") {
            try {

                const result = await fetch.updatebyId(getQueryParams().id, body);

                if (result.success) {
                    createLogFile("Data has been update successfully")
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.write(success("Successfully updated", result.data));
                    res.end();
                } else {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.write(failure(result.message));
                    res.end();
                }
            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.write(failure("Something went wrong"));
                res.end();
            }
        }

        else if (myUrl === "/products/delete" && req.method === "DELETE") {
            try {
                const result = await fetch.deletebyId(getQueryParams().id)
                if (result.success) {
                    createLogFile("Data has been deleted successfully")
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(success("Data successfully deleted!", result.data))
                    res.end()
                }
                else {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.write(failure(result.message));
                    res.end();
                }
            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.write(failure("Something went wrong"));
                res.end();
            }
        }

        else if (req.url === "/products/deleteAll" && req.method === "DELETE") {
            try {
                const result = await fetch.deleteAll()
                if (result.success) {
                    createLogFile("Data has been deleted successfully")
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(success(result.message))
                    res.end()
                }

            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.write(failure("Something went wrong"));
                res.end();
            }
        }

        else if (myUrl === "/products/searchByname" && req.method === "GET") {
            try {
                const result = await fetch.searchByname(getQueryParams().name)
                if (result.success) {
                    createLogFile("Data has been fetched by name successfully")
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(success("Data is found", result.data))
                    res.end()
                }

            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.write(failure("Something went wrong"));
                res.end();
            }

        }


        else {
            res.writeHead(500, { "Content-Type": "application.json" });
            res.write(failure("URL not found!"));
            return res.end();
        }
    })
})
server.listen(8000, () => {
    console.log(`server running on port ${8000}`);
})