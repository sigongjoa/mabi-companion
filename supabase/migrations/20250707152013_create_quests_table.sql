CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    text TEXT NOT NULL
);
