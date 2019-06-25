The folder 'Project-1' contains all the files related to the application. Copy the folder in the directory of your choice.

Languages : Javascript
Database : Mysql (Version: 5.16.2)
Server Side : Nodejs (Version: 8.9.4)
Front-end : HTML 5, Embedded JS (Version: 2.5.7), CSS
Framework : Express (Version: 4.16.2)
ORM : Sequelize (Version: 4.33.4)
Middleware : Body-Parser (Version: 1.18.2)

Server Setup:

Download npm (Node Package Manager) and node.js from here 'https://www.npmjs.com/get-npm'

To install all the dependencies - Open terminal/command prompt, navigate to the folder 'Project-1' and enter 'npm install'
Starting point of the application - app.js
To start the server - enter 'node app.js'

Database :

Download and install Mysql on your machine. Start the mysql server by navigating to the mysql folder on the command prompt and enter 'mysqld --console' and open another prompt and enter mysql -p root -u and enter the password to launch mysql server.

Import the Library Data:
Import the "Library" data by executing the script "create-library-data-for-MySQL.sql" SQL script (found in the attached .zip file) from the MySQL prompt. This script should work on both Windows and OSX.

SQL scripts can be executed from the MySQL Prompt using the "source" command. This example assumes that MySQL was launched from the same directory that the create-company script resides. Otherwise, you may have to include an absolute path location.
mysql> source create-library-data-for-MySQL.sql

Launch Application :

Now bothe node and mysql servers are up, open the chrome browser and enter localhost:3000 and the apllication launches. Use the quick start guide to use the application.







