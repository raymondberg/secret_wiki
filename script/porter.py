import asyncio
import sys

from secret_wiki.porter import Exporter, Importer


def error_out(msg):
    print(msg)
    sys.exit(1)


async def do_export(location):
    with open(location, "w") as file_handle:
        await Exporter(file_handle).run()


async def do_import(location):
    with open(location, "r") as file_handle:
        await Importer(file_handle).run()


if __name__ == "__main__":
    try:
        target = sys.argv[-1]
        command = sys.argv[-2]
        assert command in ("import", "export")
    except AssertionError:
        error_out("Must be one of import/export")
    except AssertionError:
        error_out("usage: [import|export] [filename]")

    print(f"{command}ing to {target}")

    if command == "import":
        asyncio.run(do_import(target))
    elif command == "export":
        asyncio.run(do_export(target))
