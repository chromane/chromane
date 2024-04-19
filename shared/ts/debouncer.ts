import { is_undefined } from "./helpers";
import util from "./util";

class Debouncer {
  keys = {} as any;

  // returns true if the function should run this time
  // if next_ts is not 0 - that means that execution is scheduled
  // for some time in the future
  // continue at least once every interval
  async interval(key, interval_ts) {
    //
    let current_ts = Date.now();
    let info = this.keys[key];
    if (is_undefined(info)) {
      this.keys[key] = {
        last_ts: current_ts,
        waiting_for_next_call: false,
      };
      return true;
    } else {
      if (info.last_ts + interval_ts < current_ts) {
        // last execution was far enough in the past
        // continue
        info.last_ts = current_ts;
        info.waiting_for_next_call = false;
        return true;
      } else if (info.waiting_for_next_call === false) {
        // execution not scheduled, and the last execution
        // was too soon, so return true after a delay
        // the max delay is interval_ts - 1
        info.waiting_for_next_call = true;
        await util.wait(interval_ts - (current_ts - info.last_ts));
        info.waiting_for_next_call = false;
        return true;
      } else {
        // execution already scheduled, don't continue
        return false;
      }
    }
  }
  // this function returns true if no instances
  // with the same key were called in the last delay_ts time
  // don't continue unless this funciton has stopped being executed
  // continuously
  async delay(key, delay_ts) {
    //
    let current_ts = Date.now();
    let info = this.keys[key];
    if (is_undefined(info)) {
      this.keys[key] = {};
      info = this.keys[key];
    }
    //
    info.last_ts = current_ts;
    await util.wait(delay_ts);
    //
    if (current_ts === info.last_ts) {
      return true;
    } else {
      return false;
    }
    //
  }
}

export default new Debouncer();
