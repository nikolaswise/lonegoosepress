class AuthorPages
  def self.configure config, data
    # Set up the dynamic author pages
    puts "Creating dynamic author pages"
    data.to_h['authors'].each do |slug, author|
      posts = config.sitemap.resources.find_all{|p| p.data['author'] == slug }.sort! { |a,b| b.data['date'] <=> a.data['date'] }
      config.proxy "/blog/author/#{slug}/index.html", "/blog/author/template.html", 
        :locals => {
          :slug => slug, 
          :author => author, 
          :posts => posts.reject {|p| p.data['published'] == false}
        },
        :ignore => true
    end
  end
end