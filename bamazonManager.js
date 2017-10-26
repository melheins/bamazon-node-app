var mysql = require("mysql");
var Table = require('cli-table');
var clear = require('clear');
const chalk = require('chalk');
var figlet = require('figlet');
var inquirer = require("inquirer");


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "2017school",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    clear();

    displayProducts();
});

function displayProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({
            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                , 'right': '║', 'right-mid': '╢', 'middle': '│'
            },
            head: ['Id', 'Name', 'Price']
        });


        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, '$' + res[i].price]);
        }
        console.log("Welcome to Bamazon");
        console.log(table.toString());
        // connection.end();
        askWhatToBuy();
    });


}

function askWhatToBuy() {
    inquirer
        .prompt([
            {
                name: "id",
                type: "input",
                message: "What is the id of the item you would like to buy?",
                validate: function (value) {
                    var reg = /^\d+$/;
                    return reg.test(value) || "Id should be a number!";
                }
            },
            {
                name: "amount",
                type: "input",
                message: "How many would you like to buy?",
                validate: function (value) {
                    var reg = /^\d+$/;
                    return reg.test(value) || "Amount should be a number!";
                }
            }
        ])
        .then(function (answer) {
            connection.query("SELECT * FROM products where ?",
                {
                    item_id: answer.id
                }, function (err, res) {
                    if (err) throw err;
                    //console.log(res);
                    // console.log(res[0].stock_quantity);
                    // console.log(answer.amount);
                    if (res[0].stock_quantity >= answer.amount) {
                        console.log('\nPurchased!');
                        //Update database
                        var newQuantity = res[0].stock_quantity - answer.amount;
                        updateQuantity(answer.id, newQuantity);
                        var totalCost = answer.amount * res[0].price;
                        console.log('\nTotal Cost: ' + totalCost);
                    }
                    else {
                        console.log('\nInsufficient Quantity.');
                        connection.end();
                    }
                });
        });
}

function updateQuantity(id, amount) {
    connection.query("UPDATE products set ? where ?",
        [
            {
                stock_quantity: amount
            },
            {
                item_id: id
            }
        ], function (err, res) {
            connection.end();
        });
}
