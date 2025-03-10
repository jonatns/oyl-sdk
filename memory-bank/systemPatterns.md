# System Patterns: Oyl SDK

## System Architecture

The Oyl SDK is structured as a modular TypeScript library that follows a layered architecture pattern. This architecture provides clear separation of concerns, allowing for maintainable code and flexible extension of functionality.

### Architectural Layers

1. **Core Layer**
   - Fundamental Bitcoin operations
   - Account management
   - Transaction signing
   - UTXO handling

2. **Protocol Layer**
   - BRC-20 implementation
   - Runes implementation
   - Alkanes smart contract integration
   - Collectibles handling

3. **Provider Layer**
   - Network communication abstraction
   - RPC client implementations
   - Transaction broadcasting

4. **Interface Layer**
   - CLI interface
   - Programmatic API

### Module Organization

The codebase is organized into distinct modules, each responsible for a specific domain of functionality:

```
src/
├── account/       # Account management and wallet operations
├── alkanes/       # Alkanes smart contract functionality
├── amm/           # Automated Market Maker functionality
├── brc20/         # BRC-20 token operations
├── btc/           # Core Bitcoin operations
├── cli/           # Command-line interface
├── collectible/   # NFT-like asset handling
├── errors/        # Error definitions and handling
├── network/       # Network configurations
├── provider/      # Provider abstraction for network interaction
├── psbt/          # PSBT (Partially Signed Bitcoin Transaction) handling
├── rpclient/      # RPC client implementations
├── rune/          # Runes protocol support
├── shared/        # Shared utilities and interfaces
├── signer/        # Transaction signing
└── utxo/          # UTXO management
```

## Key Technical Decisions

### 1. TypeScript as Primary Language

**Decision**: Use TypeScript for all SDK code.

**Rationale**:
- Strong typing improves developer experience and reduces runtime errors
- Enhanced IDE support with autocompletion and inline documentation
- Better maintainability and refactorability
- Compatibility with both JavaScript and TypeScript projects

### 2. Modular Architecture

**Decision**: Organize code into distinct, focused modules.

**Rationale**:
- Separation of concerns for better maintainability
- Allows for independent evolution of different components
- Enables selective importing of only needed functionality
- Facilitates testing of individual components

### 3. Provider Abstraction

**Decision**: Implement a provider abstraction layer for network interactions.

**Rationale**:
- Decouples business logic from network implementation details
- Allows for easy switching between different Bitcoin networks (mainnet, testnet, regtest)
- Enables mocking for testing purposes
- Provides a unified interface for different RPC endpoints

### 4. PSBT-Based Transaction Building

**Decision**: Use Partially Signed Bitcoin Transactions (PSBTs) for all transaction operations.

**Rationale**:
- Follows Bitcoin best practices
- Enables complex multi-signature scenarios
- Provides better interoperability with hardware wallets and other Bitcoin tools
- Allows for transaction inspection before signing

### 5. Protocol Integration Strategy

**Decision**: Integrate multiple Bitcoin protocols (BRC-20, Runes, Alkanes) under a unified API.

**Rationale**:
- Provides a consistent developer experience across protocols
- Reduces learning curve for working with multiple protocols
- Enables cross-protocol operations
- Centralizes protocol-specific knowledge and updates

## Design Patterns

### 1. Factory Pattern

Used extensively for creating complex objects with consistent initialization:

- **Account Factory**: Creates account objects from mnemonics, private keys, or other sources
- **Transaction Factory**: Builds different types of transactions based on parameters
- **Provider Factory**: Creates appropriate provider instances based on configuration

Example from `account.ts`:
```typescript
export const mnemonicToAccount = ({
  mnemonic = generateMnemonic(),
  opts,
}: {
  mnemonic?: string
  opts?: MnemonicToAccountOptions
}): Account => {
  // Implementation that creates and returns an Account object
}
```

### 2. Singleton Pattern

Used for resources that should have a single instance throughout the application:

- **Provider Instances**: Ensures a single connection to each network
- **Network Configuration**: Maintains consistent network settings

Example from `provider.ts`:
```typescript
export class Provider {
  public sandshrew: SandshrewBitcoinClient
  public esplora: EsploraRpc
  public ord: OrdRpc
  public api: any
  public alkanes: AlkanesRpc
  // ...
}
```

### 3. Builder Pattern

Used for constructing complex objects step by step:

- **PSBT Builder**: Builds transactions incrementally with inputs, outputs, and metadata
- **Runestone Builder**: Constructs Runestone data structures for Runes operations

Example from `psbt.ts`:
```typescript
export const psbtBuilder = async ({
  inputs,
  outputs,
  feeRate,
  // ...other parameters
}) => {
  const psbt = new bitcoin.Psbt({ network })
  
  // Add inputs
  for (const input of inputs) {
    psbt.addInput(/* ... */)
  }
  
  // Add outputs
  for (const output of outputs) {
    psbt.addOutput(/* ... */)
  }
  
  // Additional configuration
  
  return psbt
}
```

