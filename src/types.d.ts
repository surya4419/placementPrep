declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
  }
  export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: object): string;
  export function verify(token: string, secretOrPublicKey: string, options?: object): string | JwtPayload;
  export function decode(token: string, options?: object): null | JwtPayload | string;
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';
  function cookieParser(secret?: string | string[], options?: object): RequestHandler;
  export = cookieParser;
}
