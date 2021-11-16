# Django
![](/docs/images/django-logo.png)

<div class="row" >

<div class = "column">

[![](/docs/images/aws-logo.png)](aws.md)

</div>
<div class = "column">

  [![](/docs/images/gcp-logo.png)](gcp.md)

  </div>
  <div class = "column">

   [![](/docs/images/locally-logo.png)](local.md)

   </div>
</div>

<style>
/* Three image containers (use 25% for four, and 50% for two, etc) */
.column {
  float: left;
  width: 33%;
  padding: 0px;
}

/* Clear floats after image containers */
.row::after {
  content: "";
  clear: both;
  display: table;
}
</style>


- [Django](#django)
    - [Introduction](#introduction)
    - [Requirements](#requirements)
    - [Installation](#installation)
    - [Enabling it](#enabling-it)
    - [Fields](#fields)
    - [Sample log entry](#sample-log-entry)
      - [Expected Fields](#expected-fields)
    - [End to end examples](#end-to-end-examples)
    - [Source code](#source-code)
      - [Defaults](#defaults)
      - [With OpenCensus](#with-opencensus)
      - [With App Name](#with-app-name)
      - [With DB Driver](#with-db-driver)
    - [Results](#results)
      - [Defaults](#defaults-1)
      - [With OpenCensus](#with-opencensus-1)
      - [With App Name](#with-app-name-1)
      - [With DB Driver](#with-db-driver-1)
    - [References](#references)

## Introduction

This package is in the form of [Django middleware](https://docs.djangoproject.com/en/2.2/topics/http/middleware/) whose purpose is to augment a SQL statement right before execution, with information about the controller and user code to help with later making database optimization decisions, after those statements are examined from the database server's logs.

The middleware uses Django's `connection.execute_wrapper`.

## Requirements

The middleware uses Django's [`connection.execute_wrapper`](https://docs.djangoproject.com/en/stable/topics/db/instrumentation/#connection-execute-wrapper) and therefore requires [Django 2.0](https://docs.djangoproject.com/en/stable/faq/install) or later (which [support various versions](https://docs.djangoproject.com/en/stable/faq/install/#what-python-version-can-i-use-with-django) of [Python 3](https://www.python.org/downloads/)).

To record [OpenCensus](https://opencensus.io/) information [opencensus-ext-django](https://pypi.org/project/opencensus-ext-django/), version 0.7 or greater, is required.

## Installation
This middleware can be installed by any of the following:
> pip <br>
  ```
  pip3 install google-cloud-sqlcommenter
  ```
  
> source <br>
```
git clone https://github.com/google/sqlcommenter.git
cd python/sqlcommenter-python && python3 setup.py install
```

### Enabling it

Please edit your `settings.py` file to include `google.cloud.sqlcommenter.django.middleware.SqlCommenter` in your `MIDDLEWARE` section like this:
```diff
--- settings.py
+++ settings.py
@@ -1,3 +1,4 @@
 MIDDLEWARE = [
+  'google.cloud.sqlcommenter.django.middleware.SqlCommenter',
   ...
 ]
```

  
> *If any middleware execute database queries (that you'd like commented by SqlCommenter), those middleware MUST appear after
>'google.cloud.sqlcommenter.django.middleware.SqlCommenter'*


## Fields

In the database server logs, the comment's fields are:

* comma separated key-value pairs e.g. `controller='index'`
* values are SQL escaped i.e. `key='value'`
* URL-quoted except for the equals(`=`) sign e.g `route='%5Epolls/%24'`. so should be URL-unquoted when being consumed

### Sample log entry

After making a request into the middleware-enabled polls web-app.

```shell
2019-05-28 11:54:50.780 PDT [64128] LOG:  statement: INSERT INTO "polls_question"
("question_text", "pub_date") VALUES
('Wassup?', '2019-05-28T18:54:50.767481+00:00'::timestamptz) RETURNING "polls_question"."id"
/*controller='index',framework='django%3A2.2.1',route='%5Epolls/%24'*/
```

### Expected Fields

| Field         | Included <br /> by default?                    | Description                                                                                                                                                         |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app_name`    | <div style="text-align: center">&#10060;</div> | The [application namespace](https://docs.djangoproject.com/en/2.2/ref/urlresolvers/#django.urls.ResolverMatch.app_name) of the matching URL pattern in your urls.py |
| `controller`  | <div style="text-align: center">&#10004;</div> | The [name](https://docs.djangoproject.com/en/2.2/ref/urls/#path) of the matching URL pattern as described in your urls.py                                           |
| `db_driver`   | <div style="text-align: center">&#10060;</div> | The name of the Django [database engine](https://docs.djangoproject.com/en/2.2/ref/settings/#engine)                                                                |
| `framework`   | <div style="text-align: center">&#10004;</div> | The word "django" and the version of Django being used                                                                                                              |
| `route`       | <div style="text-align: center">&#10004;</div> | The [route](https://docs.djangoproject.com/en/2.2/ref/urlresolvers/#django.urls.ResolverMatch.route) of the matching URL pattern as described in your urls.py       |
| `traceparent` | <div style="text-align: center">&#10060;</div> | The [W3C TraceContext.Traceparent field](https://www.w3.org/TR/trace-context/#traceparent-field) of the OpenCensus trace                                            |
| `tracestate`  | <div style="text-align: center">&#10060;</div> | The [W3C TraceContext.Tracestate field](https://www.w3.org/TR/trace-context/#tracestate-field) of the OpenCensus trace                                              |

## End to end examples

Examples are based off the [polls app from the Django introduction tutorial](https://docs.djangoproject.com/en/2.2/intro/tutorial01/).

### Source code

#### Defaults

```
# settings.py

MIDDLEWARE = [
    'sqlcommenter.django.middleware.SqlCommenter',
    ...
]
```
```  
# polls/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
]
```
```
# polls/views.py

from django.http import HttpResponse
from .models import Question

def index(request):
    count = Question.objects.count()
    return HttpResponse(f"There are {count} questions in the DB.\n")
```
#### With OpenCensus
```
# settings.py
INSTALLED_APPS = [
    'opencensus.ext.django',
    ...
]
 

MIDDLEWARE = [
    'opencensus.ext.django.middleware.OpencensusMiddleware',
    'sqlcommenter.django.middleware.SqlCommenter',
    ...
]

OPENCENSUS = {
    'TRACE': {
        'SAMPLER': 'opencensus.trace.samplers.AlwaysOnSampler()',
    }
}

SQLCOMMENTER_WITH_CONTROLLER = False
SQLCOMMENTER_WITH_FRAMEWORK = False
SQLCOMMENTER_WITH_ROUTE = False
SQLCOMMENTER_WITH_OPENCENSUS = True
```
```  
# polls/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
]
```
```  
# polls/views.py

from django.http import HttpResponse
from .models import Question

def index(request):
    count = Question.objects.count()
    return HttpResponse(f"There are {count} questions in the DB.\n")
```
#### With App Name
```
# settings.py

MIDDLEWARE = [
    'sqlcommenter.django.middleware.SqlCommenter',
    ...
]

SQLCOMMENTER_WITH_CONTROLLER = False
SQLCOMMENTER_WITH_FRAMEWORK = False
SQLCOMMENTER_WITH_ROUTE = False
SQLCOMMENTER_WITH_APP_NAME = True
```
```
# polls/urls.py

from django.urls import path
from . import apps, views

app_name = apps.PollsConfig.name

urlpatterns = [
    path('', views.index, name='index'),
]
```
```
# polls/views.py

from django.http import HttpResponse
from .models import Question

def index(request):
    count = Question.objects.count()
    return HttpResponse(f"There are {count} questions in the DB.\n")
```
#### With DB Driver
```
# settings.py

MIDDLEWARE = [
    'sqlcommenter.django.middleware.SqlCommenter',
    ...
]

SQLCOMMENTER_WITH_CONTROLLER = False
SQLCOMMENTER_WITH_FRAMEWORK = False
SQLCOMMENTER_WITH_ROUTE = False
SQLCOMMENTER_WITH_DB_DRIVER = True
```
```
# polls/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
]
```
```
# polls/views.py

from django.http import HttpResponse
from .models import Question

def index(request):
    count = Question.objects.count()
    return HttpResponse(f"There are {count} questions in the DB.\n")
```
From the command line, we run the django development server in one terminal:
```
python manage.py runserver
```
And we use [curl](https://curl.haxx.se/) to make an HTTP request in another:
```
curl http://127.0.0.1:8000/polls/
```
### Results

Examining our Postgresql server logs, with the various options

#### Defaults
```
2019-07-19 14:27:51.370 -03 [41382] LOG:  statement: SELECT COUNT(*) AS "__count" FROM "polls_question"
/*controller='index',framework='django%3A2.2.3',route='polls/'*/
```
#### With OpenCensus
```
2019-07-19 17:39:27.430 -03 [46170] LOG:  statement: SELECT COUNT(*) AS "__count" FROM "polls_question"
/*traceparent='00-fd720cffceba94bbf75940ff3caaf3cc-4fd1a2bdacf56388-01'*/
```

#### With App Name
```
2019-07-19 15:31:33.681 -03 [42962] LOG:  statement: SELECT COUNT(*) AS "__count" FROM "polls_question"
/*app_name='polls'*/
```
#### With DB Driver
```
2019-07-19 14:47:53.066 -03 [41602] LOG:  statement: SELECT COUNT(*) AS "__count" FROM "polls_question"
/*db_driver='django.db.backends.postgresql'*/
```
## References 

| Resource               | URL                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Django                 | https://www.djangoproject.com/                                                                        |
| OpenCensus             | https://opencensus.io/                                                                                |
| opencensus-ext-django  | https://github.com/census-instrumentation/opencensus-python/tree/master/contrib/opencensus-ext-django |
| sqlcommenter on PyPi   | https://pypi.org/project/google-cloud-sqlcommenter                                                    |
| sqlcommenter on Github | https://github.com/google/sqlcommenter                                                                |