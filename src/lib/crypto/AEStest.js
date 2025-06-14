import AES from './AES.js';

// Test function to verify encryption and decryption
function testAES(plaintext, key, keySize) {
    console.log('\n=== Test Case ===');
    console.log('Key Size:', keySize, 'bits');
    console.log('Plaintext:', plaintext);
    console.log('Key:', key);

    const aes = new AES(keySize);
    
    // Encryption
    const encrypted = aes.encrypt(plaintext, key);
    console.log('Encrypted (Base64):', encrypted);
    
    // Decryption
    const decrypted = aes.decrypt(encrypted, key);
    console.log('Decrypted:', decrypted);
    
    // Verification
    const success = decrypted === plaintext;
    console.log('Test', success ? 'PASSED' : 'FAILED');
    console.log('========================\n');
    
    return success;
}

// Test cases
function runTests() {
    let allTestsPassed = true;

    // Test Case 1: AES-128 with short text
    const test1 = testAES(
        'Hello, World!',
        'MySecretKey12345',  // 16 bytes for AES-128
        128
    );
    allTestsPassed = allTestsPassed && test1;

    // Test Case 2: AES-192 with longer text
    const test2 = testAES(
        'This is a longer text that needs to be encrypted using AES-192. It contains multiple sentences and special characters!',
        'MySecretKey123456789012',  // 24 bytes for AES-192
        192
    );
    allTestsPassed = allTestsPassed && test2;

    // Test Case 3: AES-256 with special characters
    const test3 = testAES(
        'Special chars: !@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./',
        'MySecretKey12345678901234567890',  // 32 bytes for AES-256
        256
    );
    allTestsPassed = allTestsPassed && test3;

    // Test Case 4: AES-128 with empty string
    const test4 = testAES(
        '',
        'MySecretKey12345',
        128
    );
    allTestsPassed = allTestsPassed && test4;

    // Test Case 5: AES-128 with very long text
    const longText = 'A'.repeat(1000);  // 1000 characters
    const test5 = testAES(
        longText,
        'MySecretKey12345',
        128
    );
    allTestsPassed = allTestsPassed && test5;

    // Test Case 6: AES-128 with Unicode characters
    const test6 = testAES(
        'Unicode: 你好，世界！こんにちは世界！안녕하세요 세계!',
        'MySecretKey12345',
        128
    );
    allTestsPassed = allTestsPassed && test6;

    // Test Case 7: AES-128 with binary-like data
    const test7 = testAES(
        '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F',
        'MySecretKey12345',
        128
    );
    allTestsPassed = allTestsPassed && test7;

    // Final result
    console.log('=== Final Result ===');
    console.log('All tests', allTestsPassed ? 'PASSED' : 'FAILED');
}

// Run the tests
console.log('Starting AES Tests...');
runTests();
