def classify_text(text: str) -> dict:
    normalized = text.lower()

    record_type = "note"
    service = "Unknown"
    severity = "low"
    tags = set()

    if any(word in normalized for word in ["failed", "error", "down", "crash", "not working", "упал", "ошибка"]):
        record_type = "incident"
        severity = "medium"

    if any(word in normalized for word in ["updated", "upgrade", "changed", "maintenance", "обнов", "измен"]):
        record_type = "change"

    if any(word in normalized for word in ["solution", "fixed", "resolved", "решение", "исправ"]):
        if record_type == "note":
            record_type = "solution"

    if "jenkins" in normalized:
        service = "Jenkins"
        tags.add("jenkins")

    if "docker" in normalized or "container" in normalized or "compose" in normalized:
        service = "Docker" if service == "Unknown" else service
        tags.add("docker")

    if "linux" in normalized or "kernel" in normalized or "systemctl" in normalized:
        service = "Linux" if service == "Unknown" else service
        tags.add("linux")

    if "zabbix" in normalized:
        service = "Zabbix"
        tags.add("zabbix")

    if "prometheus" in normalized:
        service = "Prometheus"
        tags.add("prometheus")

    if "permission" in normalized or "denied" in normalized or "chown" in normalized:
        tags.add("permissions")

    if "kernel" in normalized:
        tags.add("kernel")

    if "update" in normalized or "updated" in normalized or "upgrade" in normalized:
        tags.add("update")

    if not tags:
        tags.add("manual")

    return {
        "type": record_type,
        "service": service,
        "severity": severity,
        "tags": sorted(tags),
    }
