// Quick script to check what's actually in the database
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

// Simple database query to see what posts exist
async function debugDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/cpn_ai_db"
  });

  try {
    console.log('🔍 Checking database contents...\n');

    // Check each table directly with SQL
    const queries = [
      { name: 'Jobs', sql: 'SELECT job_id, title, status, created_at FROM tbl_job_posting WHERE deleted_at IS NULL LIMIT 5' },
      { name: 'Competitions', sql: 'SELECT competition_id, title, status, created_at FROM tbl_competition WHERE deleted_at IS NULL LIMIT 5' },
      { name: 'Achievements', sql: 'SELECT achievement_id, title, status, created_at FROM tbl_achievement WHERE deleted_at IS NULL LIMIT 5' },
      { name: 'Higher Studies', sql: 'SELECT higher_study_id, title, status, created_at FROM tbl_higher_study WHERE deleted_at IS NULL LIMIT 5' },
      { name: 'Research', sql: 'SELECT research_id, title, status, created_at FROM tbl_research WHERE deleted_at IS NULL LIMIT 5' }
    ];

    for (const query of queries) {
      try {
        const result = await pool.query(query.sql);
        console.log(`📊 ${query.name}: ${result.rows.length} records found`);
        if (result.rows.length > 0) {
          console.log('   Sample records:');
          result.rows.forEach(row => {
            console.log(`   - "${row.title}" (status: ${row.status})`);
          });
        }
        console.log('');
      } catch (err) {
        console.log(`❌ Error querying ${query.name}: ${err.message}\n`);
      }
    }

    // Count by status
    console.log('📈 Status counts:');
    const statusQueries = [
      'SELECT status, COUNT(*) as count FROM tbl_job_posting WHERE deleted_at IS NULL GROUP BY status',
      'SELECT status, COUNT(*) as count FROM tbl_competition WHERE deleted_at IS NULL GROUP BY status',
      'SELECT status, COUNT(*) as count FROM tbl_achievement WHERE deleted_at IS NULL GROUP BY status',
      'SELECT status, COUNT(*) as count FROM tbl_higher_study WHERE deleted_at IS NULL GROUP BY status',
      'SELECT status, COUNT(*) as count FROM tbl_research WHERE deleted_at IS NULL GROUP BY status'
    ];

    const tableNames = ['Jobs', 'Competitions', 'Achievements', 'Higher Studies', 'Research'];

    for (let i = 0; i < statusQueries.length; i++) {
      try {
        const result = await pool.query(statusQueries[i]);
        console.log(`${tableNames[i]}:`, result.rows.map(r => `${r.status}(${r.count})`).join(', '));
      } catch (err) {
        console.log(`${tableNames[i]}: Error - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await pool.end();
  }
}

debugDatabase();
