//

export { default as sCode } from "http-status";

export function join(...params: (string | number)[]): string {
  return params?.join("") ?? "";
}
