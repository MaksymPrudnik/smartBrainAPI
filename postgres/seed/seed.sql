BEGIN;

INSERT INTO login (hash, email) VALUES ('$2a$10$sqBxZh5j/BBxAT8qVwn79OXoBNN1LUbGDbl1TP/ASSNS47bqDJHeO', 'jessie@gmail.com');
INSERT INTO users (name, email, entries, joined) VALUES ('Jessie', 'jessie@gmail.com', 5, '2020-01-01');

COMMIT;