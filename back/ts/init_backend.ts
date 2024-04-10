import type BackendDefault from "./BackendDefault";
import { BackendCodes, BackendResponse } from "@chromane/shared/types/types";
import http from "http";
import util from "@chromane/shared/ts/util";
import { decode_json, url_to_params, encode_json } from "@chromane/shared/ts/helpers";

export default function init_backend(backend: BackendDefault, mode) {
  // create server
  let server = http.createServer(function (req, res) {
    //
    let request: any = req;
    let response: any = res;
    //
    console.log("\n");
    console.log("\n");
    console.log("\n");
    console.log(req.url);
    console.log(req.method);
    // console.log(req.headers);
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Max-Age", "3600");
      res.statusCode = 204;
      res.write("");
      res.end();
    } else if (req.url === "/ping" && req.method === "GET") {
      console.log("pong");
      res.statusCode = 200;
      res.write("pong");
      res.end();
    } else {
      //
      res.setHeader("Access-Control-Allow-Origin", "*");
      //
      console.log(request.method, request.url);
      //
      var body = "";
      request.on("readable", () => {
        let read = request.read();
        // console.log("read");
        // console.log(read);
        if (read) {
          body += read;
        }
      });
      request.on("end", () => {
        console.log("body");
        console.log(body);
        let request_json: any = decode_json(body);
        console.log("request_json");
        console.log(request_json);
        // s.write("OK");
        // s.end();
        let path = request.url.replace(/^\//, "").split("?")[0];
        let query_params = url_to_params(request.url);
        console.log("query_params");
        console.log(query_params);
        if (path.includes(".")) {
          let module_name = path.split(".")[0];
          let method_name = path.split(".")[1];
          //
          if (
            //
            backend[module_name] &&
            module_name !== "internal" &&
            module_name !== "private" &&
            module_name !== "protected"
          ) {
            if (backend[module_name][method_name]) {
              console.log("calling");
              console.log(`${module_name}.${method_name}`);
              //
              let args = [] as Array<any>;
              if (request.method === "GET") {
                args = [query_params];
              } else if (
                //
                request_json &&
                request_json.data &&
                util.is_array(request_json.data)
              ) {
                args = request_json.data;
              } else {
                args = [request];
              }
              //
              backend[module_name][method_name]
                .apply(backend[module_name], args)
                .then((result) => {
                  if (result && result._redirect === true) {
                    response.writeHead(302, {
                      Location: result.location,
                    });
                    response.end();
                  } else {
                    response.statusCode = 200;
                    response.write(encode_json(result));
                    response.end();
                  }
                })
                .catch((e) => {
                  console.log("error", e);
                  console.log("error CODE", e.code);
                  let error_code = BackendCodes.UNKNOWN_ERROR;
                  const code: string = e.code || "";
                  if (code === "auth/id-token-expired") {
                    error_code = BackendCodes.AUTH_TOKEN_EXPIRED;
                  } else if (
                    //
                    code.startsWith &&
                    code.startsWith("auth/")
                  ) {
                    error_code = code;
                    // ErrorsBackendCode.UNAUTHORIZED;
                  }
                  response.statusCode = 200;
                  response.write(
                    encode_json({
                      success: false,
                      code: error_code,
                    })
                  );
                  response.end();
                });
            } else {
              response.statusCode = 200;
              response.write(
                util.encode_json({
                  success: false,
                  code: BackendCodes.METHOD_NOT_FOUND,
                })
              );
              response.end();
            }
          } else {
            response.statusCode = 200;
            response.write(
              util.encode_json({
                success: false,
                code: "MODULE_NOT_FOUND",
              })
            );
          }
        } else {
          response.statusCode = 200;
          response.write(
            util.encode_json({
              success: false,
              code: BackendCodes.METHOD_NOT_FOUND,
            })
          );
          response.end();
        }
        //
      });
      //
      //
      // request.body;
      // console.log(request.url);
      // console.log(request.path);
      // console.log(request.body);
      //
      //
    }
    //
  });
  // launch server
  if (mode === "prod") {
    server.listen(80);
    console.log("server.listen(80)");
    //
    // for (let module_name in backend.modules) {
    //   let module = backend.modules[module_name];
    //   if (module.on_startup) {
    //     console.log(`calling ${module_name}.on_startup`);
    //     module.on_startup.apply(module, []);
    //   }
    // }
    //
  } else {
    server.listen(8080);
    console.log("server.listen(8080)");
  }
}
