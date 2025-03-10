# Oyl SDK Project Brief

## Project Overview

The Oyl SDK is a comprehensive Bitcoin development toolkit that provides easy-to-use functions for building and broadcasting Bitcoin transactions. It serves as a foundation for Bitcoin wallet development, offering support for various Bitcoin address types, transaction signing, and integration with Bitcoin-related protocols like BRC-20, Runes, and Alkanes.

The SDK aims to simplify Bitcoin development by abstracting complex Bitcoin operations into a clean, well-structured API. It provides both a programmatic interface for developers and a command-line interface (CLI) for direct interaction.

## Technical Context

### Programming Languages and Technologies

- **Primary Language**: TypeScript
- **Runtime Environment**: Node.js (v20+)
- **Package Manager**: Yarn (v1.22.21+)

### Frameworks and Libraries

#### Core Bitcoin Libraries
- `bitcoinjs-lib`: Core Bitcoin functionality
- `@bitcoinerlab/secp256k1`: Elliptic curve cryptography
- `@scure/btc-signer`: Bitcoin transaction signing
- `bip32`, `bip39`: Bitcoin wallet standards implementation
- `ecpair`: Key pair management

#### Bitcoin Protocol Extensions
- `@sadoprotocol/ordit-sdk`: Ordinals support
- `@magiceden-oss/runestone-lib`: Runestone library
- `alkanes`: Smart contract functionality on Bitcoin

#### Utilities
- `bignumber.js`: Precise number handling
- `commander`: CLI framework
- `dotenv`: Environment variable management
- `node-fetch`: HTTP requests

### System Architecture

The Oyl SDK is structured as a modular TypeScript library with the following key components:

1. **Core Bitcoin Operations**
   - Account management (HD wallet generation, key derivation)
   - Transaction creation and signing
   - UTXO management

2. **Protocol Extensions**
   - BRC-20 token support
   - Runes protocol integration
   - Alkanes smart contract functionality
   - Collectibles (NFT-like assets) handling

3. **Provider System**
   - Abstraction layer for Bitcoin network interaction
   - Support for multiple RPC endpoints (Esplora, Ord, Sandshrew, Alkanes)

4. **Command-Line Interface**
   - Interactive tools for all SDK functionality
   - Development and testing utilities

### Design Patterns

- **Factory Pattern**: Used for creating Bitcoin accounts and wallets
- **Singleton Pattern**: Used for provider instances
- **Builder Pattern**: Used for transaction construction
- **Strategy Pattern**: Used for different signing approaches

## Source Code Modules

### Core Modules

#### Account Module (`src/account`)
- Handles wallet generation from mnemonics
- Supports multiple address types (Legacy, SegWit, Taproot)
- Implements BIP32/39/44 standards for hierarchical deterministic wallets
- Key functionality: Account creation, address derivation, key management

#### Signer Module (`src/signer`)
- Manages transaction signing for different address types
- Supports various signature hash types
- Provides message signing capabilities
- Key functionality: Transaction signing, message signing, key tweaking

#### BTC Module (`src/btc`)
- Core Bitcoin transaction functionality
- Fee calculation and management
- Transaction creation and broadcasting
- Key functionality: PSBT creation, fee estimation, transaction building

#### UTXO Module (`src/utxo`)
- UTXO selection and management
- Balance calculation
- UTXO filtering and sorting
- Key functionality: UTXO gathering, balance checking, coin selection

### Protocol Extensions

#### BRC20 Module (`src/brc20`)
- BRC-20 token transfer functionality
- Token balance checking
- Integration with Ordinals for token operations
- Key functionality: Token transfers, balance queries

#### Rune Module (`src/rune`)
- Rune protocol implementation
- Minting, sending, and managing Runes
- Etch operations (commit/reveal pattern)
- Key functionality: Rune minting, transfers, etching

