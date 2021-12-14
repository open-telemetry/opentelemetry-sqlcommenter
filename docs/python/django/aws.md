# Amazon Web Services
![](/opentelemetry-sqlcommenter/images/aws-logo.png)

- [Amazon Web Services](#amazon-web-services)
    - [Introduction](#introduction)
    - [Requirements](#requirements)
    - [Addition to your code](#addition-to-your-code)
    - [References](#references)


## Introduction

This guide will help you add [sqlcommenter](https://github.com/open-telemetry/opentelemetry-sqlcommenter) to your Django applications running on [Amazon Web Services (AWS)](https://aws.amazon.com)

## Requirements

| Steps                     | Resource                                                                   |
| ------------------------- | -------------------------------------------------------------------------- |
| Python on AWS             | <https://aws.amazon.com/getting-started/projects/deploy-python-application/> |
| opentelemetry-sqlcommenter | <https://pypi.org/project/opentelemetry-sqlcommenter>                         |
| Django 2.X                | <https://docs.djangoproject.com/en/stable/faq/install>                       |
| Python 3.X                | <https://www.python.org/downloads/>                                          |

## Addition to your code

Firstly, please install [opentelemetry-sqlcommenter](README.md#installation).

For any Django deployment, we can just edit your settings.py file and update the `MIDDLEWARE` section
with
```python
MIDDLEWARE = [
  'opentelemetry.sqlcommenter.django.middleware.SqlCommenter',
  ...
]
```

>If any middleware execute database queries (that you'd like commented by SqlCommenter), those middleware MUST appear after
'opentelemetry.sqlcommenter.django.middleware.SqlCommenter'

## References

| Resource                             | URL                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Deploying Python applications on AWS | <https://aws.amazon.com/getting-started/projects/deploy-python-application/> |
| General sqlcommenter Django guide    | [link](README.md)                                                     |