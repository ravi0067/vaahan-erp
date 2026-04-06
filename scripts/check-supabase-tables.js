import pg from 'pg';
const { Client } = pg;

async function checkSupabaseTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('[v0] Connected to Supabase PostgreSQL!\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('=== TABLES IN DATABASE ===');
    console.log(`Total Tables: ${tablesResult.rows.length}\n`);
    
    tablesResult.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.table_name}`);
    });

    // Get RLS policies
    console.log('\n=== RLS POLICIES ===');
    const rlsResult = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);

    if (rlsResult.rows.length === 0) {
      console.log('No RLS policies found.');
    } else {
      console.log(`Total Policies: ${rlsResult.rows.length}\n`);
      rlsResult.rows.forEach((row) => {
        console.log(`Table: ${row.tablename}`);
        console.log(`  Policy: ${row.policyname}`);
        console.log(`  Command: ${row.cmd}`);
        console.log(`  Roles: ${row.roles}`);
        console.log('');
      });
    }

    // Check table row counts
    console.log('\n=== TABLE ROW COUNTS ===');
    for (const row of tablesResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`${row.table_name}: ${countResult.rows[0].count} rows`);
    }

  } catch (error) {
    console.error('[v0] Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSupabaseTables();