### 4. Strategy Pattern

Used to select algorithms at runtime:

- **UTXO Selection Strategies**: Different approaches for selecting UTXOs based on requirements
- **Fee Calculation Strategies**: Various methods for calculating transaction fees
- **Signing Strategies**: Different approaches for signing transactions based on address type

Example from `account.ts`:
```typescript
export interface SpendStrategy {
  addressOrder: AddressKey[]
  utxoSortGreatestToLeast: boolean
  changeAddress: AddressKey
}
```

### 5. Adapter Pattern

Used to make incompatible interfaces work together:

- **RPC Client Adapters**: Normalize different Bitcoin RPC interfaces
- **Protocol Adapters**: Provide consistent interfaces for different Bitcoin protocols

Example from `rpclient/`:
```typescript
// Each RPC client adapts a specific API to a consistent interface
export class EsploraRpc {
  // Methods that adapt Esplora API to our internal interface
}

export class OrdRpc {
  // Methods that adapt Ord API to our internal interface
}
```

## Component Relationships

### Core Interaction Flows

1. **Account Creation and Management**
   - Account module creates and manages wallet accounts
   - Interacts with Signer module for transaction signing
   - Uses Provider module for network operations

2. **Transaction Creation and Broadcasting**
   - BTC module creates transaction templates
   - UTXO module selects appropriate inputs
   - Signer module signs transactions
   - Provider module broadcasts transactions

3. **Protocol Operations**
   - Protocol-specific modules (BRC20, Rune, Alkanes) implement protocol logic
   - Use core modules for transaction building and signing
   - Interact with Provider module for network operations

4. **AMM Operations**
   - AMM module implements automated market maker functionality
   - Uses Alkanes module for smart contract interactions
   - Relies on core modules for transaction handling

### Dependency Hierarchy

```
CLI/API Interface
    │
    ├── Protocol Modules (BRC20, Rune, Alkanes, AMM)
    │       │
    │       ├── Core Modules (BTC, UTXO)
    │       │
    │       └── Account/Signer Modules
    │
    └── Provider Module
            │
            └── RPC Clients
```

## Data Flow

The data flow in the Oyl SDK follows a consistent pattern across different operations:

1. **Input Collection**: Gather necessary inputs (UTXOs, account information, operation parameters)
2. **Transaction Construction**: Build a transaction template based on the operation
3. **Fee Calculation**: Calculate appropriate fees based on transaction size and network conditions
4. **Transaction Finalization**: Finalize the transaction with correct inputs, outputs, and fees
5. **Signing**: Sign the transaction with appropriate keys
6. **Broadcasting**: Broadcast the transaction to the network
7. **Confirmation**: Monitor the transaction for confirmation

This pattern is implemented with variations across different modules, but the general flow remains consistent, providing a predictable development experience.

## Integration Points

### External Systems Integration

1. **Bitcoin Node Integration**
   - Via Sandshrew RPC client
   - Provides access to Bitcoin Core functionality

2. **Block Explorer Integration**
   - Via Esplora RPC client
   - Provides efficient access to blockchain data

3. **Ordinals Integration**
   - Via Ord RPC client
   - Enables interaction with Ordinals protocol

4. **Alkanes Integration**
   - Via Alkanes RPC client
   - Provides smart contract functionality on Bitcoin

### Internal Module Integration

Modules integrate through well-defined interfaces and shared types, with the following key integration points:

1. **Account → Signer**: Account module provides key material to Signer module
2. **UTXO → BTC**: UTXO module provides input selection to BTC module
3. **BTC → Provider**: BTC module uses Provider for network operations
4. **Protocol Modules → Core Modules**: Protocol-specific modules use core modules for common operations

## Error Handling Strategy

The SDK implements a comprehensive error handling strategy:

1. **Custom Error Types**: Defined in the errors module
2. **Error Propagation**: Errors are propagated up the call stack with additional context
3. **Descriptive Messages**: Error messages provide actionable information
4. **Error Categories**: Errors are categorized by type (network, transaction, validation, etc.)

Example from `errors/OylTransactionError.ts`:
```typescript
export class OylTransactionError extends Error {
  constructor(error: any) {
    super(error.message || 'Transaction Error')
    this.name = 'OylTransactionError'
    this.stack = error.stack
  }
}
```

## Testing Strategy

The testing strategy for the Oyl SDK includes:

1. **Unit Tests**: For individual functions and components
2. **Integration Tests**: For interactions between modules
3. **Regtest Tests**: For end-to-end testing in a controlled environment
4. **Test Fixtures**: For reproducible testing scenarios

Tests are implemented using Jest and focus on ensuring correct behavior across different network conditions and edge cases.