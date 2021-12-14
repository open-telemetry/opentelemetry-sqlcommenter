# Locally
![](/opentelemetry-sqlcommenter/images/locally-logo.png)


- [Locally](#locally)
    - [Introduction](#introduction)
    - [Requirements](#requirements)
    - [Addition to your code](#addition-to-your-code)
    - [References](#references)


## Introduction

This guide will help you add [sqlcommenter](https://github.com/open-telemetry/opentelemetry-sqlcommenter) to your Django applications running locally.

Please see the reference for the fields added in the SQL comments [opentelemetry-sqlcommenter.Fields](README.md/#fields)

## Requirements

| Steps                     | Resource                                             |
| ------------------------- | ---------------------------------------------------- |
| Django                    | <https://docs.djangoproject.com/en/stable/intro/>      |
| opentelemetry-sqlcommenter | <https://pypi.org/project/opentelemetry-sqlcommenter>   |
| Django 2.X                | <https://docs.djangoproject.com/en/stable/faq/install> |
| Python 3.X                | <https://www.python.org/downloads/>                    |

## Addition to your code

Firstly, please install [opentelemetry-sqlcommenter](README.md#installation).

For any Django deployment, we can just edit our settings.py file and update the `MIDDLEWARE` section as per:

```python
# settings.py

MIDDLEWARE = [
  'opentelemetry.sqlcommenter.django.middleware.SqlCommenter',
  ...
]
```

>If any middleware execute database queries (that you'd like commented by SqlCommenter), those middleware MUST appear after
'opentelemetry.sqlcommenter.django.middleware.SqlCommenter'*


## References

| Resource                     | URL                                              |
| ---------------------------- | ------------------------------------------------ |
| Django quickstart            | <https://docs.djangoproject.com/en/stable/intro/>  |
| Installing Django middleware | [link](README.md/#installation) |