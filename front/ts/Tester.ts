import { compare } from "@chromane/shared/ts/helpers";

export default class Tester {
  test_function(obj, name, input, expected_output) {
    console.groupCollapsed("_");
    let actual_output = obj[name](input);
    console.groupEnd();
    if (compare(actual_output, expected_output) === true) {
      console.groupCollapsed("%c" + name, "color: green");
    } else {
      console.groupCollapsed("%c" + name, "color: red");
    }
    console.log("input:");
    console.log(input);
    console.log("expected_output:");
    console.log(expected_output);
    console.log("actual_output:");
    console.log(actual_output);
    console.groupEnd();
  }
}
