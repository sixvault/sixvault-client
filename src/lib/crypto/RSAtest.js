import rsa from "./RSA";

async function testRSA() {
    console.log('=== RSA Test Suite ===\n');

    // Test 1: Key Generation
    console.log('Test 1: Key Generation');
    console.log('Generating RSA key pair (1024 bits)...');
    const { publicKey, privateKey } = await rsa.generateKeyPair();
    console.log('Public Key (base64):', publicKey);
    console.log('Private Key (base64):', privateKey);
    console.log('Key generation successful!\n');

    // Test 1.1: Seeded Key Generation
    console.log('Test 1.1: Seeded Key Generation');
    const seed = "my-secure-seed-123";
    console.log('Using seed:', seed);
    
    // Generate first key pair
    const { publicKey: seededPublicKey1, privateKey: seededPrivateKey1 } = 
        await rsa.generateKeyPairFromSeed(seed);
    
    // Generate second key pair with same seed
    const { publicKey: seededPublicKey2, privateKey: seededPrivateKey2 } = 
        await rsa.generateKeyPairFromSeed(seed);
    
    // Verify that both key pairs are identical
    const keysMatch = 
        seededPublicKey1 === seededPublicKey2 &&
        seededPrivateKey1 === seededPrivateKey2;
    
    console.log('First generated key (base64):', seededPublicKey1);
    console.log('Second generated key (base64):', seededPublicKey2);
    console.log('Seeded key generation test:', 
        keysMatch ? 'PASSED (keys match)' : 'FAILED (keys differ)');
    console.log();

    // Test 1.2: Different Seeds
    console.log('Test 1.2: Different Seeds');
    const differentSeed = "different-seed-456";
    const { publicKey: diffPublicKey, privateKey: diffPrivateKey } = 
        await rsa.generateKeyPairFromSeed(differentSeed);
    
    const differentKeys = seededPublicKey1 !== diffPublicKey;
    
    console.log('Different seed key (base64):', diffPublicKey);
    console.log('Different seeds test:', 
        differentKeys ? 'PASSED (keys differ)' : 'FAILED (keys match)');
    console.log();

    // Test 2: Encryption and Decryption
    console.log('Test 2: Encryption and Decryption');
    const originalMessage = "Hello, this is a test message for RSA encryption!";
    console.log('Original message:', originalMessage);
    
    const encrypted = rsa.encrypt(originalMessage, publicKey);
    console.log('Encrypted message (base64):', encrypted);
    
    const decrypted = rsa.decrypt(encrypted, privateKey);
    console.log('Decrypted message:', decrypted);
    console.log('Encryption/Decryption test:', 
        decrypted === originalMessage ? 'PASSED' : 'FAILED');
    console.log();

    // Test 3: Signing and Verification
    console.log('Test 3: Signing and Verification');
    const messageToSign = "This message needs to be signed";
    console.log('Message to sign:', messageToSign);
    
    const signature = rsa.sign(messageToSign, privateKey);
    console.log('Signature (base64):', signature);
    
    const isValid = rsa.verify(messageToSign, signature, publicKey);
    console.log('Signature verification:', isValid ? 'PASSED' : 'FAILED');
    console.log();

    // Test 4: Tampered Message Detection
    console.log('Test 4: Tampered Message Detection');
    const tamperedMessage = messageToSign + " (tampered)";
    console.log('Tampered message:', tamperedMessage);
    
    const isTamperedValid = rsa.verify(tamperedMessage, signature, publicKey);
    console.log('Verification of tampered message:', 
        isTamperedValid ? 'FAILED (should be invalid)' : 'PASSED (correctly detected tampering)');
    console.log();

    // Test 5: Different Message Lengths
    console.log('Test 5: Different Message Lengths');
    const shortMessage = "Short";
    const longMessage = "This is a much longer message that needs to be encrypted and signed. " +
                       "It contains multiple sentences and should test the RSA implementation " +
                       "with a larger input size. RSA can handle messages of different lengths, " +
                       "though there are practical limits based on the key size.";

    console.log('Testing short message...');
    const shortEncrypted = rsa.encrypt(shortMessage, publicKey);
    const shortDecrypted = rsa.decrypt(shortEncrypted, privateKey);
    console.log('Short message test:', 
        shortDecrypted === shortMessage ? 'PASSED' : 'FAILED');

    console.log('\nTesting long message...');
    const longEncrypted = rsa.encrypt(longMessage, publicKey);
    const longDecrypted = rsa.decrypt(longEncrypted, privateKey);
    console.log('Long message test:', 
        longDecrypted === longMessage ? 'PASSED' : 'FAILED');

    // Test 6: Binary Data
    console.log('\nTest 6: Binary Data');
    const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
    console.log('Original binary data:', binaryData.toString('hex'));
    
    const binaryEncrypted = rsa.encrypt(binaryData.toString(), publicKey);
    const binaryDecrypted = rsa.decrypt(binaryEncrypted, privateKey);
    console.log('Binary data test:', 
        binaryDecrypted === binaryData.toString() ? 'PASSED' : 'FAILED');
}

// Run the tests
console.log('Starting RSA tests...\n');
testRSA().catch(error => {
    console.error('Test failed with error:', error);
});