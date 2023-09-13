

## The Data Model

```mermaid
erDiagram
    Wiki ||--o{ Page: contains
    Page {
        bool is_secret  "Determines non-GM access"
    }
    Page ||--o{ Section : contains
    Section {
        bool is_secret  "Determines non-GM access"
    }

    SectionPermission }o--|| Section : "provides overriding access to"

    SectionPermission }o--|| User : "explicit assigned to"
    User }o..o{ Section : "implicit assigned to"
    User {
        string is_superuser "Determines GM status"
    }
```

## Future changes

* Changes table concept for auditing
* Enforce that no-one can create
* Page permissions granted per-user (same as section)
* Gamemaster(GM) access to all secrets bounded by some wiki permission
  * No permission means no universal secrets on that wiki
  * Multiple wikis hosted on same runtime-instance with different GM permissions
