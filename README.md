# Sixvault - Secure Academic Transcript Management System

Sixvault is a secure, role-based academic transcript management system that integrates multi-cryptographic techniques—including AES encryption, RSA digital signatures, and Shamir's Secret Sharing—to protect the confidentiality, integrity, and authenticity of student data in a controlled, collaborative environment.

## Features

### 🔒 Multi-Cryptographic Security
- **AES Encryption**: Symmetric encryption for data protection
- **RSA Digital Signatures**: Asymmetric encryption for authentication and non-repudiation
- **Shamir's Secret Sharing**: Distributed key management for enhanced security

### 👥 Role-Based Access Control
- **Students (Mahasiswa)**: View their own academic records
- **Academic Advisors (Dosen Wali)**: Manage student records under their supervision
- **Program Heads (Kaprodi)**: Administrative access to program-wide data

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Intuitive navigation and user experience
- Mobile-first responsive design

### 🛡️ Security Features
- **Password-based deterministic RSA key generation** using seeded key pair generation
- **Dual-layer encryption**: AES encrypted JWT tokens with RSA encrypted AES keys
- **Automatic token refresh** every 15 minutes with cryptographic validation
- **End-to-end encryption** for sensitive data
- **Protected API endpoints** with JWT authentication

## Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

### Cryptography
- **Custom RSA Implementation** - For key generation, encryption, and digital signatures
- **Custom AES Implementation** - For symmetric encryption
- **Custom Shamir's Secret Sharing** - For distributed key management
- **SHA3/Keccak** - For secure hashing

### API Integration
- **OpenAPI 3.0** specification
- RESTful API endpoints
- JWT token authentication
- Automatic token refresh

## Project Structure

```
sixvault-client/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx      # Main landing page with login/register
│   │   └── Dashboard.jsx        # User dashboard after authentication
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── lib/
│   │   ├── api/
│   │   │   └── sixvaultApi.js   # API service layer
│   │   └── crypto/              # Cryptographic implementations
│   │       ├── AES.js           # AES encryption/decryption
│   │       ├── RSA.js           # RSA key generation and operations
│   │       ├── SSS.js           # Shamir's Secret Sharing
│   │       └── SHA3Keccak.js    # SHA3/Keccak hashing
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles with Tailwind
├── public/                      # Static assets
├── openapi.yaml                 # API specification
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sixvault-client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Authentication Flow

### Enhanced Cryptographic Authentication Process

Sixvault implements a sophisticated multi-layer authentication system:

#### 1. User Registration/Login
```javascript
// User provides NIM/NIP (8-18 alphanumeric) and password
{
  nim_nip: "STI12345",
  password: "userPassword123",
  type: "mahasiswa",
  prodi: "teknik_informatika",
  nama: "John Doe"
}
```

#### 2. Client-Side Key Generation
```javascript
// Generate deterministic RSA key pair from password
const keyPair = await generateKeyPairFromSeed(password, 2048);
// Send only public key to server
const credentials = {
  nim_nip: nimNip,
  rsaPublicKey: keyPair.publicKey
};
```

#### 3. Server Response (Dual Encryption)
```javascript
// Server returns AES encrypted JWT tokens + RSA encrypted AES key
{
  status: "success",
  data: {
    nim_nip: "STI12345",
    access_token: "AES_ENCRYPTED_JWT_ACCESS_TOKEN",
    refresh_token: "AES_ENCRYPTED_JWT_REFRESH_TOKEN", 
    encrypted_token_key: "RSA_ENCRYPTED_AES_KEY"
  }
}
```

#### 4. Client-Side Decryption Process
```javascript
// Step 1: Decrypt AES key using RSA private key
const aesKey = rsaDecrypt(data.encrypted_token_key, rsaPrivateKey);

// Step 2: Decrypt JWT tokens using AES key
const aes = new AES();
const accessToken = aes.decrypt(data.access_token, aesKey);
const refreshToken = aes.decrypt(data.refresh_token, aesKey);

// Step 3: Store decrypted tokens in localStorage
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);
```

#### 5. Automatic Token Refresh (Every 15 Minutes)
```javascript
// Polling mechanism automatically refreshes tokens
setInterval(async () => {
  const success = await refreshToken();
  if (!success) logout(); // Auto-logout on failure
}, 15 * 60 * 1000); // 15 minutes
```

### Security Benefits

1. **Zero Knowledge Architecture**: Server never sees user's password or private key
2. **Deterministic Key Generation**: Same password always generates same key pair
3. **Dual Encryption**: AES for performance + RSA for key security
4. **Forward Secrecy**: New AES keys for each session
5. **Automatic Security**: Token refresh prevents session hijacking

## API Endpoints

The application integrates with the Sixvault Core API. Key endpoints include:

### Authentication
- `POST /user/auth/register` - Register a new user
- `POST /user/auth/login` - User login
- `GET /user/auth/refresh-token` - Refresh access token

### User Management
- `POST /user/remove` - Remove multiple users
- `GET /protected` - Example protected route

### Academic Data
- `POST /nilai/add` - Add encrypted grades
- `POST /nilai/decrypt` - Decrypt grade data
- `POST /student/search` - Search for students
- `POST /matakuliah/add` - Add courses
- `POST /matakuliah/remove` - Remove courses

## Security Implementation

### Key Generation
- RSA 2048-bit key pairs are generated deterministically from user passwords
- Uses `generateKeyPairFromSeed()` for reproducible key generation
- Public keys are stored on the server for verification
- Private keys never leave the client and are regenerated from password

### Data Protection
- All JWT tokens are encrypted using AES before transmission
- AES keys are encrypted using RSA before transmission
- Digital signatures ensure data integrity and authenticity
- Automatic token refresh maintains security without user intervention

### Validation Updates
- **NIM/NIP**: Now accepts 8-18 alphanumeric characters (previously 10-18 digits only)
- **Password**: Minimum 6 characters required for security
- **Real-time validation** with user-friendly error messages

## Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
The project follows modern React practices with:
- Functional components with hooks
- Context API for state management
- Custom hooks for reusable logic
- Responsive design principles

### New Authentication Features
- **Password-based authentication** with secure key derivation
- **Dual-layer encryption** for maximum security
- **Automatic token polling** every 15 minutes
- **Enhanced validation** for user inputs
- **Secure key storage** with proper cleanup

## Testing the Authentication Flow

### Registration Flow
1. Enter NIM/NIP (8-18 alphanumeric characters)
2. Enter password (minimum 6 characters)
3. Select user type and program
4. System generates RSA keys from password
5. Server returns encrypted tokens
6. Client decrypts and stores tokens
7. User is automatically logged in

### Login Flow
1. Enter existing NIM/NIP and password
2. System regenerates same RSA keys from password
3. Authentication and decryption process
4. Access granted with automatic token refresh

## License

This project is part of an academic assignment for the Cryptography course (II4021) at Institut Teknologi Bandung.

## Contributing

This is an academic project. For questions or suggestions, please contact the development team.

---

**Note**: This application demonstrates advanced cryptographic techniques in a web application context. The implementation includes password-based key derivation, dual-layer encryption, and automatic security maintenance. In a production environment, additional security measures and professional security audits would be required.
