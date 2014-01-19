// document ready
$(function (){

  var page = window.location.protocol + "//pdx.esri.com" + window.location.pathname;

  $.getJSON("http://webmention.io/api/mentions?jsonp=?", {
    target: page
  }, function(data){
    if (data.links.length){
      var comments =  '<div class="article-footer"><h2>Comments</h2></div>';
          comments += '<div class="article-footer col-group comments-wrap">';

      for (var i = 0; i < data.links.length; i++){

        var comment = data.links[i].data;

        var content = '';
        if (comment.content){
          content = comment.content;
        }

        var image = '/assets/img/gravatars/cat.jpg';
        if (comment.author && comment.author.photo){
          image = comment.author.photo;
        }

        var author = '';
        if (comment.author && comment.author.name){
          author = comment.author.name;
        }

        var author_url = false;
        if (comment.author && comment.author.url){
          author_url = comment.author.url;
        }

        var permalink;
        if (comment.published_ts && (comment.author && comment.author.url)){
          var _date = new Date(comment.published_ts * 1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = _date.getFullYear();
          var month = months[_date.getMonth()];
          var day = _date.getDate();
          var date = month + ' ' + day + ', ' + year;
          permalink = 'Posted by <a href="' + author_url + '">' + author + '</a> on <a href="' + comment.url + '">' + date + '</a>';
        } else {
          if(content) {
            permalink = '<a href="' + comment.url + '">permalink</a>';
          } else {
            // If no post content, show the URL instead
            permalink = '<a href="' + comment.url + '">' + comment.url + '</a>';
          }
        }

        comments +=   '<div class="team-card card support col col7of12">';
        comments +=     '<span class="gravatar team-photo">';
        if(author_url) {
          comments +=     '<a href="' + author_url + '"><img src="' + image + '"></a>';
        } else {
          comments +=     '<img src="' + image + '">';
        }
        comments +=     '</span>';
        comments +=     '<main class="comment">';
        comments +=       '<p class="comment-text">' + content + '</p>';
        comments +=       '<p class="position">' + permalink + '</p>';
        comments +=      '</main>';
        comments +=   '</div>';
      }

      comments += '</div>';
      $('#comments').html(comments);
    }
  });
});