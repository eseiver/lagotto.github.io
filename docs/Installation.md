---
layout: page
title: "Installation"
---
ALM is a typical Ruby on Rails web application with one unusual feature: it requires the CouchDB database. CouchDB is used to store the responses from external API calls, MySQL is used for everything else (or PostgreSQL, see below). The application has been tested with Apache/Passenger, but should also run in other deployment environments, e.g. Nginx/Unicorn or WEBrick. ALM uses Ruby on Rails 3.2.x. The application has extensive test coverage using [Rspec] and [Cucumber].

[Rspec]: http://rspec.info/
[Cucumber]: http://cukes.info/

#### Ruby 1.9
ALM requires Ruby 1.9.3. Not all Linux distributions include Ruby 1.9 as a standard install, which makes it more difficult than it should be. [RVM] and [Rbenv] are Ruby version management tools for installing Ruby 1.9. Unfortunately they also introduce additional dependencies, making them sometimes not the best choices in a production environment. The ALM application has not been tested with Ruby 2.0, but migration to Ruby 2.0 is planned in 2014.

[RVM]: http://rvm.io/
[Rbenv]: https://github.com/sstephenson/rbenv

#### Installation Options
There are many installation options, but the following two should cover most scenarios:

* on a development machine: installation in a virtual machine via Vagrant is strongly recommended
* on a server: installation in a virtual machine via Vagrant or manual installation is recommended, with code updates via Capistrano

Hosting the ALM application at a Platform as a Service (PaaS) provider such as Heroku or OpenShift is possible, but has not been tested.

