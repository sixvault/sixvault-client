// Shamir Secret Sharing Implementation

import crypto from 'crypto';

// Helper function for modular arithmetic
function mod(a, b) {
    return ((a % b) + b) % b;
}

// Helper function for modular multiplicative inverse
function modInverse(a, m) {
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];
    let [old_t, t] = [0n, 1n];

    while (r !== 0n) {
        const quotient = old_r / r;
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
        [old_t, t] = [t, old_t - quotient * t];
    }

    if (old_r !== 1n) {
        throw new Error("Modular inverse does not exist");
    }

    return mod(old_s, m);
}

// Helper function to evaluate polynomial at point x
function evaluatePolynomial(coefficients, x, prime) {
    let result = 0n;
    for (let i = coefficients.length - 1; i >= 0; i--) {
        result = mod(result * BigInt(x) + coefficients[i], prime);
    }
    return result;
}

// Helper function to generate a cryptographically secure random integer in [1, max)
function secureRandomInt(max) {
    if (max <= 1n) throw new Error('max must be > 1');
    const bytes = Math.ceil(Math.log2(Number(max)) / 8);
    let rand;
    do {
        rand = BigInt('0x' + crypto.randomBytes(bytes).toString('hex'));
    } while (rand >= max || rand === 0n);
    return rand;
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
        const a = secureRandomInt(n - 2n);
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

// Generate a cryptographically secure prime number greater than min
function generatePrime(min) {
    let candidate = min;
    if (candidate % 2n === 0n) candidate += 1n;
    
    while (!isProbablyPrime(candidate)) {
        candidate += 2n;
    }
    return candidate;
}

// Split secret into n shares, requiring k shares to reconstruct
function split(secret, n, k) {
    if (k > n) {
        throw new Error("k cannot be greater than n");
    }
    if (k < 2) {
        throw new Error("k must be at least 2");
    }

    // Convert secret to BigInt if it isn't already
    secret = BigInt(secret);

    // Generate a prime number larger than the secret
    const prime = generatePrime(secret + 1n);

    // Generate cryptographically secure random coefficients for the polynomial
    const coefficients = [secret];
    for (let i = 1; i < k; i++) {
        coefficients.push(secureRandomInt(prime));
    }

    // Generate shares
    const shares = [];
    for (let i = 1; i <= n; i++) {
        const y = evaluatePolynomial(coefficients, i, prime);
        shares.push({ x: i, y: y });
    }

    return { shares, prime };
}

// Combine shares to reconstruct the secret
function combine(shares, prime) {
    if (shares.length < 2) {
        throw new Error("At least 2 shares are required");
    }

    let secret = 0n;
    for (let i = 0; i < shares.length; i++) {
        let numerator = 1n;
        let denominator = 1n;

        for (let j = 0; j < shares.length; j++) {
            if (i !== j) {
                numerator = mod(numerator * mod(-BigInt(shares[j].x), prime), prime);
                denominator = mod(denominator * mod(BigInt(shares[i].x) - BigInt(shares[j].x), prime), prime);
            }
        }

        const term = mod(BigInt(shares[i].y) * mod(numerator * modInverse(denominator, prime), prime), prime);
        secret = mod(secret + term, prime);
    }

    return secret;
}

export {
    split,
    combine
};
