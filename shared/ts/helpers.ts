export async function wait(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, time);
  });
}

export function decode_jwt(token: string) {
  try {
    if (token) {
      return JSON.parse(atob(token.split(".")[1]));
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}
