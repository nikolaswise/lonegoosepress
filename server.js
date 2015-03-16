var Hapi = require('hapi')
var stripe = require("stripe")("sk_test_X78x8VBuswMiH3g4xW8EfM0S")

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

    console.log(cart, cart.total)

    stripe.charges.create({
      amount: cart.total * 100, // amount in cents, again
      currency: "usd",
      source: stripeToken,
      description: "Charge for test@example.com"
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
