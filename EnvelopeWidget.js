// Create widget instance and set black background
const widget = new ListWidget();
widget.backgroundColor = new Color("00000");

// REQUIRED: Add your auth token and other credentials below
const AUTH_TOKEN = ""; // Your Stytch auth token
const DEVICE_TOKEN = ""; // Your device token
const REQUEST_SIGNATURE = ""; // Your request signature
const x_IPADDRESS = ""; // Your IP address
const CLIENT_VERSION = ""; // Your client version
// First API request to get envelopes data



const req1 = new Request("https://api.envelopemoney.com/graphql");
req1.method = "POST";
req1.headers = {
  'Host': 'api.envelopemoney.com',
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'apollographql-client-version': CLIENT_VERSION,
  'auth-token-stytch': AUTH_TOKEN,
  'em-request-sha256-signature': REQUEST_SIGNATURE,
  'accept-language': 'en-US,en;q=0.9',
  'x-device-token': DEVICE_TOKEN,
  'x-apollo-operation-type': 'query',
  'apollographql-client-name': 'com.envelopemoney.prod-apollo-ios',
  'user-agent': 'Envelope/310 CFNetwork/3826.400.120 Darwin/24.3.0',
  'x-ip-address': x_IPADDRESS,
  'x-apollo-operation-name': 'EnvelopesNew'
};

// GraphQL query for envelopes
req1.body = JSON.stringify({
  "operationName": "EnvelopesNew",
  "query": "query EnvelopesNew { envelopesNew { __typename ...EnvelopeFragment } }\nfragment EnvelopeFragment on Envelope { __typename id createdAt updatedAt name balance color position archived type apy apyEffectiveDate fundingAmount fundingType fundingDayOfWeekNew fundingDayOfMonth fundingDayOfWeek envelopeTrackerType expenseAmount expenseType expenseDayOfMonth goalDate goalAmount nextDueDate }"
});

// Second API request to get account data
const req2 = new Request("https://api.envelopemoney.com/graphql");
req2.method = "POST";
req2.headers = {
  'Host': 'api.envelopemoney.com',
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'apollographql-client-version': CLIENT_VERSION,
  'auth-token-stytch': AUTH_TOKEN,
  'em-request-sha256-signature': REQUEST_SIGNATURE,
  'accept-language': 'en-US,en;q=0.9',
  'x-device-token': DEVICE_TOKEN,
  'x-apollo-operation-type': 'query',
  'apollographql-client-name': 'com.envelopemoney.prod-apollo-ios',
  'user-agent': 'Envelope/310 CFNetwork/3826.400.120 Darwin/24.3.0',
  'x-ip-address': x_IPADDRESS,
  'x-apollo-operation-name': 'Account'
};

// GraphQL query for account
req2.body = JSON.stringify({
  "operationName": "Account",
  "query": "query Account { account { __typename ...AccountFragment } }\nfragment AccountFragment on Account { __typename id balance balanceSavings unitMigrationState unitTransferFinished }"
});

// Helper function to calculate total balance from envelopes
const calculateTotalBalance = (data) => {
    return data.data.envelopesNew
        .filter(envelope => envelope.type === "CHECKING")
        .reduce((total, envelope) => total + envelope.balance, 0);
};

// Initialize variables
let envelopesTotal = 0;

// Fetch envelopes data
const res1 = await req1.loadJSON();
envelopesTotal = calculateTotalBalance(res1);

// Fetch account data
const res2 = await req2.loadJSON();
const accountBalance = res2.data.account.balance;
const difference = accountBalance - envelopesTotal;

// Convert all amounts from cents to dollars
difference2 = difference / 100;
envelopesTotal2 = envelopesTotal / 100;
accountBalance2 = accountBalance / 100;

// Add logo to widget
const imgurl = new Request("https://envelopebudgeting.com/images/envelope-logo.png");
const imgload = await imgurl.loadImage();
const img = widget.addImage(imgload);
img.imageSize = new Size(180, 70);
img.centerAlignImage();

widget.addSpacer(0);

// Add Available Balance section (largest)
const availableText = widget.addText("Available");
availableText.font = Font.regularSystemFont(16);
availableText.textColor = new Color("999999");
availableText.centerAlignText();

const availableAmount = widget.addText("$" + difference2.toFixed(2));
availableAmount.font = Font.semiboldSystemFont(28);
availableAmount.centerAlignText();

widget.addSpacer(5);

// Create bottom row with Envelopes and Balance
const bottomStack = widget.addStack();
bottomStack.layoutHorizontally();
bottomStack.centerAlignContent();
bottomStack.setPadding(0, 50, 0, 50);
bottomStack.addSpacer();

// Add Envelopes section
const envelopesStack = bottomStack.addStack();
envelopesStack.layoutVertically();
envelopesStack.centerAlignContent();
const envelopesText = envelopesStack.addText("Envelopes");
envelopesText.font = Font.regularSystemFont(12);
envelopesText.textColor = new Color("999999");
envelopesText.centerAlignText();
const envelopesAmount = envelopesStack.addText("$" + envelopesTotal2.toFixed(2));
envelopesAmount.font = Font.regularSystemFont(14);
envelopesAmount.centerAlignText();

bottomStack.addSpacer(30);

// Add Balance section
const balanceStack = bottomStack.addStack();
balanceStack.layoutVertically();
balanceStack.centerAlignContent();
const balanceText = balanceStack.addText("Balance");
balanceText.font = Font.regularSystemFont(12);
balanceText.textColor = new Color("999999");
balanceText.centerAlignText();
const balanceAmount = balanceStack.addText("$" + accountBalance2.toFixed(2));
balanceAmount.font = Font.regularSystemFont(14);
balanceAmount.centerAlignText();

bottomStack.addSpacer();

widget.addSpacer(2);

// Set widget refresh interval (5 minutes)
const now = Date.now();
widget.refreshAfterDate = new Date(now + (5 * 60 * 1000));

// Present the widget
Script.setWidget(widget);
Script.complete();
widget.presentMedium();