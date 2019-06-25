/*Create Database*/
CREATE DATABASE MYDB;
USE MYDB;

/*Create Table*/
create table book (
	ISBN	VARCHAR(10) NOT NULL primary key,
	Title	Varchar(255) 
);

create table book_author(
	author_id	int NOT NULL primary key,
	ISBN		VARCHAR(10) primary key,
	foreign key (author_id) REFERENCES authors(author_id),
	foreign key (ISBN) references book(ISBN)
);

create table authors(
	author_id	int NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name 		VARCHAR(255) NOT NULL unique
);

CREATE TABLE borrower (
    card_id varchar(255) not Null primary key,
    ssn VARCHAR(11) NOT NULL,
    bname varchar(255),
    address varchar(255),
    phone varchar(14)
    
    
);

CREATE TABLE book_loans (
    loan_id int not Null primary key,
    ISBN VARCHAR(10) NOT NULL,
    card_id varchar(255),
    date_out date,
    due_date date,
    due_in date,
    foreign key (ISBN) references book(ISBN),
    foreign key (card_id) references borrower(card_id)
);

CREATE TABLE fines (
    loan_id int not Null primary key,
    fine_amt decimal(2,2),
    paid boolean,
    foreign key (loan_id) references book_loans(loan_id)
);


/*Import books.csv file in to mydb database into books table that has been created but not shown above as it was created using UI*/
/*In the similar way borrowers.csv file was imported and a table was created but the delimeter chosen was ','*/
LOAD DATA LOCAL INFILE 'C:\\Users\\akash\\Documents\\UTD\\DB\\books.csv'
INTO TABLE mydb.books 
FIELDS TERMINATED BY '\t' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

create table books(
ISBN10 		VARCHAR(10) ,
ISBN13		VARCHAR(13) ,
Title		VARCHAR(255),
Author		VARCHAR(255),
Cover		VARCHAR(255),
Publisher	VARCHAR(255),
Pages		int
);

create table borrowers_tmp(
card_id 	VARCHAR(25) NOT NULL,
ssn			CHAR(11) NOT NULL,
first_name	VARCHAR(255),
last_name	VARCHAR(255),
email		VARCHAR(255),
address		VARCHAR(255),
city		VARCHAR(255),
state		VARCHAR(255),
phone		CHAR(14)
);
/*Inserting data into Authors table*/

INSERT INTO mydb.authors(name) 
      
select name from mydb.authors
Union
SELECT  

	SUBSTRING_INDEX(SUBSTRING_INDEX(Author, ',', 1),',',-1)
    from mydb.books
    Union
Select
    SUBSTRING_INDEX(SUBSTRING_INDEX(Author, ',', 2),',',-1)
    from mydb.books
    union
select
    SUBSTRING_INDEX(SUBSTRING_INDEX(Author, ',', 3),',',-1)
    from mydb.books
    union
select
    SUBSTRING_INDEX(SUBSTRING_INDEX(Author, ',', 4),',',-1)
    from mydb.books
    union
select
    SUBSTRING_INDEX(SUBSTRING_INDEX(Author, ',', 5),',',-1)
    from mydb.books;
    
    
insert into book 
select ISBN10, Title from books;

insert into book_authors
select b.author_id, a.ISBN  from (
select ISBN10 as ISBN, substring_index(Author,',',1) as temp_author from books
union
select ISBN10 as ISBN, substring_index(substring_index(Author,',',2),',',-1) as temp_author from books
union
select ISBN10 as ISBN, substring_index(substring_index(Author,',',3),',',-1) as temp_author from books
union
select ISBN10 as ISBN, substring_index(substring_index(Author,',',-2),',',1) as temp_author from books
union
select ISBN10 as ISBN, substring_index(Author,',',-1) as temp_author from books) a,authors b  where a.temp_author !="" and temp_author = b.name;

insert into borrower 
select card_id, ssn, concat(first_name," ",last_name), concat(Address,",",city,",",state ) ,phone from borrowers_tmp;






