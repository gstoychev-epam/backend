INSERT INTO users (name, email, password) VALUES
    ('Georgi Stoychev', 'georgi_stoychev@epam.com', 'Password1234'),
    ('Root Admin', 'root_admin@example.com', 'PasswordUnknown2');

INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES 
    (uuid_generate_v4(), 'f6dbd6cc-3238-40cc-994b-8938c105a108', now(), now(), 'OPEN'),
    (uuid_generate_v4(), '43e7e7ab-ccf7-45ef-8313-93c13d81f9be', now(), now(), 'ORDERED');


INSERT INTO cart_items (cart_id, product_id, count) VALUES
    ('f6dbd6cc-3238-40cc-994b-8938c105a108', '8dbe2d62-39ca-4a90-9013-654e983eb8ee', 3),
    ('f6dbd6cc-3238-40cc-994b-8938c105a108', '830897ae-9d0b-431b-95d9-9098aeedfc21', 2);