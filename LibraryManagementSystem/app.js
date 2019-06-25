var express = require('express');
var mysql2 = require('mysql2');
//var mysql = require('mysql');
const Sequelize = require('sequelize');
var bodyParser = require("body-parser");
//start the express server


const sequelize = new Sequelize('mydb', 'root', 'root',{

    host: 'localhost',
    port: 3306,
    dialect: 'mysql'

});
  

  // Or you can simply use a connection uri
//const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

/*
sequelize.query("SELECT * FROM `book`", { type: sequelize.QueryTypes.SELECT})
.then(users => {
    console.log(users);
// We don't need spread here, since only the results will be returned for select queries
})*/
var app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));

app.get("/", function(req, res) {
    res.render("landing");

});

app.post("/", function(req, res) {

    var search = req.body.query;

    /*
    SELECT Orders.OrderID, Customers.CustomerName, Shippers.ShipperName
    FROM ((Orders
    INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID)
    INNER JOIN Shippers ON Orders.ShipperID = Shippers.ShipperID);
    
    select book.ISBN,book.title,authors.name
    from ((book
    Inner Join book_authors On book.ISBN =  book_authors.ISBN)         
    Inner Join authors On authors.author_id = book_authors.author_id)
                                            
    select
    */
    //sequelize.query("Select * from (select ISBN,Title,Authors, 'NA' as ind from book where (book.ISBN= '"+search+"' or book.authors like'%"+search+"%'or book.title like'%"+search+"%') and exists (select 1 from book_loans  where book.ISBN = book_loans.ISBN and book_loans.date_in is null) union select ISBN,Title,Authors, 'Available' as ind from book where (book.ISBN= '"+search+"' or book.authors like'%"+search+"%'or book.title like'%"+search+"%') and (exists (select 1 from book_loans  where book.ISBN = book_loans.ISBN and book_loans.date_in is not null) or not exists (select 1 from book_loans  where book.ISBN = book_loans.ISBN))) x;")
    sequelize.query("Select * from(select x.ISBN,Title, Authors, if(exists (select 1 from book_loans  where x.ISBN = book_loans.ISBN and book_loans.date_in is null),'NO','YES') as ind from book JOIN (select ISBN,GROUP_CONCAT(name SEPARATOR ', ') as Authors from authors JOIN book_authors ON authors.author_id = book_authors.author_id group by ISBN)x ON book.ISBN= x.ISBN where (x.ISBN  like '%"+search+"%' or book.Title like '%"+search+"%' or Authors like '%"+search+"%' ) ) y;")
        .then(users => {
        //console.log(users);

        
        res.render("searchresult",{result: users[0]});
    });
// We don't need spread here, since only the results will be returned for select queries

});

app.get("/checkout/:ISBN",function(req,res){

    var isbn = req.params.ISBN;

    sequelize.query("select count(ISBN) as cnt from book_loans where ISBN='"+isbn+"' and date_in is null;")
        .then(count=>{
            if(count[0][0].cnt!=0)
            {
                res.render("checkouterr");
            }
            else
            {
                res.render("checkout",{isbn:isbn});
            }
        });

    

    

});

app.post("/checkout/:ISBN",function(req,res){
    
    var isbn = req.params.ISBN;
    var checkoutPost = req.body.cardNumber;
    //console.log(checkoutPost);
    //console.log(isbn);
    sequelize.query("select count(ISBN) as cnt from book_loans where ISBN='"+isbn+"' and date_in is null;")
        .then(count=>{
            //console.log(count[0][0].cnt==0);
            if(count[0][0].cnt==0)
            {
                sequelize.query("select count(card_id) as cntcard from book_loans where card_id ='"+checkoutPost+"' and date_in is null;")
                    .then(checkedout_books =>{
                        //console.log(checkedout_books[0][0].cntcard);
                        
                        if(checkedout_books[0][0].cntcard<3)
                        {
                            
                            
                            sequelize.query("insert into book_loans (ISBN,card_id,date_out,due_date,date_in) values ('"+isbn+"', '"+checkoutPost+"', CURRENT_DATE(), ADDDATE( CURRENT_DATE(), INTERVAL 14 DAY), null);")
                                .then(updatebook_loans =>{
                                    res.render("checkedoutsuccess");
                                });
                               
                                
                        }
                        else
                        {
                            
                            res.render("checkedout3");
                        }
                    });
            }
            else{
                //console.log("book checkout");
                //console.log(count[0][0].cnt);
                res.render("checkouterr");
            }

    });

   // 

});

app.get("/checkin",function(req,res){

   // var isbn = req.params.ISBN;
    res.render("checkin");

    

});

