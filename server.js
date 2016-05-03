// Init Hapi
var Hapi = require('hapi')
// Init Stripe
var stripe = require("stripe")(process.env.SKEY || 'sk_test_X78x8VBuswMiH3g4xW8EfM0S')

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
      path: 'build',
      index: true
    }
  }
});

server.route({
  method: 'POST',
  path: '/charge',
  handler: function (request, reply) {
    var details = JSON.parse(request.payload.details)
    var token = JSON.parse(request.payload.token)

    var stripeToken = token.id

    stripe.charges.create({
      amount: details.total * 100, // amount in cents, again
      currency: "usd",
      source: stripeToken,
      description: JSON.stringify(request.payload)
    }, function(err, charge) {
      if (err) {
        console.log(err)
        reply('trubs').redirect('/problem');
      } else  {
        console.log(charge)
        reply('okay').redirect('/thanks');
      }
    });
  }
});

// Start the server
server.start();
