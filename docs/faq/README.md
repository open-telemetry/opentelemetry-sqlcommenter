# FAQ

![](../images/sqlcommenter_logo.png)
<style>
    img[src*='sqlcommenter_logo.png']{
        float:none;
    }
</style>

- [FAQ](#faq)
  - [Why sqlcommenter?](#why-sqlcommenter)
  - [How does sqlcommenter benefit me?](#how-does-sqlcommenter-benefit-me)
  - [What ORMs does sqlcommenter support?](#what-orms-does-sqlcommenter-support)
  - [What databases does sqlcommenter support?](#what-databases-does-sqlcommenter-support)
  - [How do I use sqlcommenter in my application?](#how-do-i-use-sqlcommenter-in-my-application)
  - [How do I examine the augmented SQL statements?](#how-do-i-examine-the-augmented-sql-statements)
  - [Where is the specification?](#where-is-the-specification)
    - [What are the default fields](#what-are-the-default-fields)
  - [What ORMs support OpenTelemetry ?](#what-orms-support-opentelemetry-)

## Why sqlcommenter?

Most applications require persistent data yet when database performance goes awry, it is next to impossible to
easily correlate slow queries with source code.


## How does sqlcommenter benefit me?

* It helps provide observability and can help correlate your source code with slow queries thus guiding you in performance optimization


## What ORMs does sqlcommenter support?

See [the root of this project](../)


## What databases does sqlcommenter support?

When developing sqlcommenter, we've tested it with a couple of databases. Please see [/databases](../databases) for an authoritative list but here are some:


[![](../images/postgresql-logo.png)](../databases/postgresql)

[![](../images/mysql-logo.png)](../databases/mysql)

[![](../images/mariadb-logo.png)](../databases/mariadb)

[![](../images/sqlite-logo.png)](https://sqlite.org/cli.html)

[![](../images/cloud-sql-card.png)](https://cloud.google.com/sql/)


<style>
    img {
        float: left;
        margin: 0 2%;
        width: 200px;
    }

    img[src*='/cloud-sql-card.png']
    {
        float:none;
    }

    img[src*='/mariadb-logo.png']
    {
        margin-top:50px;
    }

    img[src*='/sqlite-logo.png']{
        margin-bottom:80px;
    }
</style>


## How do I use sqlcommenter in my application?
If you are using a supported ORM/framework, it shouldn't be a hassle at all to use. Just pick any of the ORMs in your favorite language

[![](../images/django-logo.png)](../python/django)
[![](../images/psycopg2-logo.png)](../python/psycopg2)
[![](../images/sqlalchemy-logo.png)](../python/SQLAlchemy)
[![](../images/flask-logo.png)](../python/flask)
[![](../images/ruby-logo.png)](../ruby)
[![](../images/hibernate-logo.png)](../java/hibernate)

[![](../images/spring-logo.png)](../java/spring)
[![](../images/knex-logo.png)](../node-js/knex)

[![](../images/express_js-logo.png)](../node-js/express)

[![](../images/sequelize-logo.png)](../node-js/sequelize)

<style>
    img {
        float: left;
        margin: 2%;
        width: 200px;
        height:100px;
    }

    img[src*='sequelize-logo.png']
    {
        float:none;
    }

    img[src*='/mariadb-logo.png']
    {
        margin-top:50px;
    }

    img[src*='/sqlite-logo.png']{
        margin-bottom:80px;
    }
</style>

## How do I examine the augmented SQL statements?

If you manage your databases or have access to database server logs, the statements will be logged there. Examine [databases](../databases) for more information how.

## Where is the specification?

The specification is available [here](../specifications).

### What are the default fields

Integration|action|controller|framework|route
---|---|---|---|---
<a href="../ruby/ruby-on-rails">ActiveRecord<br />/Marginalia</a>|&#10004;|&#10004;|&#10004;|&#10004;|&#10060;
<a href="../java/hibernate">Hibernate<br />+ Spring</a>|&#10004;|&#10004;|&#10004;|&#10004;|&#10060;
<a href="../node-js/knex">knex.js<br />+ express.js</a>|&#10060;|&#10004;|&#10060;|&#10060;|&#10060;
[Django](../python/django)|&#10060;|&#10004;|&#10004;|&#10004;|&#10060;
<a href="../python/psycopg2">psycopg2 <br />+ Flask</a>|&#10060;|&#10004;|&#10004;|&#10004;|&#10060;
<a href="../python/SQLAlchemy">sqlalchemy<br />+ Flask</a>|&#10060;|&#10004;|&#10004;|&#10004;|&#10060;
<a href="../node-js/sequelize">sequelize.js<br />+ express.js</a>|&#10060;|&#10004;|&#10060;|&#10060;|&#10060;

## What ORMs support OpenTelemetry ?
Node.js ORMs(Knex, Sequelize, Express) support OpenTelemetry.