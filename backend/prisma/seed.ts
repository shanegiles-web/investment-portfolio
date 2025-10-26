import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - be careful in production!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.document.deleteMany();
    await prisma.rebalancingTarget.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.farmOperation.deleteMany();
    await prisma.entity.deleteMany();
    await prisma.propertyTransaction.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.property.deleteMany();
    await prisma.price.deleteMany();
    await prisma.taxLot.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.position.deleteMany();
    await prisma.account.deleteMany();
    await prisma.investmentType.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create test user
  console.log('👤 Creating test user...');
  const passwordHash = await bcrypt.hash('TestPassword123!', 10);

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: 'OWNER',
    },
  });
  console.log(`✅ Created user: ${testUser.email}`);

  // Create investment types
  console.log('💼 Creating investment types...');
  const equityType = await prisma.investmentType.create({
    data: {
      name: 'Mutual Fund',
      category: 'EQUITY',
      isCustom: false,
    },
  });

  const bondType = await prisma.investmentType.create({
    data: {
      name: 'Treasury Bond',
      category: 'FIXED_INCOME',
      isCustom: false,
    },
  });

  const moneyMarketType = await prisma.investmentType.create({
    data: {
      name: 'Money Market Fund',
      category: 'CASH',
      isCustom: false,
    },
  });

  const etfType = await prisma.investmentType.create({
    data: {
      name: 'ETF',
      category: 'EQUITY',
      isCustom: false,
    },
  });

  console.log(`✅ Created ${4} investment types`);

  // Create test accounts
  console.log('🏦 Creating test accounts...');
  const brokerageAccount = await prisma.account.create({
    data: {
      userId: testUser.id,
      accountType: 'Brokerage',
      accountName: 'Vanguard Brokerage',
      institution: 'Vanguard',
      accountNumber: '****1234',
      taxTreatment: 'TAXABLE',
      owner: 'John Doe',
      isActive: true,
    },
  });

  const iraAccount = await prisma.account.create({
    data: {
      userId: testUser.id,
      accountType: 'Traditional IRA',
      accountName: 'Vanguard IRA',
      institution: 'Vanguard',
      accountNumber: '****5678',
      taxTreatment: 'TAX_DEFERRED',
      owner: 'John Doe',
      isActive: true,
    },
  });

  console.log(`✅ Created ${2} accounts`);

  // Create sample positions
  console.log('📊 Creating sample positions...');
  const vtsax = await prisma.position.create({
    data: {
      accountId: brokerageAccount.id,
      investmentTypeId: equityType.id,
      symbol: 'VTSAX',
      name: 'Vanguard Total Stock Market Index Fund',
      shares: 100,
      costBasisTotal: 10000,
      costBasisPerShare: 100,
      currentPrice: 115,
      currentValue: 11500,
      unrealizedGainLoss: 1500,
      lastUpdated: new Date(),
    },
  });

  const vbtlx = await prisma.position.create({
    data: {
      accountId: iraAccount.id,
      investmentTypeId: bondType.id,
      symbol: 'VBTLX',
      name: 'Vanguard Total Bond Market Index Fund',
      shares: 200,
      costBasisTotal: 20000,
      costBasisPerShare: 100,
      currentPrice: 98,
      currentValue: 19600,
      unrealizedGainLoss: -400,
      lastUpdated: new Date(),
    },
  });

  const vmmxx = await prisma.position.create({
    data: {
      accountId: brokerageAccount.id,
      investmentTypeId: moneyMarketType.id,
      symbol: 'VMMXX',
      name: 'Vanguard Federal Money Market Fund',
      shares: 5000,
      costBasisTotal: 5000,
      costBasisPerShare: 1,
      currentPrice: 1,
      currentValue: 5000,
      unrealizedGainLoss: 0,
      lastUpdated: new Date(),
    },
  });

  console.log(`✅ Created ${3} positions`);

  // Create sample transactions
  console.log('💸 Creating sample transactions...');
  const transaction1 = await prisma.transaction.create({
    data: {
      accountId: brokerageAccount.id,
      positionId: vtsax.id,
      transactionType: 'BUY',
      transactionDate: new Date('2024-01-15'),
      settlementDate: new Date('2024-01-17'),
      shares: 50,
      pricePerShare: 100,
      totalAmount: 5000,
      fees: 0,
      description: 'Initial purchase of VTSAX',
      isReconciled: true,
    },
  });

  const transaction2 = await prisma.transaction.create({
    data: {
      accountId: brokerageAccount.id,
      positionId: vtsax.id,
      transactionType: 'BUY',
      transactionDate: new Date('2024-06-15'),
      settlementDate: new Date('2024-06-17'),
      shares: 50,
      pricePerShare: 100,
      totalAmount: 5000,
      fees: 0,
      description: 'Additional purchase of VTSAX',
      isReconciled: true,
    },
  });

  const transaction3 = await prisma.transaction.create({
    data: {
      accountId: brokerageAccount.id,
      positionId: vtsax.id,
      transactionType: 'DIVIDEND',
      transactionDate: new Date('2024-09-30'),
      totalAmount: 150,
      fees: 0,
      description: 'Quarterly dividend',
      isReconciled: true,
    },
  });

  console.log(`✅ Created ${3} transactions`);

  // Create sample tax lots
  console.log('📋 Creating tax lots...');
  await prisma.taxLot.create({
    data: {
      positionId: vtsax.id,
      acquisitionDate: new Date('2024-01-15'),
      shares: 50,
      costBasis: 5000,
      holdingPeriodType: 'LONG_TERM',
    },
  });

  await prisma.taxLot.create({
    data: {
      positionId: vtsax.id,
      acquisitionDate: new Date('2024-06-15'),
      shares: 50,
      costBasis: 5000,
      holdingPeriodType: 'SHORT_TERM',
    },
  });

  console.log(`✅ Created ${2} tax lots`);

  // Create sample price data
  console.log('💹 Creating price data...');
  const today = new Date();
  await prisma.price.createMany({
    data: [
      {
        symbol: 'VTSAX',
        date: today,
        open: 114.5,
        high: 115.8,
        low: 114.2,
        close: 115,
        volume: BigInt(1000000),
        adjustedClose: 115,
        source: 'manual',
      },
      {
        symbol: 'VBTLX',
        date: today,
        open: 98.2,
        high: 98.5,
        low: 97.8,
        close: 98,
        volume: BigInt(500000),
        adjustedClose: 98,
        source: 'manual',
      },
      {
        symbol: 'VMMXX',
        date: today,
        open: 1,
        high: 1,
        low: 1,
        close: 1,
        volume: BigInt(10000000),
        adjustedClose: 1,
        source: 'manual',
      },
    ],
  });

  console.log(`✅ Created price data for ${3} symbols`);

  // Create a sample entity (LLC)
  console.log('🏢 Creating sample entity...');
  const sampleLLC = await prisma.entity.create({
    data: {
      userId: testUser.id,
      entityType: 'LLC',
      entityName: 'Sample Real Estate LLC',
      ein: '12-3456789',
      formationDate: new Date('2020-01-01'),
      ownershipPercent: 100,
    },
  });

  console.log(`✅ Created entity: ${sampleLLC.entityName}`);

  // Create a sample property
  console.log('🏡 Creating sample property...');
  const sampleProperty = await prisma.property.create({
    data: {
      userId: testUser.id,
      entityId: sampleLLC.id,
      propertyType: 'RESIDENTIAL',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      purchaseDate: new Date('2020-03-15'),
      purchasePrice: 250000,
      currentValue: 300000,
      loanBalance: 180000,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      lotSize: 0.25,
    },
  });

  console.log(`✅ Created property: ${sampleProperty.address}`);

  // Create a sample lease
  console.log('📄 Creating sample lease...');
  await prisma.lease.create({
    data: {
      propertyId: sampleProperty.id,
      tenantName: 'Jane Smith',
      tenantContact: 'jane.smith@email.com',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyRent: 1800,
      securityDeposit: 3600,
      isActive: true,
    },
  });

  console.log(`✅ Created lease for property`);

  // Create rebalancing targets
  console.log('🎯 Creating rebalancing targets...');
  await prisma.rebalancingTarget.createMany({
    data: [
      {
        userId: testUser.id,
        assetClass: 'US Stocks',
        targetPercent: 60,
        minPercent: 55,
        maxPercent: 65,
      },
      {
        userId: testUser.id,
        assetClass: 'Bonds',
        targetPercent: 30,
        minPercent: 25,
        maxPercent: 35,
      },
      {
        userId: testUser.id,
        assetClass: 'Cash',
        targetPercent: 10,
        minPercent: 5,
        maxPercent: 15,
      },
    ],
  });

  console.log(`✅ Created ${3} rebalancing targets`);

  console.log('\n✨ Database seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 1`);
  console.log(`   - Accounts: 2`);
  console.log(`   - Investment Types: 4`);
  console.log(`   - Positions: 3`);
  console.log(`   - Transactions: 3`);
  console.log(`   - Tax Lots: 2`);
  console.log(`   - Prices: 3`);
  console.log(`   - Entities: 1`);
  console.log(`   - Properties: 1`);
  console.log(`   - Leases: 1`);
  console.log(`   - Rebalancing Targets: 3`);
  console.log('\n🔑 Test Credentials:');
  console.log(`   Email: test@example.com`);
  console.log(`   Password: TestPassword123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
