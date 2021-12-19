from astroid import MANAGER, scoped_nodes


def register(_):
    pass


def transform(mod):
    if "tests." not in mod.name:
        return
    contents = mod.stream().read()
    # change to the message-id you need
    contents = b"# pylint: disable=redefined-outer-name\n" + contents
    # pylint will read from `.file_bytes` attribute later when tokenization
    mod.file_bytes = contents


MANAGER.register_transform(scoped_nodes.Module, transform)
