import factory

from secret_wiki.models.wiki import Section


class SectionFactory(factory.Factory):
    class Meta:
        model = Section

    id = factory.Faker("uuid4")
