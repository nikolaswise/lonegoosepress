module ApplicationHelpers
  def base_url
    if environment === :build
      return "/"
    else
      return "/"
    end
  end

  def section_pages(section)
    @pages.select { |x| x.data['layout'] == section && x.data['top'] == true && x.data['published'] != false }
  end

  def sidebar_pages_for(page)
    section = page.data.layout
    section_pages = @pages.select {|x| x.data.layout == section && x.data.hide_in_sidebar != true && x.data.published != false }

    if page.data.top
      top = page.data.short_title.downcase
    elsif page.data.parent
      top = page.data.parent.downcase
    else
      return nil
    end

    res = section_pages.select { |x|
      comparator = x.data.parent ? x.data.parent.downcase : x.data.short_title.downcase
      comparator == top
    }
  end

  def anchor_items_for(page)
    file = ::File.read(page.source_file).gsub(/^(---\s*\n.*?\n?)^(---\s*$\n?)/m,'')
    body = ::Redcarpet::Markdown.new(::Redcarpet::Render::HTML, :fenced_code_blocks => true).render(file)
    tree = Nokogiri::HTML.parse(body)
    nav_items = tree.css("h1,h2:not(.hide-from-sidebar),h3:not(.hide-from-sidebar)").collect do |header|
      name = header.content.downcase.gsub(/("|\.)/i,'').gsub(/[^0-9a-z\-]/i, '-')
      Hashie::Mash.new({
        id: name,
        text: header.content,
        tag: header.name
      })
    end
  end

  def page_has_children?(page)
    return false if !page.data
    @pages.select {|x| x.data.parent == page.data.short_title && x.data.published != false }.length > 0
  end

  def nav_link_to(page)
    if request.path == page.destination_path
      prefix = '<li class="current">'
    else
      prefix = '<li>'
    end
    prefix + link_to(page.data.short_title, page.url) + "</li>"
  end

  def sub_nav_link_for(item, page)
    %[#{page.url}##{item.id}]
  end
end
