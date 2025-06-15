import { browserCrypto as crypto, Buffer } from './browserCrypto.js';
import keccak from './SHA3Keccak.js';

// Modular exponentiation: (base^exp) % mod
function modPow(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    base = (base * base) % mod;
    exp /= 2n;
  }
  return result;
}

// Generate a random BigInt in range [min, max]
function randomBigIntBetween(min, max) {
  const range = max - min + 1n;
  const byteLength = Math.ceil(range.toString(2).length / 8);
  let rnd;
  do {
    const bytes = crypto.randomBytes(byteLength);
    rnd = BigInt('0x' + bytes.toString('hex'));
  } while (rnd >= range);
  return rnd + min;
}

// Miller-Rabin probabilistic primality test
function isProbablyPrime(n, k = 5) {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  let r = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    r += 1n;
  }

  for (let i = 0; i < k; i++) {
    const a = randomBigIntBetween(2n, n - 2n);
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let continueLoop = false;
    for (let j = 0n; j < r - 1n; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        continueLoop = true;
        break;
      }
    }
    if (!continueLoop) return false;
  }

  return true;
}

// Generate a random BigInt with the specified number of bits
function randomBigInt(bits) {
  const bytes = Math.ceil(bits / 8);
  const buf = crypto.randomBytes(bytes);
  buf.data[0] |= 0b10000000; // Set top bit to ensure bit length
  buf.data[buf.data.length - 1] |= 1; // Ensure odd number
  return BigInt('0x' + buf.toString('hex'));
}

// Generate a cryptographically secure prime number
async function generatePrime(bits = 512) {
  let prime;
  do {
    prime = randomBigInt(bits);
  } while (!isProbablyPrime(prime));
  return prime;
}

function longToBytes(n) {
  if (n === 0n) return Buffer.from([0]);
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex; // pad to even length
  return Buffer.from(hex, 'hex');
}

function bytesToLong(buf) {
  return BigInt('0x' + buf.toString('hex'));
}

function bytesToBase64(buf) {
  return buf.toString('base64');
}

function base64ToBytes(base64) {
  return Buffer.from(base64, 'base64');
}

function modInverse(a, m) {
  let m0 = m, t, q;
  let x0 = 0n, x1 = 1n;
  if (m === 1n) return 0n;
  while (a > 1n) {
    q = a / m;
    t = m;
    m = a % m;
    a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }
  if (x1 < 0n) x1 += m0;
  return x1;
}

// Generate RSA key pair
async function generateKeyPair(bits = 1024) {
  const p = await generatePrime(bits / 2);
  const q = await generatePrime(bits / 2);
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const e = 65537n; // Common public exponent
  const d = modInverse(e, phi);

  const keyPair = {
    publicKey: { 
      e: bytesToBase64(longToBytes(e)),
      n: bytesToBase64(longToBytes(n))
    },
    privateKey: { 
      d: bytesToBase64(longToBytes(d)),
      n: bytesToBase64(longToBytes(n))
    }
  };

  return {
    publicKey: Buffer.from(JSON.stringify(keyPair.publicKey)).toString('base64'),
    privateKey: Buffer.from(JSON.stringify(keyPair.privateKey)).toString('base64')
  };
}

// Generate a deterministic random BigInt from a seed
async function seededRandomBigInt(seed, min, max) {
  const range = max - min + 1n;
  const byteLength = Math.ceil(range.toString(2).length / 8);
  
  // Create a deterministic hash from the seed
  const hasher = crypto.createHash('sha256');
  hasher.update(seed);
  const hash = await hasher.digest();
  let rnd = BigInt('0x' + hash.toString('hex'));
  
  // Ensure the number is within range
  rnd = rnd % range;
  return rnd + min;
}

