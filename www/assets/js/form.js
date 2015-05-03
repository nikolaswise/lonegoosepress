(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Stripe.setPublishableKey("pk_live_wLZlZRJUMFZTeyK5tab54l8X");

var stripeResponseHandler = function stripeResponseHandler(status, response) {
  var $form = $("#payment-form");

  if (response.error) {
    // Show the errors on the form
    $form.find(".payment-errors").text(response.error.message);
    $form.find("button").prop("disabled", false);
  } else {
    // token contains id, last4, and card type
    var token = response.id;
    var cartString = JSON.stringify(cart.getCart());
    // Insert the token into the form so it gets submitted to the server
    $form.append($("<input type=\"hidden\" name=\"cart\" />").val(cartString));
    $form.append($("<input type=\"hidden\" name=\"stripeToken\" />").val(token));
    // and re-submit
    $form.get(0).submit();
  }
};

jQuery(function ($) {
  $("#payment-form").submit(function (e) {
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks
    $form.find("button").prop("disabled", true);

    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from submitting with the default action
    return false;
  });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvYXNzZXRzL2pzL2Zvcm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBOztBQUU1RCxJQUFJLHFCQUFxQixHQUFHLCtCQUFTLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDckQsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUUvQixNQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7O0FBRWxCLFNBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzRCxTQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDOUMsTUFBTTs7QUFFTCxRQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDO0FBQ3hCLFFBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7O0FBRS9DLFNBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHlDQUFxQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDdkUsU0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0RBQTRDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFFekUsU0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUN2QjtDQUNGLENBQUM7O0FBR0YsTUFBTSxDQUFDLFVBQVMsQ0FBQyxFQUFFO0FBQ2pCLEdBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFDcEMsUUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHcEIsU0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUU1QyxVQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsQ0FBQzs7O0FBR3RELFdBQU8sS0FBSyxDQUFDO0dBQ2QsQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlN0cmlwZS5zZXRQdWJsaXNoYWJsZUtleSgncGtfdGVzdF82Y2hHbURJYzNmdHBpT0g3QzViUWw2cFcnKVxuXG52YXIgc3RyaXBlUmVzcG9uc2VIYW5kbGVyID0gZnVuY3Rpb24oc3RhdHVzLCByZXNwb25zZSkge1xuICB2YXIgJGZvcm0gPSAkKCcjcGF5bWVudC1mb3JtJyk7XG5cbiAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgLy8gU2hvdyB0aGUgZXJyb3JzIG9uIHRoZSBmb3JtXG4gICAgJGZvcm0uZmluZCgnLnBheW1lbnQtZXJyb3JzJykudGV4dChyZXNwb25zZS5lcnJvci5tZXNzYWdlKTtcbiAgICAkZm9ybS5maW5kKCdidXR0b24nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB0b2tlbiBjb250YWlucyBpZCwgbGFzdDQsIGFuZCBjYXJkIHR5cGVcbiAgICB2YXIgdG9rZW4gPSByZXNwb25zZS5pZDtcbiAgICB2YXIgY2FydFN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGNhcnQuZ2V0Q2FydCgpKVxuICAgIC8vIEluc2VydCB0aGUgdG9rZW4gaW50byB0aGUgZm9ybSBzbyBpdCBnZXRzIHN1Ym1pdHRlZCB0byB0aGUgc2VydmVyXG4gICAgJGZvcm0uYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImNhcnRcIiAvPicpLnZhbChjYXJ0U3RyaW5nKSk7XG4gICAgJGZvcm0uYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInN0cmlwZVRva2VuXCIgLz4nKS52YWwodG9rZW4pKTtcbiAgICAvLyBhbmQgcmUtc3VibWl0XG4gICAgJGZvcm0uZ2V0KDApLnN1Ym1pdCgpO1xuICB9XG59O1xuXG5cbmpRdWVyeShmdW5jdGlvbigkKSB7XG4gICQoJyNwYXltZW50LWZvcm0nKS5zdWJtaXQoZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZm9ybSA9ICQodGhpcyk7XG5cbiAgICAvLyBEaXNhYmxlIHRoZSBzdWJtaXQgYnV0dG9uIHRvIHByZXZlbnQgcmVwZWF0ZWQgY2xpY2tzXG4gICAgJGZvcm0uZmluZCgnYnV0dG9uJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblxuICAgIFN0cmlwZS5jYXJkLmNyZWF0ZVRva2VuKCRmb3JtLCBzdHJpcGVSZXNwb25zZUhhbmRsZXIpO1xuXG4gICAgLy8gUHJldmVudCB0aGUgZm9ybSBmcm9tIHN1Ym1pdHRpbmcgd2l0aCB0aGUgZGVmYXVsdCBhY3Rpb25cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufSk7Il19
