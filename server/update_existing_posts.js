// Node.js script to update existing draft/proposed posts to visible statuses
// Run: node update_existing_posts.js

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { eq, and, isNull, or } = require('drizzle-orm');

// Import schema tables
const {
  jobPostingTable,
  competitionTable,
  achievementTable,
  higherStudyTable,
  researchTable
} = require('./src/db/schema');

// Database configuration (update with your DB credentials)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://username:password@localhost:5432/dbname"
});

const db = drizzle(pool);

async function updatePostStatuses() {
  try {
    console.log('🔄 Updating existing post statuses...\n');

    // Update Jobs from 'draft' to 'active'
    const jobsUpdated = await db
      .update(jobPostingTable)
      .set({ status: 'active' })
      .where(and(
        eq(jobPostingTable.status, 'draft'),
        isNull(jobPostingTable.deletedAt)
      ));
    console.log(`✅ Updated ${jobsUpdated.rowCount || 0} jobs from 'draft' to 'active'`);

    // Update Competitions from 'draft' to 'active'
    const competitionsUpdated = await db
      .update(competitionTable)
      .set({ status: 'active' })
      .where(and(
        eq(competitionTable.status, 'draft'),
        isNull(competitionTable.deletedAt)
      ));
    console.log(`✅ Updated ${competitionsUpdated.rowCount || 0} competitions from 'draft' to 'active'`);

    // Update Achievements from 'draft' to 'published'
    const achievementsUpdated = await db
      .update(achievementTable)
      .set({ status: 'published' })
      .where(and(
        eq(achievementTable.status, 'draft'),
        isNull(achievementTable.deletedAt)
      ));
    console.log(`✅ Updated ${achievementsUpdated.rowCount || 0} achievements from 'draft' to 'published'`);

    // Update Higher Studies from 'draft' to 'active'
    const higherStudiesUpdated = await db
      .update(higherStudyTable)
      .set({ status: 'active' })
      .where(and(
        eq(higherStudyTable.status, 'draft'),
        isNull(higherStudyTable.deletedAt)
      ));
    console.log(`✅ Updated ${higherStudiesUpdated.rowCount || 0} higher studies from 'draft' to 'active'`);

    // Update Research from 'proposed' to 'published'
    const researchUpdated = await db
      .update(researchTable)
      .set({ status: 'published' })
      .where(and(
        eq(researchTable.status, 'proposed'),
        isNull(researchTable.deletedAt)
      ));
    console.log(`✅ Updated ${researchUpdated.rowCount || 0} research from 'proposed' to 'published'`);

    console.log('\n🎉 All existing posts updated successfully!');
    console.log('🔄 Restart your frontend to see the posts in StarterFeed.');

  } catch (error) {
    console.error('❌ Error updating post statuses:', error);
  } finally {
    await pool.end();
    console.log('\n🔒 Database connection closed.');
  }
}

updatePostStatuses();
