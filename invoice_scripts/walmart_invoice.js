function processWalmartInvoice() {
    console.log("processWalmartInvoice")

    // Get the multiple Walmart orders listed per page
    var orders = document.getElementsByClassName("order-new");

    // Process all orders found on the current page
    for (var i = 0; i < orders.length; i++) {
        console.log("order[i="+i+"]")
        var transaction = {
            "Vendor":"Walmart.com",
            "URL": window.location.href
        };

        var order = orders[i];

        scrapeOrderData(order, transaction);
        downloadJsonTransaction(transaction);
    }
}

function scrapeOrderData(order, transaction) {
    console.log("scrapeOrderData")

    getOrderMetaData(order, transaction);
    getPaymentMetaData(order, transaction);
    getOrderItemization(order, transaction);
}

function downloadContent(filename, content) {
    let a = document.createElement('a');
    a.href = "data:application/octet-stream,"+encodeURIComponent(content);
    a.download = filename;
    a.click();
}

function downloadJsonTransaction(transaction) {
    console.log("downloadJsonTransaction")

    var transactionJson = JSON.stringify(transaction);
    downloadContent(transaction['Vendor']+'--'+transaction['Order#']+'.wo.json', transactionJson);
}


/*==========================================================================================
ORDER METADATA
==========================================================================================*/

function getOrderMetaData(order, transaction) {
    console.log("getOrderMetaData")
}

/*==========================================================================================
PAYMENT METADATA
==========================================================================================*/

function getPaymentMetaData(order, transaction) {
    console.log("getPaymentMetaData")
}

/*==========================================================================================
ORDER ITEMIZATION
==========================================================================================*/

function getOrderItemization(order, transaction){
    console.log("getOrderItemization");

    var purchased_items = [];


    transaction["Items"] = purchased_items;
}

function parsePrice(item){
    // handle literal numeric
    if (isFinite(item)) {
        return item
    }
    var price = item.textContent.trim().replace('$','')

    // handle negative representation
    if (price.includes("(")) {
        price = "-" + price.replace("(","").replace(")", "")
    // handle free literals
    } else if (price == "FREE") {
        price = 0.0;
    }
    return parseFloat(price)
}

processWalmartInvoice();
