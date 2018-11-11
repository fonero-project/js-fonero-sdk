---
title: Overview
---
The JavaScript Fonero SDK facilitates integration with the [Fonero Horizon API server](https://github.com/fonero-project/fonero-horizon) and submission of Fonero transactions, either on Node.js or in the browser. It has two main uses: [querying Horizon](#querying-horizon) and [building, signing, and submitting transactions to the Fonero network](#building-transactions).

[Building and installing js-fonero-sdk](https://github.com/fonero-project/js-fonero-sdk)<br>
[Examples of using js-fonero-sdk](./examples.md)

# Querying Horizon
js-fonero-sdk gives you access to all the endpoints exposed by Horizon.

## Building requests
js-fonero-sdk uses the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create the requests to send
to Horizon. Starting with a [server](https://fonero.github.io/js-fonero-sdk/Server.html) object, you can chain methods together to generate a query.
(See the [Horizon reference](https://www.fonero.org/developers/reference/) documentation for what methods are possible.)
```js
var FoneroSdk = require('fonero-sdk');
var server = new FoneroSdk.Server('https://horizon.trade.fonero-testnet.org');
// get a list of transactions that occurred in ledger 1400
server.transactions()
    .forLedger(1400)
    .call().then(function(r){ console.log(r); });

// get a list of transactions submitted by a particular account
server.transactions()
    .forAccount('GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW')
    .call().then(function(r){ console.log(r); });
```

Once the request is built, it can be invoked with `.call()` or with `.stream()`. `call()` will return a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to the response given by Horizon.

## Streaming requests
Many requests can be invoked with `stream()`. Instead of returning a promise like `call()` does, `.stream()` will return an `EventSource`.
Horizon will start sending responses from either the beginning of time or from the point specified with `.cursor()`.
(See the [Horizon reference](https://www.fonero.org/developers/reference/) documentation to learn which endpoints support streaming.)

For example, to log instances of transactions from a particular account:

```javascript
var FoneroSdk = require('fonero-sdk')
var server = new FoneroSdk.Server('https://horizon.trade.fonero-testnet.org');
var lastCursor=0; // or load where you left off

var txHandler = function (txResponse) {
    console.log(txResponse);
};

var es = server.transactions()
    .forAccount(accountAddress)
    .cursor(lastCursor)
    .stream({
        onmessage: txHandler
    })
```

## Handling responses

### XDR
The transaction endpoints will return some fields in raw [XDR](https://www.fonero.org/developers/horizon/learn/xdr.html)
form. You can convert this XDR to JSON using the `.fromXDR()` method.

An example of re-writing the txHandler from above to print the XDR fields as JSON:

```javascript
var txHandler = function (txResponse) {
    console.log( JSON.stringify(FoneroSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')) );
    console.log( JSON.stringify(FoneroSdk.xdr.TransactionResult.fromXDR(txResponse.result_xdr, 'base64')) );
    console.log( JSON.stringify(FoneroSdk.xdr.TransactionMeta.fromXDR(txResponse.result_meta_xdr, 'base64')) );
};

```


### Following links
The links returned with the Horizon response are converted into functions you can call on the returned object.
This allows you to simply use `.next()` to page through results. It also makes fetching additional info, as in the following example, easy:

```js
server.payments()
    .limit(1)
    .call()
    .then(function(response){
        // will follow the transactions link returned by Horizon
        response.records[0].transaction().then(function(txs){
            console.log(txs);
        });
    });
```


# Transactions

## Building transactions

See the [Building Transactions](https://www.fonero.org/developers/js-fonero-base/learn/building-transactions.html) guide for information about assembling a transaction.

## Submitting transactions
Once you have built your transaction, you can submit it to the Fonero network with `Server.submitTransaction()`.
```js
var FoneroSdk = require('fonero-sdk')
FoneroSdk.Network.useTestNetwork();
var server = new FoneroSdk.Server('https://horizon.trade.fonero-testnet.org');

server
  .loadAccount(publicKey)
  .then(function(account){
  		var transaction = new FoneroSdk.TransactionBuilder(account)
  				// this operation funds the new account with FNO
  				.addOperation(FoneroSdk.Operation.payment({
  					destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
  					asset: FoneroSdk.Asset.native(),
  					amount: "20000000"
  				}))
  				.build();

  		transaction.sign(FoneroSdk.Keypair.fromSecret(secretString)); // sign the transaction

		return server.submitTransaction(transaction);
  })
  .then(function (transactionResult) {
    console.log(transactionResult);
  })
  .catch(function (err) {
  	console.error(err);
  });
```
