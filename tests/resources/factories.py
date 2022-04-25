import factory

from secret_wiki.db import User
from secret_wiki.models.wiki import Page, Section, Wiki


class UUIDFactory(factory.Factory):
    id = factory.Faker("uuid4")


class SectionFactory(UUIDFactory):
    class Meta:
        model = Section

    content = factory.Faker("sentence")


class PageFactory(UUIDFactory):
    class Meta:
        model = Page


class UserFactory(UUIDFactory):
    class Meta:
        model = User

    email = factory.Faker("email")
    hashed_password = "blah"


class WikiFactory(UUIDFactory):
    class Meta:
        model = Wiki
