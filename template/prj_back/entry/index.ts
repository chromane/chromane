import init_backend from "@chromane/back/ts/init_backend";
import PrjBackend from "../ts/PrjBackend";
import config from "../../prj_shared/config";
import secrets from "../../.secrets.json";
let backend = new PrjBackend(config, secrets);
init_backend(backend, config.mode);
