from fastapi import FastAPI

app = FastAPI(
    title="Operations Knowledge Platform API",
    version="0.1.0",
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "operations-knowledge-platform-api",
        "version": "0.1.0",
    }


@app.get("/api/records")
def get_records():
    return [
        {
            "id": 1,
            "type": "incident",
            "title": "Jenkins container failed after restart",
            "service": "Jenkins",
            "severity": "medium",
            "status": "resolved",
            "source": "manual",
            "tags": ["jenkins", "docker", "permissions"],
        },
        {
            "id": 2,
            "type": "change",
            "title": "Kernel updated on ubuntu-lab-01",
            "service": "Linux",
            "severity": "low",
            "status": "completed",
            "source": "api",
            "tags": ["linux", "kernel", "update"],
        },
    ]
