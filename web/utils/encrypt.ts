import forge from "node-forge";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Uint64LE } from "int64-buffer";
import { v4 as uuid } from "uuid";
import cryptoScalarmult from "./ed25519";
import * as codec from "./codec";
import { SignInputPINTpl } from "../default";

const ITERATOR_STORAGE_KEY = '__iterator__';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function unix(): number {
  return Math.floor(new Date().getTime() / 1000);
}

export function generateEd25519SessionKeypair(): KeyPair {
  const keypair = forge.pki.ed25519.generateKeyPair();
  const publicKey = Buffer.from(keypair.publicKey)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const privateKey = Buffer.from(keypair.privateKey)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { privateKey, publicKey };
}

export function generateKeypair(data:string) {
  const ed25519 = forge.pki.ed25519;

  const h = forge.md.sha256.create();
  h.update(data);
  const bytes = h.digest().getBytes();
  // console.log('bytes', bytes, bytes.length);

  const buffer = forge.util.createBuffer();
  buffer.putBytes(bytes);
  // console.log('buffer', buffer);

  const nodeBuffer = Buffer.from(buffer.getBytes(), 'binary');
  const seed = new Uint8Array(nodeBuffer);
  // console.log('key seed', seed, seed.length);

  // forge.util.ByteStringBuffer
  const keypair = ed25519.generateKeyPair({seed: seed});
  // console.log('public key', codec.encodeKey(keypair.publicKey))
  // console.log('private key', codec.encodeKey(keypair.privateKey))

  return {
    publicKey: codec.encodeKey(keypair.publicKey),
    privateKey: codec.encodeKey(keypair.privateKey)
  };
}

export function generatePIN(data:string) {
  const h = forge.md.sha256.create();
  h.update(data);
  const bytes = h.digest().getBytes();
  const buffer = forge.util.createBuffer();
  buffer.putBytes(bytes);
  const nodeBuffer = Buffer.from(buffer.getBytes(), 'binary');
  const seed = new Uint8Array(nodeBuffer);
  let sum = 0;
  seed.forEach((x) => {
    sum += x<<16;
  })
  const sumString = sum.toString();
  // console.log(sumString);
  const pin = sumString.slice(sumString.length - 6);
  return pin
}

/**
 * @return the encrypted PIN that generate by sig process
 */
export async function generateEncryptedPIN(web3:any, from:string, privateKey:string, pinTokenBase64:string, sessionId:string) {
  const data = SignInputPINTpl.replace("$ID$", from);
  const sig = await web3.eth.personal.sign(data, from, "");
  const pin = generatePIN(sig)
  // console.log(from, pin, sig);
  const encryptedPin = signEncryptedPin(
    pin,
    pinTokenBase64,
    sessionId,
    privateKey
  );
  return encryptedPin;
}

/**
 * @return the encrypted PIN that generate by sig process
 */
export async function generateEncryptedPINs(web3:any, from:string, privateKey:string, pinTokenBase64:string, sessionId:string, count:number) {
  const data = SignInputPINTpl.replace("$ID$", from);
  const sig = await web3.eth.personal.sign(data, from, "");
  const pin = generatePIN(sig)
  const encryptedPins = [];
  for (let i = 0; i < count; i++) {
    const encryptedPin = signEncryptedPin(
      pin,
      pinTokenBase64,
      sessionId,
      privateKey
    );
    encryptedPins.push(encryptedPin);
  }
  return encryptedPins;
}

function toBuffer(
  content: Record<string, string> | string,
  encoding: BufferEncoding = "utf8"
) {
  if (typeof content === "object") content = JSON.stringify(content);

  return Buffer.from(content, encoding);
}

function base64url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getEd25519Sign(payload:any, privateKey:Buffer) {
  const header = toBuffer({ alg: "EdDSA", typ: "JWT" }).toString("base64");

  payload = base64url(toBuffer(payload));
  const result = [header, payload];
  const sign = base64url(
    Buffer.from(
      forge.pki.ed25519.sign({
        encoding: "utf8",
        message: result.join("."),
        privateKey
      })
    )
  );

  result.push(sign);

  return result.join(".");
}

