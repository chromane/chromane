import { BackendCodes, BackendResponse } from "chromane/shared/types/types";
import http from "http";
//
async function chromane_cors(req: Request, res: any, callback) {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET,POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    res.set("Access-Control-Allow-Origin", "*");
    callback();
  }
}
//
import config from "@shared/config";
import secrets from "@shared/secrets";
import Backend from "@shared/backend/Backend";
import util from "@common/ts/util";
//
let backend = new Backend(config, secrets);
//
console.log("process.argv", process.argv);
let [arg_1] = process.argv.slice(2);
console.log("arg_1", arg_1);
//
if (arg_1 === "signspaces.launch_video_processing") {
  backend.modules.signspaces?.launch_video_processing();
} else if (arg_1 === "otherwork_llc.run_auto_check_on_interval") {
  backend.modules.otherwork_llc?.run_auto_check_on_interval();
} else if (arg_1 === "otherwork_llc.run_auto_check") {
  backend.modules.otherwork_llc?.run_auto_check();
} else if (arg_1 === "ryan_ghassabian.run_auto_check_on_interval") {
  backend.modules.ryan_ghassabian?.run_auto_check_on_interval();
} else if (arg_1 === "ryan_ghassabian.run_auto_check") {
  backend.modules.ryan_ghassabian?.run_auto_check();
} else if (arg_1 === "chromane.process_videos") {
  backend.modules.chromane?.process_videos();
}
//
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
  } else if (req.url === "/health_check" && req.method === "GET") {
    console.log("pong");
    res.statusCode = 200;
    res.write("pong");
    res.end();
  } else if (
    //
    req.url === "/main/screen_recorder_back.chunk"
  ) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    backend.modules.screen_recorder_back?.chunk(req).then((result: any) => {
      response.statusCode = 200;
      response.write(util.encode_json(result));
      response.end();
    });
  } else if (
    //
    req.url === "/main/bloom.chunk"
  ) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    backend.modules.bloom?.chunk(req).then((result: any) => {
      response.statusCode = 200;
      response.write(util.encode_json(result));
      response.end();
    });
  } else if (req.url === "/main/chromane.upload_video") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    backend.modules.chromane?.upload_video(req).then((result: any) => {
      response.statusCode = 200;
      response.write(util.encode_json(result));
      response.end();
    });
  } else {
    //
    res.setHeader("Access-Control-Allow-Origin", "*");
    //

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
      let request_json: any = util.decode_json(body);
      console.log("request_json");
      console.log(request_json);
      // s.write("OK");
      // s.end();
      let path = request.url.replace("/main/", "").split("?")[0];
      let query_params = url_to_params(request.url);
      console.log("query_params");
      console.log(query_params);
      if (path.includes(".")) {
        let module_name = path.split(".")[0];
        let method_name = path.split(".")[1];
        //
        if (backend.modules[module_name]) {
          if (backend.modules[module_name][method_name]) {
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
            backend.modules[module_name][method_name]
              .apply(backend.modules[module_name], args)
              .then((result) => {
                if (result && result._redirect === true) {
                  response.writeHead(302, {
                    Location: result.location,
                  });
                  response.end();
                } else {
                  response.statusCode = 200;
                  response.write(util.encode_json(result));
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
                  util.encode_json({
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
      } else if (backend[path]) {
        backend[path]
          .call(backend, request)
          .then((result) => {
            if (result._redirect === true) {
              response.writeHead(302, {
                Location: result.location,
              });
              response.end();
            } else {
              response.statusCode = 200;
              response.write(
                util.encode_json({
                  success: true,
                  result,
                })
              );
            }
          })
          .catch((e) => {
            console.log("error", e);
            console.log("error CODE", e.code);
            //
            let error_code;
            if (e.code === "auth/id-token-expired") {
              error_code = "AUTH_TOKEN_EXPIRED";
            } else {
              error_code = "UNKNOWN_ERROR";
            }
            //
            response.statusCode = 200;
            response.write(
              util.encode_json({
                success: false,
                code: error_code,
              })
            );
            //
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
});
//
if (config.mode === "prod") {
  server.listen(80);
  console.log("server.listen(80)");
  //
  for (let module_name in backend.modules) {
    let module = backend.modules[module_name];
    if (module.on_startup) {
      console.log(`calling ${module_name}.on_startup`);
      module.on_startup.apply(module, []);
    }
  }
  //
} else {
  server.listen(8080);
  console.log("server.listen(8080)");
}