## Automatic Installation using Vagrant
This is the preferred way to install the ALM application on a development machine. The application will automatically be installed in a self-contained virtual machine, using [Virtualbox], [Vagrant] and [Chef Solo]. Download and install [Virtualbox], [Vagrant] and the [Omnibus] Vagrant plugin (which installs the newest version of Chef Solo). You can also use [VMware Fusion or Workstation](https://www.vagrantup.com/vmware) instead of [Virtualbox], but the VMware Vagrant plugin requires a commercial license.

### Custom settings (passwords, API keys)
This is an optional step. Rename the file `config.json.example` to `config.json` and add your custom settings to it, including usernames, passwords, API keys and the MySQL password. This will automatically configure the application with your settings.

Then install the application with:

```sh
git clone git://github.com/articlemetrics/alm.git
cd alm
vagrant up
```

[Virtualbox]: https://www.virtualbox.org/wiki/Downloads
[Vagrant]: http://downloads.vagrantup.com/
[Omnibus]: https://github.com/schisamo/vagrant-omnibus
[Chef Solo]: http://docs.opscode.com/chef_solo.html

This installs the ALM server on a Ubuntu 12.04 virtual machine. After installation is finished (this can take up to 15 min on the first run) you can access the ALM application with your web browser at

```sh
http://localhost:8080
```

or

```sh
http://33.33.33.44
```

The username and password for the web interface are `articlemetrics`. The code for the ALM application is in a shared folder and can be reached both from the host and virtual machine. To get to the application root directory in the virtual machine, do

```sh
vagrant ssh
cd /vagrant
```

The `vagrant` user on the virtual machine has the password `vagrant`, and has sudo privileges. The Rails application runs in Development mode. The MySQL password is stored at `config/database.yml`, and is auto-generated during the installation. CouchDB is set up to run in **Admin Party** mode, i.e. without usernames or passwords. The database servers can be reached from the virtual machine or via port forwarding.

## Automatic Installation on AWS using Vagrant
This is the preferred way to install the ALM application on Amazon Web Services (AWS). machine. Download and install  [Vagrant][vagrant]. Install the vagrant-aws plugin:

```sh
vagrant plugin install vagrant-aws
```

So that we can use any Amazon Machine Image ([AMI](https://aws.amazon.com/amis)) - the ALM application has been tested with Ubuntu 12.04 - we want to install the [vagrant-omnibus] plugin that adds Chef solo to any VM:

```sh
vagrant plugin install vagrant-omnibus
```

Install a dummy AWS box and name it `opscode-ubuntu-12.04`:

```sh
vagrant box add opscode-ubuntu-12.04 https://github.com/mitchellh/vagrant-aws/raw/master/dummy.box
```

Add your AWS settings (access_key, secret_access_key, private_key_path, keypair_name, security_groups) to Vagrantfile. We recommend to use at least a small EC2 instance, the ami `ami-e7582d8e` contains Ubuntu 12.04. We also install the latest Chef version using omnibus.

```ruby
config.omnibus.chef_version = :latest

config.vm.hostname = "alm"

config.vm.provider :aws do |aws, override|
  aws.access_key_id = "EXAMPLE"
  aws.secret_access_key = "EXAMPLE"
  aws.keypair_name = "EXAMPLE"
  aws.security_groups = ["EXAMPLE"]
  aws.instance_type = 'm1.small'
  aws.ami = "ami-e7582d8e"
  aws.tags = { Name: 'Vagrant alm' }

  override.ssh.username = "ubuntu"
  override.ssh.private_key_path = "/EXAMPLE.pem"
end
```

#### Custom settings (passwords, API keys)
This is an optional step. Rename the file `config.json.example` to `config.json` and add your custom settings to it, including usernames, passwords, API keys and the MySQL password. This will automatically configure the application with your settings.

Then install the application with:

```sh
git clone git://github.com/articlemetrics/alm.git
cd alm
vagrant up --provider aws
```

After installation is finished (this can take up to 15 min on the first run) you can access the ALM application with your web browser at the web address of your EC2 instance (the use of Elastic IPs and a DNS server is recommended).

After installation you first have to create a default user using the `Sign Up` button. The code for the ALM application is in the `/vagrant` folder and is rsynced from the host. To get to the application root directory in the virtual machine, do (using the `private_key_path` and `host_name`):

```sh
vagrant ssh
cd /vagrant
```

The Rails application runs in Production mode. The MySQL password is stored at `config/database.yml`, CouchDB is set up to run in **Admin Party** mode, i.e. without usernames or passwords. The database servers can be reached from the virtual machine or via port forwarding.

The ALM application can also be installed with [DigitalOcean] or [Rackspace] using Vagrant and the respective plugins ([vagrant-digitalocean] and [vagrant-rackspace]) in a process similar to the AWS installation. The settings for DigitalOcean are as follows:

```ruby
config.vm.provider :digital_ocean do |provider, override|
  override.ssh.private_key_path = '~/.ssh/id_rsa'
  override.vm.box = 'digital_ocean'
  override.vm.box_url = "https://github.com/smdahlen/vagrant-digitalocean/raw/master/box/digital_ocean.box"
  override.ssh.username = "ubuntu"

  provider.client_id = 'EXAMPLE'
  provider.api_key = 'EXAMPLE'
  provider.size = '1GB'
end
```

[vagrant]: http://downloads.vagrantup.com/
[vagrant-aws]: https://github.com/mitchellh/vagrant-aws
[vagrant-omnibus]: https://github.com/schisamo/vagrant-omnibus
[Rackspace]: http://www.rackspace.com
[DigitalOcean]: https://www.digitalocean.com
[vagrant-rackspace]: https://github.com/mitchellh/vagrant-rackspace
[vagrant-digitalocean]: https://github.com/smdahlen/vagrant-digitalocean

## Manual installation
These instructions assume a fresh installation of Ubuntu 12.04. Installation on other Unix/Linux platforms should be similar, but may require additional steps to install Ruby 1.9. The instructions assume a user with sudo privileges, and this can also be a new user created just for running the ALM application.

#### Update package lists

```sh
sudo apt-get update
```

#### Install required packages
`libxml2-dev` and `libxslt1-dev` are required for XML processing by the `nokogiri` gem, `nodejs` provides Javascript for the `therubyracer` gem.

```sh
sudo apt-get install curl build-essential git-core libxml2-dev libxslt1-dev nodejs
```

#### Install Ruby 1.9.3
We only need one Ruby version and manage gems with bundler, so there is no need to install `rvm` or `rbenv`.

```sh
sudo apt-get install ruby1.9.3
```

#### Install databases

```sh
sudo apt-get install couchdb mysql-server
```

#### Install Memcached
Memcached is used to cache requests (in particular API requests) in production, and the default configuration can be used. If you want to run memcached on a different host, change `config.cache_store = :dalli_store, { :namespace => "alm" }` in `config/environments/production.rb` to `config.cache_store = :dalli_store, 'cache.example.com', { :namespace => "alm" }`.

```sh
sudo apt-get install memcached
```

#### Install Postfix
Postfix is used to send reports via email. Alternatively, a different SMTP host can be configured in `config/settings.yml`.

```sh
sudo apt-get install postfix
```

The default configuration assumes `address: localhost`, `port: 25`. You can configure mail in `config/settings.yml`:

```yaml
mail:
  address:
  port:
  domain:
  user_name:
  password:
  authentication:
```

More information can be found [here](http://guides.rubyonrails.org/action_mailer_basics.html).

#### Install Apache and dependencies required for Passenger

```sh
sudo apt-get install apache2 apache2-prefork-dev libapr1-dev libaprutil1-dev libcurl4-openssl-dev
```

#### Install and configure Passenger
Passenger is a Rails application server: http://www.modrails.com. Update `passenger.load` and `passenger.conf` when you install a new version of the passenger gem.

```sh
sudo gem install passenger -v 3.0.19
sudo passenger-install-apache2-module --auto

# /etc/apache2/mods-available/passenger.load
LoadModule passenger_module /var/lib/gems/1.9.1/gems/passenger-3.0.19/ext/apache2/mod_passenger.so

# /etc/apache2/mods-available/passenger.conf
PassengerRoot /var/lib/gems/1.9.1/gems/passenger-3.0.19
PassengerRuby /usr/bin/ruby1.9.1

sudo a2enmod passenger
```

#### Set up virtual host
Please set `ServerName` if you have set up more than one virtual host. Also don't forget to add`AllowEncodedSlashes On` to the Apache virtual host file in order to keep Apache from messing up encoded embedded slashes in DOIs. Use `RailsEnv production` to use the Rails production environment (and use `rake db:setup RAILS_ENV=production` when you set up the MySQL databases).

```apache
# /etc/apache2/sites-available/alm
<VirtualHost *:80>
  ServerName localhost
  RailsEnv development
  DocumentRoot /var/www/alm/public

  <Directory /var/www/alm/public>
    Options FollowSymLinks
    AllowOverride None
    Order allow,deny
    Allow from all
  </Directory>

  # Important for ALM: keeps Apache from messing up encoded embedded slashes in DOIs
  AllowEncodedSlashes On

</VirtualHost>
```

#### Install ALM code
You may have to set the permissions first, depending on your server setup. Passenger by default is run by the user who owns `config.ru`.

```sh
git clone git://github.com/articlemetrics/alm.git /var/www/alm
```

#### Install Bundler and Ruby gems required by the application
Bundler is a tool to manage dependencies of Ruby applications: http://gembundler.com. We have to install `therubyracer` gem as sudo because of a permission problem (make sure the version matches the version in `Gemfile` in the ALM root directory).

```sh
sudo gem install bundler
sudo gem install therubyracer -v '0.12.0'

cd /var/www/alm
bundle install
```

#### Set ALM configuration settings
You want to set the MySQL username/password in `database.yml`, using either the root password that you generated when you installed MySQL, or a different MySQL user. You also want to set the site and session keys in `settings.yml`, they can be generated with `rake secret`.

```sh
cd /var/www/alm
cp config/database.yml.example config/database.yml
cp config/settings.yml.example config/settings.yml
```

#### Install ALM databases
We just setup an empty database for CouchDB. With MySQL we also include all data to get started, including sample articles and a default user account (username/password _articlemetrics_). Use `RAILS_ENV=production` if you set up Passenger to run in the production environment.

It is possible to connect the ALM app to MySQL and/or CouchDB running on a different server, please change `host` in database.yml and `couched_url` in settings.yml accordingly.

```sh
cd /var/www/alm
rake db:setup RAILS_ENV=development
curl -X PUT http://localhost:5984/alm/
```

#### Start Apache
We are making `alm` the default site.

```sh
sudo a2dissite default
sudo a2ensite alm
sudo service apache2 reload
```

You can now access the ALM application with your web browser at the name or IP address (if it is the only virtual host) of your Ubuntu installation.

## Remote Installation via Capistrano
This is the recommended strategy for production servers that use [Capistrano](http://capistranorb.com), a deployment automation tool. Capistrano takes care of code updates via git, database migrations and server restarts, but you still have to do the initial server setup of Ruby, MySQL, CouchDB, Apache and Passenger. And Capistrano requires a second local ALM installation, done either via Vagrant or manually (see above).

#### Install Ruby, MySQL, CouchDB, Apache and Passenger
Unless you already have installed Ruby, MySQL, CouchDB, Apache and Passenger, please follow the steps for manual installation until _Install and configure Passenger_. We again assume Ubuntu 12.04.

#### Set up virtual host
You probably have to provide a `ServerName`, we need to change `RailsEnv` to `production` and `DocumentRoot` to `/var/www/alm/current/public`.

```apache
# /etc/apache2/sites-available/alm
<VirtualHost *:80>
  ServerName EXAMPLE.ORG
  RailsEnv development
  DocumentRoot /var/www/alm/current/public

  <Directory /var/www/alm/current/public>
    Options FollowSymLinks
    AllowOverride None
    Order allow,deny
    Allow from all
  </Directory>

  # Important for ALM: keeps Apache from messing up encoded embedded slashes in DOIs
  AllowEncodedSlashes On

</VirtualHost>
```

#### Install Bundler
Bundler is a tool to manage dependencies of Ruby applications: http://gembundler.com. We have to install `therubyracer` gem as sudo because of a permission problem (make sure the version matches the version in `Gemfile` in the ALM root directory).

```sh
sudo gem install bundler
sudo gem install therubyracer -v '0.11.3'
```

#### Create CouchDB database

```sh
curl -X PUT http://localhost:5984/alm/
```

#### Install Capistrano
The next steps are done on the local development machine.

```sh
sudo gem install capistrano
cd /var/www/alm
capify .
```

#### Edit deployment configuration
Edit the deployment configuration file that was just created by Capistrano. Add the name or IP address of your production server as `server`, and pick a `:user` and `:group` from the production server. We can either set `:password` or use SSH keys.

```ruby
# /var/www/alm/config/deploy.rb
require "bundler/capistrano"
load 'deploy/assets'

server "EXAMPLE.ORG", :app, :web, :db, :primary => true

set :application, "alm"
set :user, "deploy"
set :group, "deploy"
set :password, "EXAMPLE"
set :deploy_to, "/var/www/#{application}"
set :deploy_via, :remote_cache

set :scm, "git"
set :repository, "git://github.com/articlemetrics/alm.git"
set :branch, "master"

set :bundle_without, [:development, :test]

set :ruby_vm_type,      :mri        # :ree, :mri
set :web_server_type,   :apache     # :apache, :nginx
set :app_server_type,   :passenger  # :passenger, :mongrel
set :db_server_type,    :mysql      # :mysql, :postgresql, :sqlite

set :keep_releases, 5

namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end

before "deploy:assets:precompile" do
  run ["ln -nfs #{shared_path}/settings.yml #{release_path}/config/settings.yml",
   "ln -nfs #{shared_path}/database.yml #{release_path}/config/database.yml",
   ].join(" && ")
end
```

#### Setup remote server
This will create the required directories (`/var/www/alm/current`, `/var/www/alm/releases` and `/var/www/alm/shared`) on the production server (it is safe to run this command if one of the directories already exists). `deploy:update` will fetch the application via git. `rake db:setup` will not create user accounts or sample articles in the production environment.

```sh
cd /var/www/alm
cap deploy:setup
cap deploy:update
```

#### Set ALM configuration settings
Back to the production server, finish the setup.

```sh
cd /var/www/alm/current
cp config/database.yml.example /var/www/alm/shared/database.yml
cp config/settings.yml.example /var/www/alm/shared/config/settings.yml
rake db:setup RAILS_ENV=production
sudo a2dissite default
sudo a2ensite alm
```

### Start the remote ALM server
You can now start the production server from your development machine.

```sh
cap deploy:start
```

#### Update your application
Deploy the application with the current code from Github without or with database migrations. You can rollback to the last deployed version if there is a problem.

```sh
cap deploy
cap deploy:migrations
cap deploy:rollback
```

### Precompile assets
Assets (CSS, Javascripts, images) need to be precompiled when running Rails in the `production` environment (but not in `development`). Run the following rake task, then restart the server:

```sh
bundle exec rake assets:precompile RAILS_ENV=production
```

## Using PostgreSQL instead of MySQL
The instructions above are for using MySQL, but the ALM application can also be installed with PostgreSQL with two small changes:

### Install PostgreSQL gem
Uncomment `gem 'pg'` in your `Gemfile`, comment out `gem 'mysql2'` and run `bundle update`:

```ruby
gem 'rails', '3.2.16'
#gem 'mysql2', '0.3.13'
gem 'pg', '~> 0.17.1'
```

### Change database adapter
Change the adapter in `config/database.yml` to use PostgreSQL instead of MySQL:

```yaml
production:
  #adapter:   mysql2
  adapter:   postgresql
  database:  alm_production
  username:  postgres
  password:  YOUR_PASSWORD
  host:      localhost
  pool:      10
```