app.post("/checkin",function(req,res){

    var queryString = req.body.query;
    //var queryString = req.params.query;
    console.log(queryString);
    sequelize.query("select * from (SELECT book.ISBN, borrower.card_id, borrower.bname FROM borrower JOIN book_loans ON	book_loans.card_id=borrower.card_id JOIN book ON book.ISBN=book_loans.ISBN where (book.ISBN like '%"+queryString+"%' or borrower.card_id like'%"+queryString+"%' or borrower.bname like '%"+queryString+"%') and book_loans.date_in is null)x;")
        .then(checkinOutput => {
        console.log(checkinOutput);
        
        res.render("checkinresults",{result: checkinOutput[0]});
    });
    
 
});

app.get("/checkin/:ISBN",function(req,res){

    var isbn = req.params.ISBN;
    sequelize.query("update book_loans set date_in = CURRENT_DATE() where ISBN='"+isbn+"';")
        .then(checkinsuccessful =>{


            res.render("checkinsuccess");
        });
});

app.get("/createnewborrower",function(req,res){

    // var isbn = req.params.ISBN;
    res.render("createnewborrower");
 
 });

app.post("/createnewborrower",function(req,res){

    var fullname = req.body.fullname;
    var ssn = req.body.ssn;
    var address = req.body.address;
    var phone = req.body.phone;

    sequelize.query("select count(ssn) as cnt from borrower where ssn='"+ssn+"';")
        .then(ssnCount =>{
            console.log(ssnCount[0][0].cnt);
            console.log(ssnCount);
            if(ssnCount[0][0].cnt==0)
            {   
                sequelize.query("select max(card_id) as maxx from borrower;")
                    .then(maxCradID =>{
                        var card_id =maxCradID[0][0].maxx;
                        var b = card_id.slice(0,2);
                        var a = card_id.slice(2,card_id.length);
                        var c = parseInt(a);
                        var add = c+1;
                        var d= add+"";
                        var len = d.length;
                        var c ="";
                        if((6-len)!=0)
                        {            
                            for(i=0;i<(6-len);i++)
                                {
                                    c+="0";
                                }
                        }
                        var conn = c+d;
                        var card_con= b+conn;
                        sequelize.query("insert into borrower (card_id,ssn,bname,address,phone) values ('"+card_con+"', '"+ssn+"', '"+fullname+"','"+address+"', '"+phone+"');")
                            .then(newborrower =>{
                                res.render("newborrower");
                            });


                    });
                

            }
            else
            {
                res.render("createnewborrowererr");
            }
            
    })
 });

app.get("/updatefines",function(req,res){

    
    sequelize.query("select count(loan_id) as loan from book_loans where (date_in>due_date) and date_in is not null;")
        .then(countLoan =>{
            //date_in is not null
           // console.log(countLoan[0][0]);
            if(countLoan[0][0].loan>0)
            {
                sequelize.query("select loan_id from book_loans where (date_in>due_date);")
                    .then(loanswithdatein =>{
                        //console.log(loanswithdatein);
                        loanswithdatein[0].forEach(function(result)
                        {   
                            //console.log(result.loan_id);
                            sequelize.query("select count(loan_id) as cnt from fines where loan_id = "+result.loan_id+";")
                                .then(countLoanFines =>{
                                    console.log(countLoanFines);
                                    if(countLoanFines[0][0].cnt>0)
                                    {
                                        //loan_id exists check if paid = false
                                        sequelize.query("select paid from fines where loan_id = "+result.loan_id+";")
                                            .then(paid =>{
                                                console.log(paid[0][0].paid);
                                                if(paid[0][0].paid == 0)
                                                {
                                                    //update fine for it
                                                    sequelize.query("select date_in, due_date from book_loans where loan_id = "+result.loan_id+";")
                                                        .then(dates =>{
                                                            //console.log(dates);
                                                            if(true)
                                                            {
                                                            sequelize.query("update fines set fine_amt = ((DATEDIFF('"+dates[0][0].date_in+"','"+dates[0][0].due_date+"'))*0.25) where loan_id="+result.loan_id+";")
                                                                .then(updatedfines =>{
                                                                    //console.log(updatedfines);
                                                                   // console.log("updated");
                                                                });
                                                            }
                                                        });
                                                }
                                            });
                                    }
                                    else{
                                        //loan_id does not exist..so insert a row for it
                                        sequelize.query("select date_in, due_date from book_loans where loan_id = "+result.loan_id+";")
                                            .then(insertRow =>{
                                                console.log(insertRow[0][0].due_date);
                                                if(true){
                                                sequelize.query("insert into fines (loan_id,fine_amt,paid) values ("+result.loan_id+",((DATEDIFF('"+insertRow[0][0].date_in+"','"+insertRow[0][0].due_date+"'))*0.25), false);")
                                                    .then(updatedfines =>{
                                                        //console.log(updatedfines);
                                                    });
                                                }
                                            });
                                    }
                                });
                        });

                    });
            }
        });  
            //date_in is null ...book not returned
        sequelize.query("select count(loan_id) as loan from book_loans where date_in is null and (CURRENT_DATE() > due_date);")
            .then(countwithnull =>{
                if(countwithnull[0][0].loan>0)
                {
                    sequelize.query("select loan_id from book_loans where date_in is null and (CURRENT_DATE() > due_date);")
                        .then(loanswithnull =>{
                            loanswithnull[0].forEach(function(result)
                            {
                                sequelize.query("select count(loan_id) as cnt from fines where loan_id = "+result.loan_id+";")
                                    .then(countLoanFines =>{
                                        if(countLoanFines[0][0].cnt>0)
                                        {
                                        //loan_id exists check if paid = false
                                            sequelize.query("select paid from fines where loan_id = "+result.loan_id+";")
                                                .then(paid =>{

                                                    if(paid[0][0].paid == 0)
                                                    {
                                                    //update fine for it
                                                        sequelize.query("select due_date from book_loans where loan_id = '"+result.loan_id+"';")
                                                            .then(dates =>{
                                                    
                                                            sequelize.query("update fines set fine_amt = ((DATEDIFF(CURRENT_DATE(),'"+dates[0][0].due_date+"'))*0.25) where loan_id='"+result.loan_id+"';")
                                                                .then(updatedfines =>{

                                                                });
                                                    });
                                                    }
                                            });
                                        }
                                        else{
                                            //loan_id does not exist..so insert a row for it
                                            sequelize.query("select due_date from book_loans where loan_id = '"+result.loan_id+"';")
                                                .then(insertRow =>{

                                                    sequelize.query("insert into fines (loan_id,fine_amt,paid) values ('"+result.loan_id+"',((DATEDIFF(CURRENT_DATE(),'"+insertRow[0][0].due_date+"'))*0.25), false);")
                                                        .then(updatedfines => {

                                                        });
                                                });
                                            }
                                })
                            });

                        });
                }


            });
            
            
        res.render("finesupdated");
               
 
});

