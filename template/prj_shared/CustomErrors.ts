import { ErrorsCode } from "./types";

export default class CustomError extends Error {
  code: ErrorsCode;
  constructor(message: string, code: ErrorsCode) {
    super();
    this.message = message;
    this.code = code;
  }

  static unathorized() {
    throw new CustomError("You are not authorized", "unauthorized");
  }
  static apiError() {
    throw new CustomError("API error. Please try again!!!", "api_error");
  }
  static handled(message: string) {
    throw new CustomError(message, "handled");
  }
  static unhandled() {
    throw new CustomError("Something went wrong", "unhandled");
  }

  static handledCode(code: ErrorsCode, message: string) {
    throw new CustomError(message, code);
  }
  static recall() {
    throw new CustomError("", "recall");
  }
}
