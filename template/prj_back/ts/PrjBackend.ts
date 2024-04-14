import config from "@shared/config";
import BackendDefault from "@chromane/back/ts/BackendDefault";
import { Firestore } from "@google-cloud/firestore";

class Project {
  db: Firestore;
  backend: BackendDefault;
  constructor(backend: BackendDefault) {
    this.backend = backend;
    this.db = new Firestore({
      projectId: "chromane-swift-quote",
      databaseId: "main",
      credentials: this.backend.internal.secrets.google_service_account,
      // keyFilename: "/path/to/keyfile.json",
    });
  }
}

export default class PrjBackend extends BackendDefault {
  project: Project;
  constructor(config, secrets) {
    super(config, secrets);
    this.project = new Project(this);
  }
}
