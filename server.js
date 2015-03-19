// Init Hapi
var Hapi = require('hapi')
// Init Stripe
var stripe = require("stripe")(process.env.SKEY)

// Create a server with a host and port
var server = new Hapi.Server();

server.connection({
    port: process.env.PORT || 3000
});

// Add the route
server.route({
  method: 'GET',
  path:'/{params*}',
  handler: {
    directory: {
      path: 'www',
      index: true
    }
  }
});

server.route({
  method: 'POST',
  path: '/charge',
  handler: function (request, reply) {
    var cartString = request.payload.cart;
    var cart = JSON.parse(cartString);
    var stripeToken = request.payload.stripeToken;

    var first       = request.payload.first
    var last        = request.payload.last
    var street1     = request.payload.street1
    var street2     = request.payload.street2
    var city        = request.payload.city
    var state       = request.payload.state
    var postcode    = request.payload.postcode
    var email       = request.payload.email

    var items = cart.items
    var itemList
    for (i = 0; i < items.length; i++) {
      var itemList = itemList + 'Item: ' + items[i].title + '; Num: ' + items[i].quantity + '. '
    }

    var description = first + ' ' + last + '; ' + itemList + '; ' + street1 + ' ' + street2 + ' ' + city + ' ' + state + ' ' + postcode + '; ' + email

    console.log(request)

    stripe.charges.create({
      amount: cart.total * 100, // amount in cents, again
      currency: "usd",
      source: stripeToken,
      description: description
    }, function(err, charge) {
      // asynchronously called
      if (err) {
        console.log(err)
        reply('okay').redirect('/problem');
      } else  {
        console.log(charge)
        reply('okay').redirect('/thanks');
      }
    });


  }
});

// Start the server
server.start();
