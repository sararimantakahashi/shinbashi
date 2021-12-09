

export function encodeKey(key:any) {
  const encoded = Buffer.from(key).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return encoded
}

