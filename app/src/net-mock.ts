export class Socket {
  on() {}
  write() {}
  end() {}
}
export const connect = function() {};
export const isIP = function() { return false; };
export const isIPv6 = function() { return false; };
export default { Socket, connect, isIP, isIPv6 };
