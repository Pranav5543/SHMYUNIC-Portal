import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  
  // Try to fetch categories
  const categories = await prisma.category.findMany();
  console.log(`\n✅ Successfully fetched ${categories.length} categories.`);
  
  // Try to fetch products
  const products = await prisma.product.findMany({
    take: 3
  });
  
  console.log(`\n✅ Successfully fetched ${products.length} sample products:`);
  products.forEach(p => {
    console.log(` - ${p.name}`);
  });
  
}

main()
  .catch(e => {
    console.error('\n❌ Database connection failed:');
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
