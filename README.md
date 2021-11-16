# SecretWiki

A wiki for sharing data...and secrets.


## Use-Case

If you've ever played a Tabletop RPG you know that there's a lot of information
that needs to get collected and maintained over a game. Characters, locations,
plot points, you name it! But how do you keep track of it all without managing
a public copy for your users and a private copy for yourself? Pay for an
expensive public service? No. Use SecretWiki.


# Usage

This repo follows Github's Scripts To Rule them All. These scripts will do everything you need to start

```
script/setup
script/test

# Build front-end components AND start webserver
script/server

# If you are doing extensive work in the frontend, you can run it separately
# and get on-write-refreshes rather than rerunning script/update
script/server --frontend

# Or you can just build the front-end components as you need
script/update
```

## Provisioning

You must create users using the console at this time. A helper function
exists to make this easier:

```
script/shell

> create_user(email= , password= , is_superuser=False, is_verified=True)
```
