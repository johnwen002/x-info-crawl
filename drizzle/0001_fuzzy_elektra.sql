CREATE TABLE `twitters` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`sha` text,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `twitters_sha_unique` ON `twitters` (`sha`);



CREATE VIRTUAL TABLE IF NOT EXISTS twitters_fts USING fts5(
    content,
    content='twitters',
    content_rowid='id',
    tokenize='unicode61 remove_diacritics 2'
);

-- 当在 'twitters' 表中插入新行后，自动将数据插入 FTS 表
CREATE TRIGGER IF NOT EXISTS twitters_ai AFTER INSERT ON twitters BEGIN
  INSERT INTO twitters_fts (rowid, content) VALUES (new.id, new.content);
END;

-- 当从 'twitters' 表中删除行后，自动从 FTS 表删除对应数据
CREATE TRIGGER IF NOT EXISTS twitters_ad AFTER DELETE ON twitters BEGIN
  INSERT INTO twitters_fts (twitters_fts, rowid, content) VALUES ('delete', old.id, old.content);
END;

-- 当 'twitters' 表中的行更新后，自动更新 FTS 表中的对应数据
CREATE TRIGGER IF NOT EXISTS twitters_au AFTER UPDATE ON twitters BEGIN
  INSERT INTO twitters_fts (twitters_fts, rowid, content) VALUES ('delete', old.id, old.content); -- 先删除旧版本
  INSERT INTO twitters_fts (rowid, content) VALUES (new.id, new.content);                         -- 再插入新版本
END;