#### Alkanes Module (`src/alkanes`)
- Smart contract functionality on Bitcoin
- Contract deployment and execution
- Token operations within the Alkanes ecosystem
- Key functionality: Contract deployment, execution, token management

#### Collectible Module (`src/collectible`)
- NFT-like asset management
- Transfer and ownership operations
- Key functionality: Collectible transfers, ownership verification

### Infrastructure

#### Provider Module (`src/provider`)
- Network communication abstraction
- Support for multiple Bitcoin RPC endpoints
- Transaction broadcasting and confirmation tracking
- Key functionality: Network interaction, transaction broadcasting

#### RPC Client Module (`src/rpclient`)
- Implementation of various RPC clients:
  - Sandshrew: Bitcoin Core RPC wrapper
  - Esplora: Block explorer API
  - Ord: Ordinals protocol
  - Alkanes: Smart contract functionality
- Key functionality: API communication, data retrieval, command execution

#### CLI Module (`src/cli`)
- Command-line interface for all SDK functionality
- Interactive tools for development and testing
- Regtest environment management
- Key functionality: Command parsing, user interaction, operation execution

### Utilities

#### Shared Module (`src/shared`)
- Common utilities and helper functions
- Type definitions and interfaces
- Constants and configuration
- Key functionality: Utility functions, type definitions, shared constants

#### Errors Module (`src/errors`)
- Custom error types and error handling
- Key functionality: Error definition, error handling

## Additional Context

### Testing Strategy
- Jest testing framework for unit and integration tests
- Test fixtures for reproducible testing scenarios
- Regtest environment for local testing

### Development Workflow
- TypeScript compilation to JavaScript
- Prettier for code formatting
- Makefile for common development tasks

### Deployment
- Published as an NPM package (`@oyl/sdk`)
- Versioned using SemVer
- MIT licensed

### Integration Notes
- Requires Bitcoin node access (direct or via API)
- Supports multiple network types (mainnet, testnet, regtest)
- Provides both programmatic and CLI interfaces

## File Structure Overview

```
oyl-sdk/
├── bin/                  # Binary executables
├── lib/                  # Compiled JavaScript output
├── src/                  # TypeScript source code
│   ├── account/          # Account management
│   ├── alkanes/          # Alkanes smart contract functionality
│   ├── brc20/            # BRC-20 token support
│   ├── btc/              # Core Bitcoin operations
│   ├── cli/              # Command-line interface
│   ├── collectible/      # NFT-like asset handling
│   ├── errors/           # Error definitions
│   ├── network/          # Network configurations
│   ├── provider/         # Provider abstraction
│   ├── rpclient/         # RPC client implementations
│   ├── rune/             # Runes protocol support
│   ├── shared/           # Shared utilities
│   ├── signer/           # Transaction signing
│   ├── utxo/             # UTXO management
│   └── index.ts          # Main entry point
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.ts        # Jest testing configuration
└── README.md             # Project documentation
```

## Usage Examples

### Programmatic Usage
```typescript
import { Account, Provider, btc } from '@oyl/sdk';

// Initialize provider
const provider = new Provider({
  url: 'https://api.example.com',
  projectId: 'your-project-id',
  network: bitcoin.networks.bitcoin,
  networkType: 'mainnet'
});

// Create account from mnemonic
const account = Account.fromMnemonic({
  mnemonic: 'your mnemonic phrase here',
  network: bitcoin.networks.bitcoin
});

// Send Bitcoin
const result = await btc.createPsbt({
  utxos: accountUtxos,
  toAddress: 'recipient-address',
  amount: 10000, // in satoshis
  feeRate: 5,
  account,
  provider
});
```

### CLI Usage
```bash
# Generate a new mnemonic
oyl account generateMnemonic

# Get account information from mnemonic
oyl account mnemonicToAccount -m "your mnemonic phrase"

# Send Bitcoin
oyl btc send -a "recipient-address" -v 10000 -f 5
``` 