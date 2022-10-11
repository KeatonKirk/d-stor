CREATE DATABASE users

CREATE TABLE users
(
	user_id SERIAL PRIMARY KEY,
	address VARCHAR(255),
	bucket_id VARCHAR(255),
	encrypted_key VARCHAR(400),
	nft_info JSONB NOT NULL DEFAULT '{}'::JSONB
);