import { Request, onRequest } from "firebase-functions/v2/https";

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

export const main = onRequest((request, response) => {
  chromane_cors(request, response, () => {});
});
