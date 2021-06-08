CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    day INTEGER NOT NULL CHECK (day>=1 AND day<=7),
    start_at VARCHAR(10),
    end_at VARCHAR(10)
);
ALTER TABLE schedules ADD FOREIGN KEY (user_id) REFERENCES users(user_id);