function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot check
    if (data.bot_check && data.bot_check !== "") {
      return ContentService.createTextOutput("Bot detected");
    }

    // Route to correct sheet based on form_type
    var sheetName = data.form_type;
    var sheet = ss.getSheetByName(sheetName);

    // Fallback if sheet name doesn't match
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    var now = new Date();
    var date = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd");
    var time = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss");

    // Normalize name: prefer full_name, else concat first/last
    var firstName = (data.first_name || "").trim();
    var lastName = (data.last_name || "").trim();
    var fullName = (data.full_name || (firstName + " " + lastName)).trim();

    // Append using current 9-column schema:
    // Date | Time | Product Title | Variant ID | Custom Options | First Name | Last Name | Email | Phone
    sheet.appendRow([
      date,
      time,
      data.product_title || "N/A",
      "'" + (data.variant_id || "N/A"),
      data.custom_options || "None",
      fullName, // goes into "First Name" column
      "", // leave "Last Name" column blank for now
      data.email || "",
      data.phone || "",
    ]);

    // Send email notification
    sendEmailNotification(data, date, time, fullName);

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function sendEmailNotification(data, date, time, fullName) {
  var recipient = "sales@salussaunas.com";
  var formType = data.form_type || "Unknown";
  var customerEmail = data.email || "no-email";
  var subject =
    "New " + formType + " Submission - " + (data.product_title || "Product") + " - " + customerEmail;

  var body = "New " + formType + " submission received:\n\n";
  body += "Date: " + date + "\n";
  body += "Time: " + time + "\n";
  body += "━━━━━━━━━━━━━━━━━━━━\n\n";

  body += "CUSTOMER DETAILS:\n";
  body += "Name: " + (fullName || "N/A") + "\n";
  body += "Email: " + (data.email || "N/A") + "\n";
  body += "Phone: " + (data.phone || "N/A") + "\n\n";

  body += "PRODUCT DETAILS:\n";
  body += "Product: " + (data.product_title || "N/A") + "\n";
  body += "Total Price: $" + (data.total_price || "N/A") + "\n";
  body += "Variant ID: " + (data.variant_id || "N/A") + "\n\n";

  if (data.custom_options && data.custom_options !== "None") {
    body += "CUSTOM OPTIONS:\n";
    body += data.custom_options + "\n\n";
  }

  body += "━━━━━━━━━━━━━━━━━━━━\n";
  body +=
    "View spreadsheet: https://docs.google.com/spreadsheets/d/10fEdCYwymTARx6lkUBrycW5Jlts_PaOqpVMT4DO5NFE/edit";

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: body,
  });
}