app.get("/pendingfines",function(req,res){

    res.render("payfinesbycardid");
 
 });

    var paymentdueresults11;
    var paymentdueresults12;
    app.post("/pendingfinebycardid",function(req,res){
      

    var cardID = req.body.cardNumber;
    //var queryString = req.params.query;
    console.log(cardID);
    sequelize.query("select card_id as CardID, sum(fines.fine_amt) as TotalFines from book_loans join fines on book_loans.loan_id = fines.loan_id where book_loans.date_in is not null and fines.paid =0 and card_id ='"+cardID+"'  group by card_id;")
        .then(paymentdueresults => {
        //console.log(paymentdueresults);
        paymentdueresults11 = paymentdueresults;
        console.log(paymentdueresults11);
       // res.render("pendingfines",{result: paymentdueresults[0]});
    
        sequelize.query("select card_id as CardID, sum(fines.fine_amt) as TotalFines from book_loans join fines on book_loans.loan_id = fines.loan_id where fines.paid =0 and card_id = '"+cardID+"'  group by card_id;")
            .then(paymentdueresults1 => {
            //console.log(paymentdueresults1);
            paymentdueresults12 = paymentdueresults1;
            console.log(paymentdueresults12);
            //res.render("pendingfines",{result1: paymentdueresults1[0]});
            res.render("pendingfines",{result: paymentdueresults11[0],result1: paymentdueresults12[0]});
        });
    });
   // console.log(paymentdueresults11);
    

});

app.get("/payfines/:CardID",function(req,res){

    var cardID = req.params.CardID;
    //console.log(cardID);
    sequelize.query("select loan_id from book_loans where card_id='"+cardID+"' and date_in is not null;")
        .then(loanforcardid =>{

            loanforcardid[0].forEach(function(result)
            {
                sequelize.query("update fines set paid = "+true+" where loan_id="+result.loan_id+";")
                    .then(paymentsuccess =>{
                    res.render("paymentsuccess");
                });
            });
            
            
        });
 
 });
/*
app.get("/listpendingfines",function(req,res){

    // var isbn = req.params.ISBN;
    sequelize.query("select book_loans.card_id as CardID, sum(fines.fine_amt) as TotalFines from book_loans join fines on book_loans.loan_id = fines.loan_id where book_loans.date_in is not null and fines.paid =0 and card_id = ''  group by card_id;")
        .then(paymentdueresults =>{
            console.log(paymentdueresults);
            res.render("pendingfines",{result : paymentdueresults[0]});
        });



   // res.render("createnewborrower");
 
 });

app.get("/payfines/:CardID",function(req,res){

    var cardID = req.params.CardID;
    //console.log(cardID);
    sequelize.query("select loan_id from book_loans where card_id='"+cardID+"';")
        .then(loanforcardid =>{

            loanforcardid[0].forEach(function(result)
            {
                sequelize.query("update fines set paid = "+true+" where loan_id="+result.loan_id+";")
                    .then(paymentsuccess =>{
                    res.render("paymentsuccess");
                });
            });
            
            
        });
 
 });
*/
app.listen('3000', ()=>{

    console.log('Server started on port 3000');
});

