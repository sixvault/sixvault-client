import keccak from './SHA3Keccak.js';
import crypto from 'crypto';

// Test cases with different input lengths and content
const testCases = [
    "hello world",
    "",  // empty string
    "a".repeat(100),  // repeated character
    "The quick brown fox jumps over the lazy dog",  // standard test string
    "Special chars: !@#$%^&*()_+",  // special characters
    "Unicode: 你好世界",  // unicode characters
];

function sha3_256_crypto(input) {
    const hash = crypto.createHash('sha3-256');
    hash.update(input);
    return hash.digest('hex');
}

function runTests() {
    console.log("Running SHA3-256 comparison tests...\n");
    
    for (const testCase of testCases) {
        console.log(`Test case: "${testCase.length > 50 ? testCase.substring(0, 47) + '...' : testCase}"`);
        
        // Our implementation
        const inputBytes = new TextEncoder().encode(testCase);
        const ourHash = keccak(inputBytes, 256);
        
        // Crypto implementation
        const cryptoHash = sha3_256_crypto(testCase);
        
        // Compare results
        const match = ourHash === cryptoHash;
        console.log("Our implementation:", ourHash);
        console.log("Node.js crypto:", cryptoHash);
        console.log("Match:", match ? "✅" : "❌");
        console.log("-".repeat(80) + "\n");
    }
}

// Run the tests
runTests();