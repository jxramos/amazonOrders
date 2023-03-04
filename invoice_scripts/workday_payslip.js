async function processWorkdayPayslip() {
    console.log("processWorkdayPayslip")
    await new Promise(r => setTimeout(r, 3800));

    var transaction = {
        "Vendor": "CompanyXYZ",
        "URL": window.location.href
    };

    var table_captions = document.getElementsByTagName("caption")
    scrapePayslip(table_captions, transaction);
    downloadJsonTransaction(transaction);
}

function scrapePayslip(table_captions, transaction) {
    console.log("scrapeOrderData")

    getPayslipMetaData(table_captions, transaction);
    getPayslipItemization(table_captions, transaction);
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
    filename = transaction["OrderDateFormatted"] + ' ' + transaction['Vendor']+'--'+transaction['Order#'].split(" ")[0]+'.wo.json'
    downloadContent(filename, transactionJson);
}

/*==========================================================================================
ORDER METADATA
==========================================================================================*/

function getPayslipMetaData(table_captions, transaction) {
    console.log("getPayslipMetaData")

    //------------------------------------------------------------------------
    // Table: Payslip Information
    table_payslip_information = table_captions[1].parentElement
    cells = table_payslip_information.children[2].getElementsByTagName("td")

    pay_period_begin = cells[2].innerText
    pay_period_end = cells[3].innerText
    transaction["Description"] = "Pay period: " +
                                        pay_period_begin.substring(6) + "/" +
                                        pay_period_begin.substring(0,5) +
                                        " - " +
                                        pay_period_end.substring(6) + "/" +
                                        pay_period_end.substring(0,5)

    // Use Pay Date to serve as the "OrderDate"
    var orderDate = new Date(cells[4].innerText);
    transaction["OrderDate"] = orderDate.toLocaleDateString();
    order_date_formatted = orderDate.getFullYear() +
                            "-" + String(orderDate.getMonth()+1).padStart(2, '0') +
                            "-" + String(orderDate.getDate()).padStart(2, '0');
    transaction["OrderDateFormatted"] = order_date_formatted

    //------------------------------------------------------------------------
    // Table: Payment Information
    table_payment_information = table_captions[11].parentElement
    rows = table_payment_information.children[2].children

    // Get Order Total
    total = rows[1].children[3].innerText
    transaction["Total"] = parsePrice(total.replace("Total:\n", ""));

    // Get Payment Method
    row_payment_info = rows[0]
    account_name = row_payment_info.children[1].innerText
    account_num  = row_payment_info.children[2].innerText
    transaction["PaymentMethod"] = account_name + " " + account_num

    // Get Order Number
    transaction["Order#"] = "payslip " + order_date_formatted
}

/*==========================================================================================
ORDER ITEMIZATION
==========================================================================================*/

function getPayslipItemization(table_captions, transaction){
    console.log("getPayslipItemization");

    var line_items = [];

    //------------------------------------------------------------------------
    // Table: Earnings
    table_earnings = table_captions[3].parentElement.children[2].children
    for (let i = 1; i < table_earnings.length - 1; i++) {
        row_earning = table_earnings[i]
        line_item = []
        line_amount = row_earning.children[4].innerText

        // ignore absent items not used in this payslip
        if (line_amount == "") {
            continue
        }

        // Description
        line_description = row_earning.children[0].innerText
        line_dates = row_earning.children[1].innerText
        line_hours = row_earning.children[2].innerText
        line_rate = row_earning.children[3].innerText
        description = line_description + " " +
                      line_dates + " " +
                      line_hours + "hrs $" +
                      line_rate + "/hr"
        line_item.push(description)

        // Amount
        line_item.push(parsePrice(line_amount))
        line_items.push(line_item)
    }

    //------------------------------------------------------------------------
    // Table: Deductions
    for (let i = 4; i <= 6; i++) {
        table_deduction = table_captions[i].parentElement
        process_deductions(table_deduction, line_items)
    }

    transaction["Items"] = line_items;
}

function process_deductions(table_deduction, line_items) {
    rows_deduction = table_deduction.children[2].children
    for (let i = 0; i < rows_deduction.length - 1; i++) {
        row_deduction = rows_deduction[i]
        line_item = []

        // Description
        line_item.push(row_deduction.children[0].innerText)

        // Amount
        line_amount = row_deduction.children[1].innerText
        if (line_amount == "") {
            line_amount = 0.0
        }
        line_item.push(-1 * parsePrice(line_amount))
        line_items.push(line_item)
    }
}

function parsePrice(item){
    // handle literal numeric
    if (isFinite(item)) {
        return parseFloat(item)
    }
    if (typeof item === 'string' || item instanceof String){
        price_value = item
    } else {
        price_value = item.textContent
    }
    price_value = price_value.trim().replace('$','').replace(',', '')

    // handle negative representation
    if (price_value.includes("(")) {
        price_value = "-" + price_value.replace("(","").replace(")", "")
    // handle free literals
    } else if (price_value == "FREE") {
        price_value = 0.0;
    }
    return parseFloat(price_value)
}

processWorkdayPayslip();
