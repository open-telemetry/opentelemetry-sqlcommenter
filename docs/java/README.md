# Java
- [Java](#java)
  - [Introduction](#introduction)
  - [Integrations](#integrations)
  - [Installing it](#installing-it)
    - [From source](#from-source)
    - [Building it](#building-it)
    - [Verify installation](#verify-installation)
    - [Tests](#tests)

## Introduction
sqlcommenter-java is the implementation of [sqlcommenter](../) in the Java programming language.


## Integrations

sqlcommenter-java provides support for the following plugins/ORMs:

[![](../images/hibernate-logo.png)](hibernate)

[![](../images/spring-logo.png)](spring)

<style>
    img[src*='/spring-logo.png'], img[src*='/hibernate-logo.png'] {
        max-width: 40%;
        float: left;
        margin:0 2%;
    }
     img[src*='/spring-logo.png'] {
        float:none;        
    }
</style>

## Installing it
sqlcommenter-java can installed in a couple of ways:

### From source

Please visit [source page on Github](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/java/sqlcommenter-java)

### Building it

Next, after changing directories into `java/sqlcommenter-java`, run `./gradlew install`
which should produce should output
```shell
$ ./gradlew install

BUILD SUCCESSFUL in 1s
7 actionable tasks: 1 executed, 6 up-to-date
```

### Verify installation

sqlcommenter-java if properly installed should appear in the directory `$HOME/.m2/integrations/repository/io`.

The following should be your directory structure:
```shell
~/.m2/repository/io
└── com
    └── google
        └── cloud
            └── sqlcommenter
                ├── 0.0.1
                │   ├── sqlcommenter-java-0.0.1-javadoc.jar
                │   ├── sqlcommenter-java-0.0.1-javadoc.jar.asc
                │   ├── sqlcommenter-java-0.0.1-sources.jar
                │   ├── sqlcommenter-java-0.0.1-sources.jar.asc
                │   ├── sqlcommenter-java-0.0.1.jar
                │   ├── sqlcommenter-java-0.0.1.jar.asc
                │   └── sqlcommenter-java-0.0.1.pom
                └── maven-metadata-local.xml
```

and then in your programs that use Maven, when building packages, please do
```shell
mvn install -nsu
```
to use look up local packages.

### Tests

Tests can be run by
```shell
$ ./gradlew test
```