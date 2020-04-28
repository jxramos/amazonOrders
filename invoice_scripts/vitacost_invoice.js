function processVitacostInvoice() {
    console.log("processVitacostInvoice")

    var transaction = {
        "Vendor":"Vitacost.com",
        "URL": window.location.href
    };
    scrapeOrderData(transaction);
    downloadJsonTransaction(transaction);
}

function scrapeOrderData(transaction) {
    console.log("scrapeOrderData")

    getOrderMetaData(transaction);
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

function getOrderMetaData(transaction) {
    console.log("getOrderMetaData")

    var order_meta_tokens = document.getElementById("IamMasterFrameYesIam_ctl02_panelOrder").innerText.split("Placed");

    // Get Order Number
    transaction["Order#"] = order_meta_tokens[0].split("#")[1].trim();

    // Get OrderDate
    var orderDate = new Date(order_meta_tokens[1].replace("at ", ""))
    transaction["OrderDate"] = orderDate.toLocaleDateString();

    // Get Order Total
    transaction["Total"] = parsePrice(document.getElementsByClassName("total")[1]);
}

function parsePrice(item){
    if (isFinite(item)) {
        return item
    }
    var price = item.textContent.trim().replace('$','')
    if (price == "FREE") {
        price = 0.0;
    }
    return parseFloat(price)
}

processVitacostInvoice();
