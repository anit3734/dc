const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFieldFillRates() {
  const total = await prisma.company.count();
  console.log(`\n=== FIELD FILL RATE REPORT (${total} companies) ===\n`);

  // Raw SQL fill-rate checks — avoids Prisma query builder limitations
  const checkField = async (field, numeric = false) => {
    let query = numeric
      ? `SELECT COUNT(*) as cnt FROM Company WHERE ${field} IS NOT NULL AND ${field} > 0`
      : `SELECT COUNT(*) as cnt FROM Company WHERE ${field} IS NOT NULL AND ${field} != '' AND ${field} != 'N.A.' AND ${field} != 'NA'`;
    const rows = await prisma.$queryRawUnsafe(query);
    return Number(rows[0].cnt);
  };

  const fields = [
    { name: 'name',             numeric: false },
    { name: 'cin',              numeric: false },
    { name: 'state',            numeric: false },
    { name: 'status',           numeric: false },
    { name: 'address',          numeric: false },
    { name: 'email',            numeric: false },
    { name: 'telephone',        numeric: false },
    { name: 'website',          numeric: false },
    { name: 'incorporation_date', numeric: false },
    { name: 'age',              numeric: false },
    { name: 'roc',              numeric: false },
    { name: 'category',         numeric: false },
    { name: 'class',            numeric: false },
    { name: 'listed',           numeric: false },
    { name: 'llp_status',       numeric: false },
    { name: 'nic_code',         numeric: false },
    { name: 'nic_description',  numeric: false },
    { name: 'authorized_capital', numeric: true },
    { name: 'paid_up_capital',  numeric: true },
    { name: 'registration_no',  numeric: false },
  ];

  for (const f of fields) {
    const filled = await checkField(f.name, f.numeric);
    const pct = total > 0 ? ((filled / total) * 100).toFixed(1) : 0;
    const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20, '░');
    const emoji = pct >= 80 ? '✅' : pct >= 50 ? '⚠️' : '❌';
    console.log(`${emoji} ${f.name.padEnd(22)} ${bar} ${pct}% (${filled}/${total})`);
  }

  // Director stats via raw SQL
  const dirRows = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM Director`);
  const totalDirs = Number(dirRows[0].cnt);
  const compWithDirs = await prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT company_id) as cnt FROM Director`);
  const withDirs = Number(compWithDirs[0].cnt);
  console.log(`\n✅ ${'directors'.padEnd(22)} ${((withDirs/total)*100).toFixed(1)}% companies have directors (${totalDirs} total directors)`);

  // Sample record
  const sample = await prisma.company.findFirst({ 
    include: { directors: { take: 2 } },
    where: { address: { not: null } }
  });
  if (sample) {
    console.log(`\n── SAMPLE RECORD ──────────────────────────`);
    console.log(`Name:     ${sample.name}`);
    console.log(`CIN:      ${sample.cin}`);
    console.log(`Address:  ${sample.address?.slice(0, 100) || 'EMPTY'}`);
    console.log(`Email:    ${sample.email || 'EMPTY'}`);
    console.log(`Phone:    ${sample.telephone || 'EMPTY'}`);
    console.log(`Website:  ${sample.website || 'EMPTY'}`);
    console.log(`Inc Date: ${sample.incorporation_date || 'EMPTY'}`);
    console.log(`Age:      ${sample.age || 'EMPTY'}`);
    console.log(`Directors:${sample.directors.map(d => d.name).join(', ') || 'NONE'}`);
    console.log(`────────────────────────────────────────────`);
  }

  await prisma.$disconnect();
}

checkFieldFillRates().catch(e => { console.error(e); process.exit(1); });
