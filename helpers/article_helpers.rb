module ArticleHelpers
  def author_link(article, data)
    "<span class=\"h-card p-author\"><a href=\"/blog/author/#{article.data.author}/\" class=\"u-url\">#{data.authors[article.data.author] ? data.authors[article.data.author].name : article.data.author}</a></span>"
  end

  def tag_link(tag)
    "<a href=\"/tags/#{tag}/\" class=\"p-category\">#{tag}</a>"
  end
end