-- Starter data for the church library

INSERT INTO authors (name) VALUES
  ('Chinua Achebe'),
  ('Jane Austen'),
  ('George Orwell'),
  ('Mary Shelley'),
  ('Ngugi wa Thiong''o');

INSERT INTO books (title, year, category, author_id)
SELECT title, year, category, a.id
FROM (
  VALUES
    ('Things Fall Apart', 1958, 'Literature'),
    ('No Longer at Ease', 1960, 'Literature'),
    ('Pride and Prejudice', 1813, 'History'),
    ('Emma', 1815, 'History'),
    ('1984', 1949, 'Science'),
    ('Animal Farm', 1945, 'Languages'),
    ('Frankenstein', 1818, 'Science'),
    ('The Last Man', 1826, 'Art'),
    ('Petals of Blood', 1977, 'History'),
    ('Devil on the Cross', 1980, 'Languages')
) AS books_data(title, year, category)
JOIN authors a
  ON a.name = CASE
    WHEN books_data.title = 'Things Fall Apart' THEN 'Chinua Achebe'
    WHEN books_data.title = 'No Longer at Ease' THEN 'Chinua Achebe'
    WHEN books_data.title = 'Pride and Prejudice' THEN 'Jane Austen'
    WHEN books_data.title = 'Emma' THEN 'Jane Austen'
    WHEN books_data.title = '1984' THEN 'George Orwell'
    WHEN books_data.title = 'Animal Farm' THEN 'George Orwell'
    WHEN books_data.title = 'Frankenstein' THEN 'Mary Shelley'
    WHEN books_data.title = 'The Last Man' THEN 'Mary Shelley'
    WHEN books_data.title = 'Petals of Blood' THEN 'Ngugi wa Thiong''o'
    WHEN books_data.title = 'Devil on the Cross' THEN 'Ngugi wa Thiong''o'
  END;

INSERT INTO members (name, phone) VALUES
  ('Amina Yusuf', '024-100-1001'),
  ('Daniel Okafor', '024-100-1002'),
  ('Grace Mensah', '024-100-1003'),
  ('Kwame Boateng', '024-100-1004'),
  ('Bola Ade', '024-100-1005');

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT b.id, m.id, current_date - 20, current_date - 6, current_date - 3
FROM books b
JOIN authors a
  ON a.id = b.author_id
JOIN members m
  ON m.name = 'Grace Mensah'
WHERE b.title = 'Pride and Prejudice'
  AND a.name = 'Jane Austen';

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT b.id, m.id, current_date, current_date + 14, NULL
FROM books b
JOIN authors a
  ON a.id = b.author_id
JOIN members m
  ON m.name = 'Amina Yusuf'
WHERE b.title = 'Things Fall Apart'
  AND a.name = 'Chinua Achebe';

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT b.id, m.id, current_date, current_date + 14, NULL
FROM books b
JOIN authors a
  ON a.id = b.author_id
JOIN members m
  ON m.name = 'Daniel Okafor'
WHERE b.title = '1984'
  AND a.name = 'George Orwell';
