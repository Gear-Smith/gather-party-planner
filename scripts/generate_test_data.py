#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import zipfile
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
import xml.etree.ElementTree as ET

NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
SHEET_EXPORTS = {
    "locations": "locations.json",
    "Users": "users.json",
    "Parties": "parties.json",
    "Itinerary": "itinerary.json",
}
DATE_STRING_FIELDS = {
    "user_created",
    "user_last_active",
    "party_created_at",
    "party_updated_at",
}
DATE_SERIAL_FIELDS = {"party_start", "party_end", "itin_start", "itin_end"}
ID_FIELDS = {
    "location_id",
    "user_id",
    "party_id",
    "party_creator",
    "itin_id",
}
INTEGER_FIELDS = {"party_headcount"}
ORDINAL_FIELDS = {
    "location_rating",
    "location_tone",
    "location_exposure",
    "location_morality",
    "location_budget",
    "party_tone",
    "party_exposure",
    "party_morality",
    "party_budget",
}
LABEL_COLUMNS = {
    "location_rating": "LOCATION_RATING_LABELS",
    "location_tone": "LOCATION_TONE_LABELS",
    "location_exposure": "LOCATION_EXPOSURE_LABELS",
    "location_morality": "LOCATION_MORALITY_LABELS",
    "location_budget": "LOCATION_BUDGET_LABELS",
}
TYPE_NAMES = {
    "location_rating": "LocationRating",
    "location_tone": "LocationTone",
    "location_exposure": "LocationExposure",
    "location_morality": "LocationMorality",
    "location_budget": "LocationBudget",
}
TYPE_EXPORT_ORDER = [
    "location_rating",
    "location_tone",
    "location_exposure",
    "location_morality",
    "location_budget",
]


@dataclass(frozen=True)
class SheetCell:
    value: Any
    raw: str | None
    cell_type: str | None


class XlsxWorkbook:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.archive = zipfile.ZipFile(path)
        self.shared_strings = self._load_shared_strings()
        self.relationships = self._load_relationships()
        self.sheet_targets = self._load_sheet_targets()

    def _load_shared_strings(self) -> list[str]:
        if "xl/sharedStrings.xml" not in self.archive.namelist():
            return []
        root = ET.fromstring(self.archive.read("xl/sharedStrings.xml"))
        return [
            "".join((text.text or "") for text in string.iterfind(f".//{{{NS_MAIN}}}t"))
            for string in root.findall(f"{{{NS_MAIN}}}si")
        ]

    def _load_relationships(self) -> dict[str, str]:
        root = ET.fromstring(self.archive.read("xl/_rels/workbook.xml.rels"))
        return {rel.attrib["Id"]: rel.attrib["Target"] for rel in root}

    def _load_sheet_targets(self) -> dict[str, str]:
        root = ET.fromstring(self.archive.read("xl/workbook.xml"))
        sheets = root.find(f"{{{NS_MAIN}}}sheets")
        if sheets is None:
            return {}
        targets: dict[str, str] = {}
        for sheet in sheets:
            name = sheet.attrib["name"]
            rel_id = sheet.attrib[f"{{{NS_REL}}}id"]
            target = self.relationships[rel_id]
            targets[name] = target if target.startswith("xl/") else f"xl/{target}"
        return targets

    def read_sheet(self, name: str) -> list[list[SheetCell | None]]:
        root = ET.fromstring(self.archive.read(self.sheet_targets[name]))
        sheet_data = root.find(f"{{{NS_MAIN}}}sheetData")
        if sheet_data is None:
            return []

        rows: list[list[SheetCell | None]] = []
        for row in sheet_data:
            cells: dict[int, SheetCell] = {}
            max_col = -1
            for cell in row:
                column_index = column_index_from_ref(cell.attrib["r"])
                cells[column_index] = self._parse_cell(cell)
                max_col = max(max_col, column_index)

            if max_col < 0:
                continue

            ordered = [cells.get(index) for index in range(max_col + 1)]
            if all(item is None or item.value is None for item in ordered):
                continue
            rows.append(ordered)

        return rows

    def _parse_cell(self, cell: ET.Element) -> SheetCell:
        cell_type = cell.attrib.get("t")

        if cell_type == "inlineStr":
            value = "".join((text.text or "") for text in cell.iterfind(f".//{{{NS_MAIN}}}t"))
            return SheetCell(value=value, raw=value, cell_type=cell_type)

        value_element = cell.find(f"{{{NS_MAIN}}}v")
        if value_element is None:
            return SheetCell(value=None, raw=None, cell_type=cell_type)

        raw_value = value_element.text
        if raw_value is None:
            return SheetCell(value=None, raw=None, cell_type=cell_type)

        if cell_type == "s":
            return SheetCell(
                value=self.shared_strings[int(raw_value)],
                raw=raw_value,
                cell_type=cell_type,
            )

        if cell_type == "b":
            return SheetCell(value=raw_value == "1", raw=raw_value, cell_type=cell_type)

        return SheetCell(value=raw_value, raw=raw_value, cell_type=cell_type)

    def close(self) -> None:
        self.archive.close()


