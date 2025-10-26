import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get recent tenants
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        property: {
          select: {
            address: true,
            city: true,
            state: true,
          },
        },
      },
    });

    console.log('\n=== RECENT TENANTS ===');
    console.log(`Found ${tenants.length} tenants\n`);

    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.firstName} ${tenant.lastName}`);
      console.log(`   Property: ${tenant.property?.address}, ${tenant.property?.city}, ${tenant.property?.state}`);
      console.log(`   Email: ${tenant.email || 'N/A'}`);
      console.log(`   Phone: ${tenant.phone || 'N/A'}`);
      console.log(`   Move In: ${tenant.moveInDate.toISOString().split('T')[0]}`);
      console.log(`   Active: ${tenant.isActive}`);
      console.log(`   Created: ${tenant.createdAt.toISOString()}`);
      console.log('');
    });

    // Check connection pool status
    const stats = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT count(*) as count FROM tenants
    `;
    console.log(`Total tenants in database: ${stats[0].count}\n`);

  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
