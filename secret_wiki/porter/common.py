from abc import ABCMeta, abstractmethod
from uuid import UUID

from ruamel.yaml import YAML
from ruamel.yaml.representer import SafeRepresenter

from secret_wiki import schemas


def just_stringify(representer, value):
    return representer.represent_scalar("tag:yaml.org,2002:str", str(value))


def just_enum(representer, value):
    return representer.represent_scalar("tag:yaml.org,2002:str", value.value)


SafeRepresenter.add_representer(UUID, just_stringify)
SafeRepresenter.add_representer(schemas.PermissionLevel, just_enum)


class Porter(metaclass=ABCMeta):
    def __init__(self, buffer):
        self.buffer = buffer

    @property
    def yaml(self):
        yaml = YAML(typ="safe")
        yaml.default_flow_style = False
        return yaml

    @abstractmethod
    def run(self):
        raise NotImplemented()
