# Middleman Config
require "nokogiri"

Dir[File.join(File.dirname(__FILE__), 'lib', '*.rb')].each {|f| require f }

Time.zone = "America/Los_Angeles"


# Activate the Blog
activate :blog do |blog|
  blog.prefix    = "blog"
  # blog.layout    = "blogroll"
  blog.permalink = ":year/:month/:day/:title.html"
  blog.sources   = ":year-:month-:day-:title.html"
  blog.taglink   = "tags/:tag.html"
  # blog.summary_separator = /(READMORE)/
  # blog.summary_length = 250
  # blog.year_link = ":year.html"
  # blog.month_link = ":year/:month.html"
  # blog.day_link = ":year/:month/:day.html"
  blog.default_extension = ".md"

  blog.layout = "post"
  # blog.tag_template = "blog/tag.html"
  blog.calendar_template = "blog/calendar.html"

  # blog.paginate = true
  # blog.per_page = 10
  # blog.page_link = "page/:num"
end

###
# Markdown
###

set :markdown_engine, :redcarpet
set :markdown,
  :layout_engine => :erb,
  :fenced_code_blocks => true,
  :tables => true,
  :smartypants => true,
  :no_intra_emphasis => true,
  :strikethrough => true,
  :superscript => true,
  :highlight => true,
  :footnotes => true

activate :rouge_syntax

###
# Code highlighting
###

# # Syntax Highlighting?
# activate :syntax,
#          :linenos => 'table',
#          :linenostart => 1

# XML Feed
page "/feed.xml", :layout => false

# Directory INdexs
activate :directory_indexes

# Assets directories
set :css_dir, 'assets/css'
set :fonts_dir, 'assets/fonts'
set :images_dir, 'assets/img'
set :js_dir, 'assets/js'

set :relative_links, true

set :build_dir, 'www'

# Projects Pages

def get_publications
  @publications = sitemap.resources.find_all { |page| page.url.match(/\/publications\/.*\/.*\/.*/) }
  #sort by date of publications
  @publications.sort! { |a,b| a.data['order'].to_i <=> b.data['order'].to_i}
end

def get_books
  @books = sitemap.resources.find_all { |page| page.url.match(/\/publications\/books\/.*\/.*/) }
  # Sort by date of project
  @books.sort! { |a,b| b.data['num'].to_i <=> a.data['num'].to_i }
end

def get_broadsides
  @broadsides = sitemap.resources.find_all { |page| page.url.match(/\/publications\/broadsides\/.*\/.*/) }
  # Sort by date of project
  @broadsides.sort! { |a,b| b.data['num'].to_i <=> a.data['num'].to_i }
end

def get_ephemera
  @ephemera = sitemap.resources.find_all { |page| page.url.match(/\/publications\/ephemera\/.*\/.*/) }
  # Sort by date of project
  @ephemera.sort! { |a,b| a.data['order'].to_i <=> b.data['order'].to_i }
end

def get_bookbinding
  @bookbinding = sitemap.resources.find_all { |page| page.url.match(/\/services\/bookbinding\/.*\/.*/) }
  # Sort by date of project
  @bookbinding.sort! { |a,b| a.data['order'].to_i <=> b.data['order'].to_i }
end

def get_boxmaking
  @boxmaking = sitemap.resources.find_all { |page| page.url.match(/\/services\/boxmaking\/.*\/.*/) }
  # Sort by date of project
  @boxmaking.sort! { |a,b| a.data['order'].to_i <=> b.data['order'].to_i }
end

def get_design
  @design = sitemap.resources.find_all { |page| page.url.match(/\/services\/design\/.*\/.*/) }
  # Sort by date of project
  @design.sort! { |a,b| a.data['order'].to_i <=> b.data['order'].to_i }
end

def reload_pages
  puts "Reloading page list"
  @pages = sitemap.resources.find_all{ |p| p.source_file.match(/\.html/) }
  @pages.sort! { |a,b| a.data['order'].to_i <=> b.data['order'].to_i }
end

def get_featured
  @featured = data.featured.find_all
end

ready do
  get_books
  get_broadsides
  get_ephemera
  get_bookbinding
  get_boxmaking
  get_design
  get_publications
  get_featured
  reload_pages
  AuthorPages.configure self, data
end

# You can send a USR1 signal to middleman to get it to reload the page list
# Or you can just re-save this file and middleman recognizes it and restarts itself
Signal.trap("USR1") do
  reload_pages
end

# Helpers
helpers ApplicationHelpers

configure :build do
  activate :relative_assets
  activate :minify_css
  #activate :minify_javascript
  #set :http_prefix, ''
end