export function signAuthenticationToken(
  clientId: string,
  sessionId: string,
  privateKey: string,
  method: string,
  uri: string,
  data: Record<string, unknown> | string,
  scp = "FULL",
  expire = unix() + 30 * 60,
  payload: Record<string, unknown> = {}
): string {
  if (typeof data === "object") {
    data = JSON.stringify(data);
    if (data === JSON.stringify({})) {
      data = "";
    }
  } else if (typeof data !== "string") {
    data = "";
  }

  const md = forge.md.sha256.create();

  md.update(forge.util.encodeUtf8(method.toUpperCase() + uri + data));
  const _privateKey = toBuffer(privateKey, "base64");
  // console.log(method, uri, data, md.digest().toHex(), _privateKey.length);

  const jwtPayload = {
    exp: expire,
    iat: unix(),
    jti: uuid(),
    scp: scp || "FULL",
    sid: sessionId,
    sig: md.digest().toHex(),
    uid: clientId,
    ...payload
  };

  return _privateKey.length === 64
    ? getEd25519Sign(jwtPayload, _privateKey)
    : jwt.sign(jwtPayload, privateKey, { algorithm: "RS512" });
}

function scalarMult(curvePriv:any, publicKey:any) {
  curvePriv[0] &= 248;
  curvePriv[31] &= 127;
  curvePriv[31] |= 64;
  const sharedKey = new Uint8Array(32);

  cryptoScalarmult(sharedKey, curvePriv, publicKey);

  return sharedKey;
}

function privateKeyToCurve25519(privateKey:string) {
  const seed = privateKey.slice(0, 32);
  const sha512 = crypto.createHash("sha512");

  sha512.write(seed, "binary");
  const digest = sha512.digest();

  digest[0] &= 248;
  digest[31] &= 127;
  digest[31] |= 64;

  return digest.slice(0, 32);
}

function signEd25519PIN(pinToken:any, privateKey:any) {
  pinToken = Buffer.from(pinToken, "base64");

  return scalarMult(privateKeyToCurve25519(privateKey), pinToken.slice(0, 32));
}

export function signEncryptedPin(
  pin: string,
  pinToken: string,
  sessionId: string,
  privateKey: string,
  iterator: any = ""
) {
  const blockSize = 16;
  const _privateKey = toBuffer(privateKey, "base64");
  const pinKey = signEd25519PIN(pinToken, _privateKey);
  const time = new Uint64LE((Date.now() / 1000) | 0).toBuffer();

  if (iterator == undefined || iterator === "") {
    const iteratorStr = localStorage.getItem(ITERATOR_STORAGE_KEY);
    if (iteratorStr) {
      iterator = parseInt(iteratorStr) + 1000;
    } else {
      iterator = Date.now() * 1000000;
    }
  }

  localStorage.setItem(ITERATOR_STORAGE_KEY, iterator.toString());

  iterator = new Uint64LE(iterator).toBuffer();
  const _pin = Buffer.from(pin, "utf8");
  let buf = Buffer.concat([_pin, Buffer.from(time), Buffer.from(iterator)]);
  const padding = blockSize - (buf.length % blockSize);
  const paddingArray: number[] = [];

  for (let i = 0; i < padding; i++) {
    paddingArray.push(padding);
  }

  buf = Buffer.concat([buf, Buffer.from(paddingArray)]);
  const iv16 = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", pinKey, iv16);

  cipher.setAutoPadding(false);
  let encrypted_pin_buff = cipher.update(buf as any, "utf-8");

  encrypted_pin_buff = Buffer.concat([iv16, encrypted_pin_buff]);

  return Buffer.from(encrypted_pin_buff).toString("base64");
}
