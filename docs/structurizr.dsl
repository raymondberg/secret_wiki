workspace "SecretWiki" "The SecretWiki Project" {

  model {
    player = person "Player"
      gamemaster = person "Gamemaster"
      administrator = person "Admin"

      secretWiki = softwareSystem "Secret Wiki" {


        react = container "React Frontend" {
          player -> this "Interacts with"
            gamemaster -> this "Manages"
        }
        fastapi = container "FastApi App" {
          router = component "Routing Layer" {
            react -> this "Sends API requests"
          }
          schemas = component "Schemas" {
            router -> this "defines contracts with"
          }
          views = component "Views" {
            router -> this "invokes"
          }
          models = component "Models" {
            views -> this "interact with"
          }
          porter = component "Porter (CLI)" {
            technology "Click"
              description "Imports and exports data in YAML format"
              administrator -> this "Imports and Exports Data"
              this -> models "Interacts with"
          }
          component "Test Suite" {
            this -> models "tests"
              this -> schemas "tests"
              this -> views "tests"
              this -> porter "tests"
              this -> router "tests"
          }
        }

        db = container "Database" {
          models -> this "Reads from and writes to"
        }
      }

  }


  views {
    systemContext secretWiki {
      include *
      autolayout lr
    }

    container secretWiki {
      include *
      autolayout lr
    }

    component fastApi {
      include *
      autolayout lr
    }

    theme default
  }

}
