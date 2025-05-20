CREATE TABLE IF NOT EXISTS `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`sha` text,
	`created_at` integer
);


CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    content,
    content='articles',
    content_rowid='id',
    tokenize='unicode61 remove_diacritics 2'
);

-- 当在 'articles' 表中插入新行后，自动将数据插入 FTS 表
CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts (rowid, content) VALUES (new.id, new.content);
END;

-- 当从 'articles' 表中删除行后，自动从 FTS 表删除对应数据
CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
  INSERT INTO articles_fts (articles_fts, rowid, content) VALUES ('delete', old.id, old.content);
END;

-- 当 'articles' 表中的行更新后，自动更新 FTS 表中的对应数据
CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
  INSERT INTO articles_fts (articles_fts, rowid, content) VALUES ('delete', old.id, old.content); -- 先删除旧版本
  INSERT INTO articles_fts (rowid, content) VALUES (new.id, new.content);                         -- 再插入新版本
END;