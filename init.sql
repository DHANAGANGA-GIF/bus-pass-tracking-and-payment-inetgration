-- Initial database setup
-- Create extension for uuid if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial roles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Role" WHERE name = 'USER') THEN
        INSERT INTO "Role" (name, description) VALUES ('USER', 'Regular user');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM "Role" WHERE name = 'ADMIN') THEN
        INSERT INTO "Role" (name, description) VALUES ('ADMIN', 'Administrator');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM "Role" WHERE name = 'SUPER_ADMIN') THEN
        INSERT INTO "Role" (name, description) VALUES ('SUPER_ADMIN', 'Super Administrator');
    END IF;
END $$;