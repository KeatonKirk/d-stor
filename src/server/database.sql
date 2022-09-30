CREATE DATABASE users

CREATE TABLE user
(
	user_id SERIAL PRIMARY KEY,
	address VARCHAR(255),
	stream_id VARCHAR(255),
	encrypted_key VARCHAR(255),
	ceramic_info JSONB NOT NULL DEFAULT '{}'::JSONB
);