def column_index_from_ref(cell_ref: str) -> int:
    letters = "".join(character for character in cell_ref if character.isalpha())
    index = 0
    for character in letters:
        index = (index * 26) + (ord(character.upper()) - 64)
    return index - 1


def trim_string(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    if trimmed == "" or trimmed.lower() == "n/a":
        return None
    return trimmed


def parse_date_string(value: str) -> str:
    parsed = datetime.strptime(value, "%d/%m/%Y %H:%M")
    return parsed.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")


def parse_excel_serial(value: str | int | float) -> str:
    serial = float(value)
    base = datetime(1899, 12, 30, tzinfo=timezone.utc)
    parsed = base + timedelta(days=serial)
    return parsed.isoformat().replace("+00:00", "Z")


def parse_ordinal(value: Any) -> int:
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)

    text = trim_string(str(value))
    if text is None:
        raise ValueError("Ordinal value cannot be empty.")

    match = re.match(r"^(\d+)\s*-\s*(.+)$", text)
    if match:
        return int(match.group(1))

    if text.isdigit():
        return int(text)

    if set(text) == {"$"}:
        return len(text)

    raise ValueError(f"Unsupported ordinal value: {value!r}")


def build_sheet_records(rows: list[list[SheetCell | None]], sheet_name: str) -> list[dict[str, Any]]:
    if not rows:
        return []

    headers = [trim_string(cell.value if cell else None) for cell in rows[0]]
    if any(header is None for header in headers):
        raise ValueError(f"Sheet {sheet_name} contains an empty header column.")

    records: list[dict[str, Any]] = []
    for row in rows[1:]:
        record: dict[str, Any] = {}
        for index, header in enumerate(headers):
            assert header is not None
            cell = row[index] if index < len(row) else None
            record[header] = normalize_field_value(header, cell)
        records.append(record)
    return records


def normalize_field_value(header: str, cell: SheetCell | None) -> Any:
    if cell is None:
        return None

    value = cell.value
    if isinstance(value, str):
        value = trim_string(value)

    if value is None:
        return None

    if header in DATE_STRING_FIELDS:
        return parse_date_string(str(value))

    if header in DATE_SERIAL_FIELDS:
        return parse_excel_serial(value)

    if header in INTEGER_FIELDS:
        return int(str(value))

    if header in ORDINAL_FIELDS:
        return parse_ordinal(value)

    if header in ID_FIELDS:
        return str(value)

    return value


def build_label_maps(rows: list[list[SheetCell | None]]) -> dict[str, dict[int, str]]:
    headers = [trim_string(cell.value if cell else None) for cell in rows[0]]
    index_by_header = {header: index for index, header in enumerate(headers) if header is not None}
    label_maps: dict[str, dict[int, str]] = {}

    for column in LABEL_COLUMNS:
        values: dict[int, str] = {}
        column_index = index_by_header[column]
        for row in rows[1:]:
            cell = row[column_index] if column_index < len(row) else None
            if cell is None or cell.value is None:
                continue
            normalized = trim_string(str(cell.value))
            if normalized is None:
                continue
            match = re.match(r"^(\d+)\s*-\s*(.+)$", normalized)
            if not match:
                continue
            values[int(match.group(1))] = match.group(2).strip()
        label_maps[column] = values

    return label_maps


def build_literal_values(records: list[dict[str, Any]], column: str) -> list[str]:
    values: list[str] = []
    for record in records:
        value = record[column]
        if value is None:
            continue
        text = str(value)
        if text not in values:
            values.append(text)
    return values


