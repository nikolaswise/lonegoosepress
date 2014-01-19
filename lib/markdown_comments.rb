module Redcarpet::Render
  class HTML

    # strip multiline comments in markdown files
    def preprocess(full_document)
      full_document.gsub!(/\/\*\*.+?\*\*\//m) {|m| '' }
      full_document
    end

  end
end
