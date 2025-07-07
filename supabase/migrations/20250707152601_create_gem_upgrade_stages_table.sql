CREATE TABLE IF NOT EXISTS gem_upgrade_stages (
    level INTEGER PRIMARY KEY,
    grade TEXT NOT NULL,
    stat_increase INTEGER
);
