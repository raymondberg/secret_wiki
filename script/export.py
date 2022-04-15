import asyncio

from secret_wiki.porter import Exporter


async def export():
    with open("export.yaml", "w") as file_handle:
        await Exporter(file_handle).export()


if __name__ == "__main__":
    asyncio.run(export())
