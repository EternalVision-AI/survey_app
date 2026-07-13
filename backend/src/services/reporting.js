const languages = {
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
};

export function buildSummaryReport(db) {
  const totalsStmt = db.prepare(
    `SELECT language, COUNT(*) as total
       FROM responses
      GROUP BY language`
  );
  const q1Stmt = db.prepare(
    `SELECT q1_value as answer, COUNT(*) as total
       FROM responses
      GROUP BY q1_value`
  );

  const data = {
    totalsByLanguage: {},
    q1Distribution: {},
    timestamp: new Date().toISOString(),
  };

  for (const row of totalsStmt.iterate()) {
    data.totalsByLanguage[row.language] = {
      label: languages[row.language] || row.language,
      responses: row.total,
    };
  }

  for (const row of q1Stmt.iterate()) {
    data.q1Distribution[row.answer] = row.total;
  }

  return data;
}

export function buildDetailedReport(db, language) {
  const stmt = db.prepare(
    `SELECT
        id,
        created_at as createdAt,
        language,
        kesb,
        name,
        role,
        q1_value as q1,
        q2_value as q2,
        q3_value as q3
      FROM responses
      WHERE (? IS NULL) OR (language = ?)
      ORDER BY created_at DESC`
  );
  const rows = stmt.all(language ?? null, language ?? null);
  return {
    language: language ?? "all",
    total: rows.length,
    responses: rows,
  };
}

