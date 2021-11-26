# SQLCommenter

![](images/sqlcommenter_logo.png)

SQLCommenter is a suite of middlewares/plugins that enable your ORMs to augment SQL statements before execution, with comments containing
information about the code that caused its execution. This helps in easily correlating slow performance with source code and giving insights into backend database performance. In short it provides some observability into the state of your client-side applications and their impact on the database's server-side.

- [SQLCommenter](#sqlcommenter)
  - [Value](#value)
  - [Sample](#sample)
  - [Interpretation](#interpretation)
  - [Support](#support)
    - [Languages](#languages)
    - [Frameworks](#frameworks)
    - [Databases](#databases)
  - [Source code](#source-code)
  - [References](#references)

## Value
sqlcommenter provides instrumentation/wrappers to augment SQL from frameworks and ORMs. The augmented SQL provides key='value' comments
that help correlate usercode with ORM generated SQL statements and they can be examined in your database server logs. It provides deeper
observability insights into the state of your applications all the way to your database server.

## Sample

This log was extracted from a live web application

```shell
2019-05-28 11:54:50.780 PDT [64128] LOG:  statement: INSERT INTO "polls_question"
("question_text", "pub_date") VALUES
('What is this?', '2019-05-28T18:54:50.767481+00:00'::timestamptz) RETURNING
"polls_question"."id" /*controller='index',db_driver='django.db.backends.postgresql',
framework='django%3A2.2.1',route='%5Epolls/%24',
traceparent='00-5bd66ef5095369c7b0d1f8f4bd33716a-c532cb4098ac3dd2-01',
tracestate='congo%3Dt61rcWkgMzE%2Crojo%3D00f067aa0ba902b7'*/
```

## Interpretation

On examining the SQL statement from above in [Sample](#sample) and examining the comment in `/*...*/`
```sql
/*controller='index',db_driver='django.db.backends.postgresql',
framework='django%3A2.2.1',route='%5Epolls/%24',
traceparent='00-5bd66ef5095369c7b0d1f8f4bd33716a-c532cb4098ac3dd2-01',
tracestate='congo%3Dt61rcWkgMzE%2Crojo%3D00f067aa0ba902b7'*/
```

we can now correlate and pinpoint the fields in the above slow SQL query to our source code in our web application:

Original field|Interpretation
---|----
`controller='index'`|Controller name `^/polls/$`
`db_driver='django.db.backends.postgresql'`|Database driver `django.db.backends.postgresql`
`framework='django%3A2.2.1'`|Framework version of `django 2.2.1`
`route='%5Epolls/%24'`|Route of `^/polls/$`
`traceparent='00-5bd66ef5095369c7b0d1f8f4bd33716a-c532cb4098ac3dd2-01'`|[W3C TraceContext.Traceparent](https://www.w3.org/TR/trace-context/#traceparent-field) of '00-5bd66ef5095369c7b0d1f8f4bd33716a-c532cb4098ac3dd2-01'
`tracestate='congo%3Dt61rcWkgMzE%2Crojo%3D00f067aa0ba902b7'`|[W3C TraceContext.Tracestate](https://www.w3.org/TR/trace-context/#tracestate-field) with entries congo=t61rcWkgMzE,rojo=00f067aa0ba902b7

## Support
We support a variety of languages and frameworks such as:

### Languages
[![](images/python-logo.png)](python/)
[![](images/java-logo.png)](java/)
[![](images/nodejs-logo.png)](node-js/)
[![](images/ruby-logo.png)](ruby/)


### Frameworks
[![](images/django-logo.png)](python/django)
[![](images/psycopg2-logo.png)](python/psycopg2)
[![](images/sqlalchemy-logo.png)](python/SQLAlchemy)
[![](images/flask-logo.png)](python/flask)
[![](images/ruby-logo.png)](ruby)
[![](images/hibernate-logo.png)](java/hibernate)
[![](images/spring-logo.png)](java/spring)
[![](images/knex-logo.png)](node-js/knex)
[![](images/express_js-logo.png)](node-js/express)
[![](images/sequelize-logo.png)](node-js/sequelize)

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

</style>

### Databases

We have tested the instrumentation on the following databases:

[![](images/postgresql-logo.png)](databases/postgresql)

[![](images/mysql-logo.png)](databases/mysql)

[![](images/mariadb-logo.png)](databases/mariadb)

[![](images/sqlite-logo.png)](https://sqlite.org/cli.html)

[![](images/cloud-sql-card.png)](https://cloud.google.com/sql/)


<style>
   
    img[src*='/cloud-sql-card.png'], img[src*='/ruby-logo.png'], img[src*='/sqlcommenter_logo.png']
    {
        float:none;
    }

</style>

## Source code
The project is hosted on [Github](https://github.com/open-telemetry/opentelemetry-sqlcommenter)

## References

Resource|URL
---|---
Specifications|[Link](specifications/)
FAQ|[Link](faq/)