// Generate a deterministic prime number from a seed
async function generateSeededPrime(seed, bits = 1024) {
  const bytes = Math.ceil(bits / 8);
  const hasher = crypto.createHash('sha256');
  hasher.update(seed);
  const hash = await hasher.digest();
  const buf = Buffer.from(hash.toString('hex'), 'hex');
  buf.data[0] |= 0b10000000; // Set top bit to ensure bit length
  buf.data[buf.data.length - 1] |= 1; // Ensure odd number
  
  let prime = BigInt('0x' + buf.toString('hex'));
  while (!isProbablyPrime(prime)) {
    // If not prime, generate next candidate using the previous number as seed
    const nextSeed = prime.toString();
    const nextHasher = crypto.createHash('sha256');
    nextHasher.update(nextSeed);
    const nextHash = await nextHasher.digest();
    const nextBuf = Buffer.from(nextHash.toString('hex'), 'hex');
    nextBuf.data[0] |= 0b10000000;
    nextBuf.data[nextBuf.data.length - 1] |= 1;
    prime = BigInt('0x' + nextBuf.toString('hex'));
  }
  return prime;
}

// Generate RSA key pair from a seed
async function generateKeyPairFromSeed(seed, bits = 1024) {
  // Generate first prime
  const p = await generateSeededPrime(seed, bits / 2);
  
  // Generate second prime using the first prime as part of the seed
  const secondSeed = seed + p.toString();
  const q = await generateSeededPrime(secondSeed, bits / 2);
  
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const e = 65537n; // Common public exponent
  const d = modInverse(e, phi);

  const keyPair = {
    publicKey: { 
      e: bytesToBase64(longToBytes(e)),
      n: bytesToBase64(longToBytes(n))
    },
    privateKey: { 
      d: bytesToBase64(longToBytes(d)),
      n: bytesToBase64(longToBytes(n))
    }
  };

  return {
    publicKey: Buffer.from(JSON.stringify(keyPair.publicKey)).toString('base64'),
    privateKey: Buffer.from(JSON.stringify(keyPair.privateKey)).toString('base64')
  };
}

// RSA Encryption
function encrypt(message, publicKeyBase64) {
  const publicKey = JSON.parse(Buffer.from(publicKeyBase64, 'base64').toString());
  const e = bytesToLong(base64ToBytes(publicKey.e));
  const n = bytesToLong(base64ToBytes(publicKey.n));
  const messageBigInt = bytesToLong(Buffer.from(message));
  const encrypted = modPow(messageBigInt, e, n);
  return bytesToBase64(longToBytes(encrypted));
}

// RSA Decryption
function decrypt(encryptedMessage, privateKeyBase64) {
  const privateKey = JSON.parse(Buffer.from(privateKeyBase64, 'base64').toString());
  const d = bytesToLong(base64ToBytes(privateKey.d));
  const n = bytesToLong(base64ToBytes(privateKey.n));
  const encryptedBigInt = bytesToLong(base64ToBytes(encryptedMessage));
  const decrypted = modPow(encryptedBigInt, d, n);
  return longToBytes(decrypted).toString();
}

// RSA Signing
function sign(message, privateKeyBase64) {
  const privateKey = JSON.parse(Buffer.from(privateKeyBase64, 'base64').toString());
  const d = bytesToLong(base64ToBytes(privateKey.d));
  const n = bytesToLong(base64ToBytes(privateKey.n));
  const messageBuffer = Buffer.from(message, 'utf8');
  const messageBytes = Array.from(messageBuffer.data);
  const hashHex = keccak(messageBytes, 256);
  const messageHash = Buffer.from(hashHex, 'hex');
  const messageBigInt = bytesToLong(messageHash);
  const signature = modPow(messageBigInt, d, n);
  return longToBytes(signature).toString('hex');
}

// RSA Verification
function verify(message, signature, publicKeyBase64) {
  const publicKey = JSON.parse(Buffer.from(publicKeyBase64, 'base64').toString());
  const e = bytesToLong(base64ToBytes(publicKey.e));
  const n = bytesToLong(base64ToBytes(publicKey.n));
  const messageBuffer = Buffer.from(message, 'utf8');
  const messageBytes = Array.from(messageBuffer.data);
  const hashHex = keccak(messageBytes, 256);
  const messageHash = Buffer.from(hashHex, 'hex');
  const signatureBigInt = bytesToLong(Buffer.from(signature, 'hex'));
  const decryptedSignature = modPow(signatureBigInt, e, n);
  return decryptedSignature === bytesToLong(messageHash);
}

export {
  generateKeyPair,
  generateKeyPairFromSeed,
  encrypt,
  decrypt,
  sign,
  verify
};