def write_json(path: Path, data: Any) -> None:
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def render_ts_module(
    label_maps: dict[str, dict[int, str]],
    location_types: list[str],
    user_roles: list[str],
    user_statuses: list[str],
    party_types: list[str],
    party_statuses: list[str],
) -> str:
    lines: list[str] = []
    lines.append("export const LOCATION_RATING_LABELS = {")
    for field in TYPE_EXPORT_ORDER:
        if field != "location_rating":
            continue
        for score, label in label_maps[field].items():
            lines.append(f'  {score}: "{escape_ts_string(label)}",')
    lines.append("} as const;")
    lines.append("")

    for field in TYPE_EXPORT_ORDER[1:]:
        const_name = LABEL_COLUMNS[field]
        lines.append(f"export const {const_name} = {{")
        for score, label in label_maps[field].items():
            lines.append(f'  {score}: "{escape_ts_string(label)}",')
        lines.append("} as const;")
        lines.append("")

    for field in TYPE_EXPORT_ORDER:
        lines.append(f"export type {TYPE_NAMES[field]} = 1 | 2 | 3 | 4 | 5;")
    lines.append("")

    lines.append(render_literal_array("LOCATION_TYPE_VALUES", location_types))
    lines.append("")
    lines.append(render_literal_array("USER_ROLE_VALUES", user_roles))
    lines.append("")
    lines.append(render_literal_array("USER_STATUS_VALUES", user_statuses))
    lines.append("")
    lines.append(render_literal_array("PARTY_TYPE_VALUES", party_types))
    lines.append("")
    lines.append(render_literal_array("PARTY_STATUS_VALUES", party_statuses))
    lines.append("")

    lines.extend(
        [
            "export interface LocationRecord {",
            "  location_id: string;",
            "  location_type: (typeof LOCATION_TYPE_VALUES)[number];",
            "  location_city: string | null;",
            "  location_name: string | null;",
            "  location_rating: LocationRating | null;",
            "  location_address: string | null;",
            "  location_hours: string | null;",
            "  location_phone: string | null;",
            "  location_website: string | null;",
            "  location_pictures: string | null;",
            "  location_tone: LocationTone | null;",
            "  location_exposure: LocationExposure | null;",
            "  location_morality: LocationMorality | null;",
            "  location_budget: LocationBudget | null;",
            "}",
            "",
            "export interface UserRecord {",
            "  user_id: string;",
            "  user_created: string | null;",
            "  user_first_name: string | null;",
            "  user_last_name: string | null;",
            "  user_display_name: string | null;",
            "  user_role: (typeof USER_ROLE_VALUES)[number] | null;",
            "  user_phone: string | null;",
            "  user_email: string | null;",
            "  user_last_active: string | null;",
            "  user_status: (typeof USER_STATUS_VALUES)[number] | null;",
            "}",
            "",
            "export interface PartyRecord {",
            "  party_id: string;",
            "  party_creator: string | null;",
            "  party_created_at: string | null;",
            "  party_updated_at: string | null;",
            "  party_name: string | null;",
            "  party_type: (typeof PARTY_TYPE_VALUES)[number] | null;",
            "  party_status: (typeof PARTY_STATUS_VALUES)[number] | null;",
            "  party_start: string | null;",
            "  party_end: string | null;",
            "  party_location: string | null;",
            "  party_headcount: number | null;",
            "  party_tone: LocationTone | null;",
            "  party_exposure: LocationExposure | null;",
            "  party_morality: LocationMorality | null;",
            "  party_budget: LocationBudget | null;",
            "  party_planner: string | null;",
            "  party_share_code: string | null;",
            "}",
            "",
            "export interface ItineraryRecord {",
            "  itin_id: string;",
            "  party_id: string | null;",
            "  itin_title: string | null;",
            "  itin_start: string | null;",
            "  itin_end: string | null;",
            "  itin_location: string | null;",
            "  itin_roster: string | null;",
            "}",
            "",
        ]
    )
    return "\n".join(lines)


def render_literal_array(name: str, values: list[str]) -> str:
    lines = [f"export const {name} = ["]
    for value in values:
        lines.append(f'  "{escape_ts_string(value)}",')
    lines.append("] as const;")
    return "\n".join(lines)


def escape_ts_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    workbook_path = root / "test_data" / "Gather Tables.xlsx"
    output_dir = root / "test_data" / "json"
    output_dir.mkdir(parents=True, exist_ok=True)

    workbook = XlsxWorkbook(workbook_path)
    try:
        sheet_records: dict[str, list[dict[str, Any]]] = {}
        for sheet_name in SHEET_EXPORTS:
            rows = workbook.read_sheet(sheet_name)
            sheet_records[sheet_name] = build_sheet_records(rows, sheet_name)

        dict_rows = workbook.read_sheet("location Dict")
        label_maps = build_label_maps(dict_rows)

        write_json(output_dir / SHEET_EXPORTS["locations"], sheet_records["locations"])
        write_json(output_dir / SHEET_EXPORTS["Users"], sheet_records["Users"])
        write_json(output_dir / SHEET_EXPORTS["Parties"], sheet_records["Parties"])
        write_json(output_dir / SHEET_EXPORTS["Itinerary"], sheet_records["Itinerary"])

        types_source = render_ts_module(
            label_maps=label_maps,
            location_types=build_literal_values(sheet_records["locations"], "location_type"),
            user_roles=build_literal_values(sheet_records["Users"], "user_role"),
            user_statuses=build_literal_values(sheet_records["Users"], "user_status"),
            party_types=build_literal_values(sheet_records["Parties"], "party_type"),
            party_statuses=build_literal_values(sheet_records["Parties"], "party_status"),
        )
        (output_dir / "test-data.types.ts").write_text(f"{types_source}\n", encoding="utf-8")
    finally:
        workbook.close()


if __name__ == "__main__":
    main()
