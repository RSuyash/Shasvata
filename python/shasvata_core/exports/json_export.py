import json


def rows_to_json(rows: list[dict[str, object]]) -> str:
    return json.dumps(rows, indent=2, sort_keys=True)
