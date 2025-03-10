# Product Context: Oyl SDK

## Why This Project Exists

The Oyl SDK was created to address the complexity and technical barriers in Bitcoin development. Bitcoin's programming model is fundamentally different from traditional web development, with its UTXO-based system, complex scripting language, and various address formats requiring specialized knowledge. The Oyl SDK exists to:

1. **Simplify Bitcoin Development**: Abstract away the complexities of Bitcoin's transaction model, making it accessible to a broader range of developers.

2. **Unify Protocol Support**: Provide a single, consistent interface for interacting with various Bitcoin protocols (BRC-20, Runes, Alkanes) that would otherwise require separate libraries and approaches.

3. **Enable DeFi on Bitcoin**: Support the emerging DeFi ecosystem on Bitcoin by providing tools for token operations, smart contracts via Alkanes, and automated market makers (AMM).

4. **Reduce Development Time**: Offer pre-built components and abstractions that handle common Bitcoin operations, allowing developers to focus on application logic rather than low-level Bitcoin details.

## Problems It Solves

### Technical Complexity
- **UTXO Management**: Simplifies the complex task of selecting and managing UTXOs for transactions.
- **Transaction Building**: Abstracts away the details of creating, signing, and broadcasting Bitcoin transactions.
- **Protocol Integration**: Provides unified interfaces for working with various Bitcoin protocols.

### Development Barriers
- **Learning Curve**: Reduces the steep learning curve associated with Bitcoin development.
- **Fragmentation**: Consolidates functionality from multiple libraries into a single, coherent SDK.
- **Error Handling**: Implements robust error handling for Bitcoin-specific edge cases.

### Ecosystem Gaps
- **DeFi Infrastructure**: Provides the building blocks for DeFi applications on Bitcoin.
- **Wallet Integration**: Simplifies the process of integrating Bitcoin wallet functionality into applications.
- **Cross-Protocol Operations**: Enables seamless operations across different Bitcoin protocols.

## How It Should Work

### Core Principles

1. **Abstraction with Access**: Abstract complexity while still providing access to lower-level functionality when needed.
2. **Consistent Interfaces**: Maintain consistent patterns and interfaces across different modules.
3. **Progressive Disclosure**: Allow developers to start with simple operations and gradually access more complex functionality.
4. **Robust Error Handling**: Provide clear, actionable error messages specific to Bitcoin operations.
5. **Comprehensive Documentation**: Offer detailed documentation with examples for all functionality.

### User Journey

1. **Initial Setup**: Developers install the SDK and configure a provider to connect to Bitcoin networks.
2. **Account Creation**: Create or import Bitcoin accounts using mnemonics or private keys.
3. **Basic Operations**: Perform common operations like sending Bitcoin, checking balances, and managing UTXOs.
4. **Protocol Interactions**: Interact with BRC-20 tokens, Runes, or Alkanes smart contracts.
5. **Advanced Features**: Access advanced features like AMM functionality, custom transaction building, or multi-signature operations.

## User Experience Goals

### For Developers

1. **Intuitive API**: Provide a clear, intuitive API that follows modern JavaScript/TypeScript conventions.
2. **Minimal Configuration**: Require minimal setup to get started with basic functionality.
3. **Comprehensive Types**: Offer complete TypeScript type definitions for improved developer experience.
4. **Flexible Integration**: Support integration with various frontend frameworks and backend environments.
5. **Detailed Documentation**: Provide comprehensive documentation with examples for all functionality.

### For End Users (via Applications Built with Oyl SDK)

1. **Fast Transactions**: Optimize transaction creation and broadcasting for speed.
2. **Cost Efficiency**: Implement intelligent fee estimation and UTXO selection to minimize transaction costs.
3. **Security**: Prioritize security best practices in all operations.
4. **Reliability**: Ensure consistent behavior across different network conditions.

## Target Audience

1. **Bitcoin Application Developers**: Developers building applications that interact with the Bitcoin network.
2. **DeFi Protocol Developers**: Teams building decentralized finance protocols on Bitcoin.
3. **Wallet Developers**: Developers creating Bitcoin wallet applications.
4. **Blockchain Explorers and Tools**: Developers of tools for analyzing and interacting with the Bitcoin blockchain.
5. **Educational Platforms**: Platforms teaching Bitcoin development concepts.

## Use Cases

1. **Wallet Development**: Building full-featured Bitcoin wallets with support for multiple address types and protocols.
2. **Token Platforms**: Creating platforms for issuing, transferring, and managing BRC-20 tokens and Runes.
3. **DeFi Applications**: Developing decentralized exchanges, lending platforms, and other DeFi applications using Alkanes smart contracts.
4. **NFT Marketplaces**: Building marketplaces for Bitcoin-based collectibles.
5. **Cross-Protocol Applications**: Creating applications that interact with multiple Bitcoin protocols simultaneously.
6. **Automated Trading Systems**: Developing systems for automated trading using the AMM functionality.

## Success Metrics

1. **Developer Adoption**: Number of developers and projects using the Oyl SDK.
2. **Transaction Volume**: Volume of transactions facilitated through applications built with the SDK.
3. **Protocol Coverage**: Breadth and depth of supported Bitcoin protocols.
4. **Community Engagement**: Active community of developers contributing to and building with the SDK.
5. **Error Reduction**: Reduction in common errors and issues in Bitcoin application development.