!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

// filter blog posts
function filter(e) {
  var $el = $(this);
  var value = $el.val();
  var list = $('.post-list');
  if (!value.length) {
    list.removeClass('filtering');
  } else {
    list.addClass('filtering');

    var items = list.find('.post-in-list');
    var arr = $el.val().split(/\s+/);
    var values = '(?=.*' + arr.join(')(?=.*') + ')';
    var regex = new RegExp(values, 'i');

    items.each(function(){
      var item = $(this);
      var text = item.find('h4').text();
      text += " " + item.find('.author').text();
      text += " " + item.find('.summary').text();

      if (regex.exec(text)) {
        item.addClass('visible');
      } else {
        item.removeClass('visible');
      }
    });
  }
}

// document ready
$(function (){
  $('input.search').on('keyup', filter);

  var nav = $('.nav');
  $('.open-nav').on('click', function(e){
    e.preventDefault();
    nav.toggleClass('visible');
  });

});