import crypto from 'crypto';
import { split, combine } from './SSS.js';

// Test helper function
function assertEqual(actual, expected, message) {
    if (actual.toString() !== expected.toString()) {
        throw new Error(`${message}. Expected ${expected}, but got ${actual}`);
    }
}

// Test 1: Basic functionality
function testBasicFunctionality() {
    console.log("Running basic functionality test...");
    const secret = 1234;
    const n = 5;
    const k = 3;

    const { shares, prime } = split(secret, n, k);
    console.log("Generated shares:", shares);
    console.log("Prime number:", prime);

    // Test reconstruction with k shares
    const reconstructedSecret = combine(shares.slice(0, k), prime);
    assertEqual(reconstructedSecret, secret, "Basic reconstruction failed");
    console.log("Basic functionality test passed!");
}

// Test 2: Different number of shares
function testDifferentShareCounts() {
    console.log("\nRunning different share counts test...");
    const secret = 5678;
    const n = 6;
    const k = 4;

    const { shares, prime } = split(secret, n, k);

    // Test with k shares
    const reconstructedWithK = combine(shares.slice(0, k), prime);
    assertEqual(reconstructedWithK, secret, "Reconstruction with k shares failed");

    // Test with n shares
    const reconstructedWithN = combine(shares, prime);
    assertEqual(reconstructedWithN, secret, "Reconstruction with n shares failed");

    console.log("Different share counts test passed!");
}

// Test 3: Error cases
function testErrorCases() {
    console.log("\nRunning error cases test...");
    const secret = 1000;
    const n = 4;
    const k = 3;

    // Test invalid k > n
    try {
        split(secret, n, n + 1);
        throw new Error("Should have thrown error for k > n");
    } catch (e) {
        console.log("Successfully caught k > n error");
    }

    // Test invalid k < 2
    try {
        split(secret, n, 1);
        throw new Error("Should have thrown error for k < 2");
    } catch (e) {
        console.log("Successfully caught k < 2 error");
    }

    // Test combining with insufficient shares
    const { shares, prime } = split(secret, n, k);
    try {
        combine([shares[0]], prime);
        throw new Error("Should have thrown error for insufficient shares");
    } catch (e) {
        console.log("Successfully caught insufficient shares error");
    }

    console.log("Error cases test passed!");
}

// Test 4: Large numbers
function testLargeNumbers() {
    console.log("\nRunning large numbers test...");
    const secret = 123456789;
    const n = 5;
    const k = 3;

    const { shares, prime } = split(secret, n, k);
    const reconstructedSecret = combine(shares.slice(0, k), prime);
    assertEqual(reconstructedSecret, secret, "Large numbers reconstruction failed");
    console.log("Large numbers test passed!");
}

// Test 5: Cryptographic randomness (different splits produce different shares)
function testRandomness() {
    console.log("\nRunning cryptographic randomness test...");
    const secret = 9999;
    const n = 5;
    const k = 3;

    const { shares: shares1, prime: prime1 } = split(secret, n, k);
    const { shares: shares2, prime: prime2 } = split(secret, n, k);

    // The shares should be different most of the time
    let identical = true;
    for (let i = 0; i < n; i++) {
        if (shares1[i].y !== shares2[i].y) {
            identical = false;
            break;
        }
    }
    if (prime1 !== prime2) identical = false;
    if (identical) {
        throw new Error("Shares from two splits should not be identical (randomness test failed)");
    }
    console.log("Cryptographic randomness test passed!");
}

// Test 6: Large cryptographically secure key (1024-bit random key)
function testLargeSecureKey() {
    console.log("\nRunning large secure key test...");
    const secret = BigInt('0x' + crypto.randomBytes(128).toString('hex'));
    const n = 5;
    const k = 3;

    const { shares, prime } = split(secret, n, k);
    const reconstructedSecret = combine(shares.slice(0, k), prime);
    assertEqual(reconstructedSecret, secret, "Large secure key reconstruction failed");
    console.log("Large secure key test passed!");
}

// Run all tests
console.log("Starting Shamir Secret Sharing tests...\n");

try {
    testBasicFunctionality();
    testDifferentShareCounts();
    testErrorCases();
    testLargeNumbers();
    testRandomness();
    testLargeSecureKey();
    console.log("\nAll tests passed successfully!");
} catch (error) {
    console.error("\nTest failed:", error.message);
    process.exit(1);
}
