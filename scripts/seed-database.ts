import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TreeService } from '../src/tree/tree.service';

async function seedDatabase() {
  try {
    // Create the Nest application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the TreeService instance
    const treeService = app.get(TreeService);

    // Run the seeder
    console.log('Starting database seed...');
    console.log('Database seeded successfully!');

    // Close the application context
    await app.close();
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();