# Ruby on Rails
![](../../images/activerecord_marginalia-logo.png)

- [Ruby on Rails](#ruby-on-rails)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Fields](#fields)
  - [End to end example](#end-to-end-example)
    - [Results](#results)
      - [GET /posts](#get-posts)
      - [POST /posts](#post-posts)
  - [References](#references)

## Introduction

[sqlcommenter_rails](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails) adds comments to your SQL statements.

It is powered by [marginalia](https://github.com/basecamp/marginalia) and also adds [OpenCensus](https://opencensus.io) information to the
comments if you use the [opencensus gem].

[sqlcommenter_rails](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails) configures [marginalia](https://github.com/basecamp/marginalia) and [marginalia-opencensus](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/marginalia-opencensus) to
match the SQLCommenter format.

## Installation

Currently, this gem is not released on rubygems. But can be installed from source.

The gem requires functionality provided by an [open PR](https://github.com/basecamp/marginalia/pull/89) to [marginalia](https://github.com/basecamp/marginalia). Install the PR by cloning [glebm's fork of marginalia](https://github.com/glebm/marginalia) one directory above this folder.

```shell
git clone https://github.com/glebm/marginalia.git ../marginalia
```
Add the following lines to your application's Gemfile:

```shell
gem 'sqlcommenter_rails', path: '../sqlcommenter_rails'
gem 'marginalia', path: '../marginalia'
gem 'marginalia-opencensus', path: '../marginalia-opencensus'
```

Install dependencies:
```shell
bin/setup
```
To enable [OpenCensus](https://opencensus.io) support, add the [`opencensus`](https://github.com/census-instrumentation/opencensus-ruby) gem to your Gemfile, and add the following line in the beginning of config/application.rb:

```shell
require 'opencensus/trace/integrations/rails'
```

## Usage

All of the SQL queries initiated by the application will now come with comments!

## Fields

The following fields will be added to your SQL statements as comments:

Field|Included <br /> by default?|Description|Provided by
---|---|---|---
`action` |&#10004;| Controller action name | [marginalia](https://github.com/basecamp/marginalia)
`application` |&#10004;|Application name | [marginalia](https://github.com/basecamp/marginalia)
`controller` |&#10004;| Controller name | [marginalia](https://github.com/basecamp/marginalia)
`controller_with_namespace` |&#10060;| Full classname (including namespace) of the controller | [marginalia](https://github.com/basecamp/marginalia)
`database` |&#10060;| Database name | [marginalia](https://github.com/basecamp/marginalia)
`db_driver` |&#10004;| Database adapter class name | [sqlcommenter_rails](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails)
`db_host` |&#10060;| Database hostname | [marginalia](https://github.com/basecamp/marginalia)
`framework` |&#10004;| `rails_v` followed by `Rails::VERSION` | [sqlcommenter_rails](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails)
`hostname` |&#10060;| Socket.gethostname | [marginalia](https://github.com/basecamp/marginalia)
`job` |&#10060;| Classname of the ActiveJob being performed | [marginalia](https://github.com/basecamp/marginalia)
`line`|&#10060;| File and line number calling query | [marginalia](https://github.com/basecamp/marginalia)
`pid` |&#10060;| Current process id | [marginalia](https://github.com/basecamp/marginalia)
`route` |&#10004;| Request's full path | [sqlcommenter_rails](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails)
`socket` |&#10060;| Database socket | [marginalia](https://github.com/basecamp/marginalia)
`traceparent`|&#10060;|The [W3C TraceContext.Traceparent field](https://www.w3.org/TR/trace-context/#traceparent-field) of the OpenCensus trace | [marginalia-opencensus]

To include the `traceparent` field, install the [marginalia-opencensus](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/marginalia-opencensus) gem and it will be automatically included by default.

To change which fields are included, set `Marginalia::Comment.components = [ :field1, :field2, ... ]` in `config/initializers/marginalia.rb` as described in the [marginalia documentation](https://github.com/basecamp/marginalia#components).

## End to end example

A Rails 6 [sqlcommenter_rails](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails) demo is available at:
<https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails>

The demo is a vanilla Rails API application with [sqlcommenter_rails](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails) and
OpenCensus enabled.

First, we create a vanilla Rails application with the following command:

```shell
gem install rails -v 6.0.0.rc1
rails _6.0.0.rc1_ new sqlcommenter_rails_demo --api
```

Then, we add and implement a basic `Post` model and controller:

```shell
bin/rails g model Post title:text
```

```shell
bin/rails g controller Posts index create
```

Implement the controller:

```ruby
# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  def index
    render json: Post.all
  end

  def create
    title = params[:title].to_s.strip
    head :bad_request if title.empty?
    render json: Post.create!(title: title)
  end
end
```

Configure the routes:

```ruby
# config/routes.rb
Rails.application.routes.draw do
 resources :posts, only: %i[index create]
end
```

Then, we add `sqlcommenter_rails` and OpenCensus:

```ruby
# Gemfile
gem 'opencensus'
gem 'sqlcommenter_rails'
```

```ruby
# config/application.rb
require "opencensus/trace/integrations/rails"
```

Finally, we run `bundle` to install the newly added gems:

```shell
bundle
```

Now, we can start the server:

```shell
bin/rails s
```

In a separate terminal, you can monitor the relevant SQL statements in the server
log with the following command:

```bash
tail -f log/development.log | grep 'Post '
```

### Results

The demo application has 2 endpoints: `GET /posts` and `POST /posts`.

#### GET /posts

```shell
curl localhost:3000/posts
```

```
Post Load (0.1ms)  SELECT "posts".* FROM "posts" /*
action='index',application='SqlcommenterRailsDemo',controller='posts',
db_driver='ActiveRecord::ConnectionAdapters::SQLite3Adapter',
framework='rails_v6.0.0.rc1',route='/posts',
traceparent='00-ff19308b1f17fedc5864e929bed1f44e-6ddace73a9debf63-01'*/
```

#### POST /posts

```shell
curl -X POST localhost:3000/posts -d 'title=my-post'
```

```
Post Create (0.2ms)  INSERT INTO "posts" ("title", "created_at", "updated_at")
VALUES (?, ?, ?) /*action='create',application='SqlcommenterRailsDemo',
controller='posts',db_driver='ActiveRecord::ConnectionAdapters::SQLite3Adapter',
framework='rails_v6.0.0.rc1',route='/posts',
traceparent='00-ff19308b1f17fedc5864e929bed1f44e-6ddace73a9debf63-01'*/
```

## References

| Resource                | URL                                                                                             |
|-------------------------|-------------------------------------------------------------------------------------------------|
| sqlcommenter_rails    | <https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/ruby/sqlcommenter-ruby/sqlcommenter_rails>    |
| marginalia            | <https://github.com/basecamp/marginalia>                                                          |
| OpenCensus            | <https://opencensus.io/>                                                                          |
| The opencensus gem    | <https://github.com/census-instrumentation/opencensus-ruby >                                      |
| marginalia-opencensus | <https://github.com/google/sqlcommenter/tree/master/ruby/sqlcommenter-ruby/marginalia-opencensus> |

