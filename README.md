# AetherSync

A blockchain-powered synchronization tool built on Stacks that enables secure and verifiable data synchronization between parties.

## Features
- Create sync channels between parties
- Post encrypted data updates
- Verify data integrity using merkle proofs
- Track sync history on-chain

## Usage
1. Initialize a sync channel between parties
2. Post updates to the channel
3. Verify and retrieve updates
4. Track sync history

## Smart Contract Interface
### Functions
- create-channel: Create a new sync channel
- post-update: Post an update to a channel
- verify-update: Verify update authenticity 
- get-channel-history: Get channel update history

## Testing
Run tests using Clarinet:
```bash
clarinet test
```
