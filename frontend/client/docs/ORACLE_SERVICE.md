# DealFlow Oracle Service

The DealFlow Oracle Service is a TypeScript-based bridge that synchronizes data between Supabase and blockchain smart contracts. It enables real-time syncing of company and deal flow data to maintain transparency and immutability on the blockchain.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase DB   │◄──►│  Oracle Service │◄──►│  Smart Contract │
│                 │    │                 │    │    (Ethereum)   │
│ - companies     │    │ - Sync Manager  │    │                 │
│ - deal_flow     │    │ - Health Check  │    │ - Company Data  │
│ - users         │    │ - Real-time Sub │    │ - Deal Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

- **Automated Synchronization**: Sync company and deal data from Supabase to blockchain
- **Real-time Updates**: Listen for database changes and sync immediately
- **Batch Operations**: Efficient batch syncing for large datasets
- **Health Monitoring**: Comprehensive health checks for all components
- **Dashboard Interface**: React-based dashboard for monitoring and control
- **Error Handling**: Robust error handling and retry mechanisms

## Components

### 1. Oracle Service (`services/dealFlowOracle.ts`)
Core service that handles:
- Data fetching from Supabase
- Transformation for blockchain compatibility
- Smart contract interactions
- Real-time subscriptions
- Health monitoring

### 2. API Routes (`app/api/oracle/route.ts`)
REST API endpoints for:
- Health checks (`GET ?action=health`)
- Service control (`POST` with actions: start, stop, sync)
- Real-time setup (`PUT` with action: setup-realtime)

### 3. React Hook (`hooks/useOracle.tsx`)
Custom hook providing:
- Oracle service state management
- API interaction methods
- Loading and error states
- Real-time updates

### 4. Dashboard Component (`components/oracle/OracleDashboard.tsx`)
Admin interface featuring:
- Service status monitoring
- Connection health indicators
- Manual sync controls
- Real-time sync setup
- Detailed status information

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain Configuration
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_private_key_for_oracle_wallet
CONTRACT_ADDRESS=your_deployed_contract_address

# Optional Configuration
ORACLE_SYNC_INTERVAL=300000  # 5 minutes
ORACLE_BATCH_SIZE=5
ORACLE_GAS_LIMIT=500000
```

### 2. Smart Contract Deployment

Deploy the `DealFlowOracle.sol` contract to your target network:

```bash
cd backend
npx hardhat deploy --network your_network
```

### 3. Oracle Wallet Setup

1. Create a dedicated wallet for the oracle service
2. Fund it with enough ETH for gas fees
3. Add the private key to your environment variables
4. Authorize the wallet address in the smart contract

### 4. Database Permissions

Ensure the oracle service has the necessary Supabase permissions:
- Read access to `companies` table
- Read access to `deal_flow` table
- Real-time subscription permissions

## Usage

### Starting the Oracle Service

#### Via Dashboard
1. Navigate to `/admin/oracle`
2. Click "Start Oracle" button
3. Monitor the health status

#### Via API
```javascript
const response = await fetch('/api/oracle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'start' })
})
```

#### Programmatically
```typescript
import DealFlowOracle from '@/services/dealFlowOracle'

const oracle = new DealFlowOracle()
await oracle.start()
```

### Manual Sync Operations

#### Full Sync
```javascript
// Sync both companies and deals
await fetch('/api/oracle', {
  method: 'POST',
  body: JSON.stringify({ action: 'sync' })
})
```

#### Companies Only
```javascript
await fetch('/api/oracle', {
  method: 'POST',
  body: JSON.stringify({ action: 'sync-companies' })
})
```

#### Deals Only
```javascript
await fetch('/api/oracle', {
  method: 'POST',
  body: JSON.stringify({ action: 'sync-deals' })
})
```

### Health Monitoring

```javascript
const health = await fetch('/api/oracle?action=health')
const status = await health.json()

console.log('Service Status:', status.health.status)
console.log('Supabase Connected:', status.health.supabase.connected)
console.log('Blockchain Connected:', status.health.blockchain.connected)
```

## Real-time Synchronization

The oracle service supports real-time synchronization through Supabase subscriptions:

```typescript
// Setup real-time sync
const oracle = new DealFlowOracle()
const subscriptions = oracle.setupRealtimeSync()

// This will automatically sync new companies and deals as they're added
```

## API Reference

### GET /api/oracle

Query parameters:
- `action=health`: Get health status
- `action=status`: Get service status

### POST /api/oracle

Request body:
```json
{
  "action": "sync|sync-companies|sync-deals|start|stop|health",
  "options": {
    "batchSize": 5,
    "gasLimit": 500000,
    "forceSync": false
  }
}
```

### PUT /api/oracle

Request body:
```json
{
  "action": "setup-realtime"
}
```

## Monitoring and Debugging

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "supabase": {
    "connected": true,
    "url": "https://your-project.supabase.co"
  },
  "blockchain": {
    "connected": true,
    "currentBlock": 18800000,
    "contractAddress": "0x...",
    "companiesOnChain": "42"
  },
  "sync": {
    "lastSync": "2024-01-01T11:55:00.000Z",
    "inProgress": false
  }
}
```

### Common Issues

1. **Blockchain Connection Failed**
   - Check RPC URL and network connectivity
   - Verify wallet has sufficient ETH for gas

2. **Supabase Connection Failed**
   - Verify Supabase URL and API key
   - Check database permissions

3. **Sync Failures**
   - Check smart contract authorization
   - Monitor gas prices and limits
   - Verify data integrity

## Security Considerations

- **Private Key Security**: Store private keys securely, never commit to version control
- **API Access**: Implement proper authentication for oracle API endpoints
- **Contract Authorization**: Only authorize trusted wallets in the smart contract
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Monitoring**: Set up alerts for sync failures and security events

## Performance Optimization

- **Batch Size**: Tune batch size based on gas limits and network conditions
- **Sync Frequency**: Adjust sync intervals based on data update frequency
- **Gas Optimization**: Optimize smart contract calls to minimize gas usage
- **Database Indexing**: Ensure proper indexing on Supabase tables

## Development

### Running Tests
```bash
npm test -- oracle
```

### Local Development
```bash
npm run dev
# Access dashboard at http://localhost:3000/admin/oracle
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License. 