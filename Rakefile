#############################################################################
#
# Modified version of jekyllrb Rakefile
# https://github.com/jekyll/jekyll/blob/master/Rakefile
#
#############################################################################

require 'rake'
require 'date'
require 'yaml'

#############################################################################
#
# Helper functions
#
#############################################################################

def replace_header(head, header_name)
  head.sub!(/(\.#{header_name}\s*= ').*'/) { "#{$1}#{send(header_name)}'"}
end

def normalize_bullets(markdown)
  markdown.gsub(/\s{2}\*{1}/, "-")
end

def linkify_prs(markdown)
  markdown.gsub(/#(\d+)/) do |word|
    "[#{word}]({{ site.repository }}/issues/#{word.delete("#")})"
  end
end

def linkify_users(markdown)
  markdown.gsub(/(@\w+)/) do |username|
    "[#{username}](https://github.com/#{username.delete("@")})"
  end
end

def linkify(markdown)
  linkify_users(linkify_prs(markdown))
end

def liquid_escape(markdown)
  markdown.gsub(/(`{[{%].+[}%]}`)/, "{% raw %}\\1{% endraw %}")
end

def remove_head_from_history(markdown)
  index = markdown =~ /^##\s+\d+\.\d+\.\d+/
  markdown[index..-1]
end

def converted_history(markdown)
  remove_head_from_history(liquid_escape(linkify(normalize_bullets(markdown))))
end

# File activesupport/lib/active_support/inflector/transliterate.rb, line 80
def parameterize(string, sep = '-')
  # replace accented chars with their ascii
  # simplified from original to remove dependency
  parameterized_string = string.dup.force_encoding('US-ASCII')
  # Turn unwanted chars into the separator
  # changed from original: allow A-Z
  parameterized_string.gsub!(/[^a-zA-Z0-9\-_]+/, sep)
  unless sep.nil? || sep.empty?
    re_sep = Regexp.escape(sep)
    # No more than one of the separator in a row.
    parameterized_string.gsub!(/#{re_sep}{2,}/, sep)
    # Remove leading/trailing separator.
    parameterized_string.gsub!(/^#{re_sep}|#{re_sep}$/, '')
  end
  parameterized_string.downcase
end

#############################################################################
#
# Post and page tasks
#
#############################################################################

namespace :post do
  desc "Create a new post"
  task :create do
    title = ENV["title"] || "new-post"
    begin
      slug = parameterize(title)
      puts slug
    rescue => e
      puts "Error: invalid characters in title"
      exit -1
    end

    begin
      date = ENV['date'] ? Date.parse(ENV['date']) : Date.today
    rescue => e
      puts "Error: date format must be YYYY-MM-DD"
      exit -1
    end

    filename = File.join("_posts", "#{date}-#{slug}.md")
    if File.exist?(filename)
      puts "Error: post already exists"
      exit -1
    end

    header = { "layout" => "post", "title" => title }
    content = header.to_yaml + "---\n"

    if IO.write(filename, content)
      puts "Post #{filename} created"
    else
      puts "Error: #{filename} could not be written"
    end
  end
end

namespace :page do
  desc "Create a new page"
  task :create do
    title = ENV["title"] || "new-page"
    begin
      slug = parameterize(title)
      puts slug
    rescue => e
      puts "Error: invalid characters in title"
      exit -1
    end

    folder = ENV["folder"] || "."

    filename = File.join(folder, "#{slug}.md")
    if File.exist?(filename)
      puts "Error: page already exists"
      exit -1
    end

    header = { "layout" => "page", "title" => title }
    content = header.to_yaml + "---\n"

    if IO.write(filename, content)
      puts "Page #{filename} created"
    else
      puts "Error: #{filename} could not be written"
    end
  end
end

#############################################################################
#
# Site tasks
#
#############################################################################

namespace :site do
  desc "Generate the site"
  task :build do
    sh "jekyll build"
  end

  desc "Generate the site and serve locally"
  task :serve do
    sh "jekyll serve"
  end

  desc "Generate the site, serve locally and watch for changes"
  task :watch do
    sh "jekyll serve --watch"
  end

  desc "Generate the site and push changes to remote origin"
  task :deploy do
    # Configure git if this is run in Travis CI
    if ENV["TRAVIS"] == "true"
      sh "git config --global user.email mfenner@plos.org"
      sh "git config --global user.name mfenner"
      sh "git config --global push.default simple"
    end

    # Ensure we have the latest version
    sh "git pull origin"

    # Generate the site
    sh "jekyll build"

    # Commit and push.
    puts "Committing and pushing to GitHub Pages..."
    sha = `git log`.match(/[a-z0-9]{40}/)[0]
    sh "git add ."
    sh "git commit -m 'Updating to #{sha}.'"
    sh "git push origin"
    puts 'Done.'
  end

  desc "Commit the local site to the gh-pages branch and publish to GitHub Pages"
  task :publish => [:history] do
    # Ensure the gh-pages dir exists so we can generate into it.
    puts "Checking for gh-pages dir..."
    unless File.exist?("./gh-pages")
      puts "No gh-pages directory found. Run the following commands first:"
      puts "  `git clone git@github.com:jekyll/jekyll gh-pages"
      puts "  `cd gh-pages"
      puts "  `git checkout gh-pages`"
      exit(1)
    end

    # Ensure gh-pages branch is up to date.
    Dir.chdir('gh-pages') do
      sh "git pull origin gh-pages"
    end

    # Copy to gh-pages dir.
    puts "Copying site to gh-pages branch..."
    Dir.glob("site/*") do |path|
      next if path.include? "_site"
      sh "cp -R #{path} gh-pages/"
    end

    # Commit and push.
    puts "Committing and pushing to GitHub Pages..."
    sha = `git log`.match(/[a-z0-9]{40}/)[0]
    Dir.chdir('gh-pages') do
      sh "git add ."
      sh "git commit -m 'Updating to #{sha}.'"
      sh "git push origin gh-pages"
    end
    puts 'Done.'
  end

  desc "Create a nicely formatted history page for the jekyll site based on the repo history."
  task :history do
    if File.exist?("History.markdown")
      history_file = File.read("History.markdown")
      front_matter = {
        "layout" => "docs",
        "title" => "History",
        "permalink" => "/docs/history/",
        "prev_section" => "contributing"
      }
      Dir.chdir('site/docs/') do
        File.open("history.md", "w") do |file|
          file.write("#{front_matter.to_yaml}---\n\n")
          file.write(converted_history(history_file))
        end
      end
    else
      abort "You seem to have misplaced your History.markdown file. I can haz?"
    end
  end
end