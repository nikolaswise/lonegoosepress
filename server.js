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
      console.log(request)

      // var stripeToken = request.body.stripeToken;
      // var charge = stripe.charges.create({
      //   amount: 1000, // amount in cents, again
      //   currency: "usd",
      //   source: stripeToken,
      //   description: "payinguser@example.com"
      // }, function(err, charge) {
      //   if (err && err.type === 'StripeCardError') {
      //     // The card has been declined
      //   }
      // });

      reply(request);
    }
});

// Start the server
server.start();


// var stripeToken = request.body.stripeToken;

// server.post('/charge', function(req, res) {
//     var stripeToken = req.body.stripeToken;
//     console.log(stripeToken)
    // var amount = 1000;

    // stripe.charges.create({
    //     card: stripeToken,
    //     currency: 'usd',
    //     amount: amount
    // },
    // function(err, charge) {
    //     if (err) {
    //         res.send(500, err);
    //     } else {
    //         res.send(204);
    //     }
    // });
// });

// hey!