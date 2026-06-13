import { useEffect, useState } from "react";

import {
  Home,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  Terminal,
  FileText,
  GitBranch,
  Link,
  Tag,
  Search,
  Sparkles,
  Moon,
} from "lucide-react";

const API_URL = "http://192.168.64.9:8089";
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-slate-200 text-slate-700";

    case "review":
      return "bg-yellow-100 text-yellow-700";

    case "published":
      return "bg-green-100 text-green-700";

    case "resolved":
      return "bg-green-100 text-green-700";

    case "investigating":
      return "bg-yellow-100 text-yellow-700";

    case "closed":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-red-100 text-red-700";
  }
};

const getSeverityClass = (severity) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700";

    case "high":
      return "bg-orange-100 text-orange-700";

    case "medium":
      return "bg-yellow-100 text-yellow-700";

    case "low":
      return "bg-green-100 text-green-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};
const getTypeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "incident":
      return "bg-red-50 text-red-600";

    case "change":
      return "bg-orange-50 text-orange-600";

    case "solution":
      return "bg-green-50 text-green-600";

    case "runbook":
      return "bg-blue-50 text-blue-600";

    case "procedure":
      return "bg-cyan-50 text-cyan-600";

    case "policy":
      return "bg-purple-50 text-purple-600";

    case "announcement":
      return "bg-pink-50 text-pink-600";

    case "postmortem":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};
const getSectionText = (text, sectionName, nextSectionName) => {
  if (!text) return "";

  const startMarker = `${sectionName}:`;
  const startIndex = text.indexOf(startMarker);

  if (startIndex === -1) return "";

  const contentStart = startIndex + startMarker.length;
  const endIndex = nextSectionName
    ? text.indexOf(`${nextSectionName}:`, contentStart)
    : -1;

  return text
    .slice(contentStart, endIndex === -1 ? undefined : endIndex)
    .trim();
};

const getTimelineItems = (text) => {
  const timelineText = getSectionText(text, "Timeline", "Resolution");

  return timelineText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};
const getSummary = (text) => {
  return getSectionText(text, "Summary", "Impact");
};

const getImpact = (text) => {
  return getSectionText(text, "Impact", "Timeline");
};

const getResolution = (text) => {
  return getSectionText(text, "Resolution", "Action Items");
};

const getActionItems = (text) => {
  return getSectionText(
    text,
    "Action Items",
    "Lessons Learned"
  )
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getLessonsLearned = (text) => {
  return getSectionText(text, "Lessons Learned")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};
const menu = [
  { id: "dashboard", name: "Dashboard", icon: Home },
  { id: "incident", name: "Incidents", icon: AlertTriangle },
  { id: "change", name: "Changes", icon: RefreshCw },
  { id: "solution", name: "Solutions / Troubleshooting", icon: Lightbulb },
  { id: "runbook", name: "Runbooks", icon: FileText },
  { id: "procedure", name: "Procedures", icon: Terminal },
  { id: "policy", name: "Policies", icon: GitBranch },
  { id: "announcement", name: "Announcements", icon: Sparkles },
  { id: "command", name: "Commands", icon: Terminal },
  { id: "postmortem", name: "Postmortems", icon: FileText },
  { id: "root-cause", name: "Root Causes", icon: GitBranch },
  { id: "links", name: "Useful Links", icon: Link },
  { id: "tags", name: "Tags", icon: Tag },
];

function App() {
  const [records, setRecords] = useState([]);
  const [newEntryText, setNewEntryText] = useState("");
  const [classification, setClassification] = useState(null);
  const [entryType, setEntryType] = useState("auto");
  const [manualService, setManualService] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [postmortemImpact, setPostmortemImpact] = useState("");
  const [postmortemTimeline, setPostmortemTimeline] = useState("");
  const [postmortemResolution, setPostmortemResolution] = useState("");
  const [postmortemActions, setPostmortemActions] = useState("");
  const [postmortemLessons, setPostmortemLessons] = useState("");
  const [postmortemStatus, setPostmortemStatus] = useState("draft");
  const [postmortemSeverity, setPostmortemSeverity] = useState("low");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editRootCause, setEditRootCause] = useState("");
  const [editSolution, setEditSolution] = useState("");
  const [editCommands, setEditCommands] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/records`)
      .then((response) => response.json())
      .then((data) => setRecords(data))
      .catch((error) => console.error("Failed to load records:", error));
  }, []);

  const handleClassify = async (text) => {
    if (!text.trim()) {
      setClassification(null);
      return;
    }

    const response = await fetch(`${API_URL}/api/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setClassification(data);
  };

  const handleCreateRecord = async () => {
    if (!newEntryText.trim()) return;

    let recordData;

    if (entryType === "auto") {
      const classifyResponse = await fetch(`${API_URL}/api/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newEntryText }),
      });

      const classification = await classifyResponse.json();

      recordData = {
        title: newEntryText.slice(0, 80),
        description: newEntryText,
        type: classification.type,
        service: classification.service,
        severity: classification.severity,
        status: "open",
        source: "manual",
        commands: "",
        tags: classification.tags,
      };
    } else {
      const parsedTags = manualTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      recordData = {
        title: newEntryText.slice(0, 80),
        description:
          entryType === "postmortem"
            ? `Summary:
${newEntryText}

Impact:
${postmortemImpact}

Timeline:
${postmortemTimeline}

Resolution:
${postmortemResolution}

Action Items:
${postmortemActions}

Lessons Learned:
${postmortemLessons}`
            : newEntryText,
        type: entryType,
        service: manualService.trim() || "Unknown",
        severity:
          entryType === "postmortem"
            ? postmortemSeverity
            : "low",
        status:
          entryType === "postmortem"
            ? postmortemStatus
            : "open",
        source: "manual",
        commands: "",
        tags: parsedTags.length > 0 ? parsedTags : [entryType],
      };
    }

    const recordResponse = await fetch(`${API_URL}/api/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recordData),
    });

    const createdRecord = await recordResponse.json();

    setRecords([createdRecord, ...records]);
    setSelectedRecord(createdRecord);
    setNewEntryText("");
    setClassification(null);
    setEntryType("auto");
    setManualService("");
    setManualTags("");
    setPostmortemImpact("");
    setPostmortemTimeline("");
    setPostmortemResolution("");
    setPostmortemActions("");
    setPostmortemLessons("");
    setPostmortemSeverity("low");
    setPostmortemStatus("draft");
  };

  const handleStartEdit = () => {
    if (!selectedRecord) return;

    setEditTitle(selectedRecord.title || "");
    setEditDescription(selectedRecord.description || "");
    setEditStatus(selectedRecord.status || "open");
    setEditRootCause(selectedRecord.root_cause || "");
    setEditSolution(selectedRecord.solution || "");
    setEditCommands(selectedRecord.commands || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("");
    setEditRootCause("");
    setEditSolution("");
    setEditCommands("");
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    const response = await fetch(`${API_URL}/api/records/${selectedRecord.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        type: selectedRecord.type,
        service: selectedRecord.service,
        host: selectedRecord.host,
        severity: selectedRecord.severity,
        status: editStatus,
        source: selectedRecord.source,
        root_cause: editRootCause,
        solution: editSolution,
        commands: editCommands,
        tags: selectedRecord.tags || [],
      }),
    });

    const updatedRecord = await response.json();

    setRecords(
      records.map((record) =>
        record.id === updatedRecord.id ? updatedRecord : record
      )
    );

    setSelectedRecord(updatedRecord);
    setIsEditing(false);
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;

    const confirmDelete = window.confirm(
      `Delete record: "${selectedRecord.title}"?`
    );

    if (!confirmDelete) return;

    await fetch(`${API_URL}/api/records/${selectedRecord.id}`, {
      method: "DELETE",
    });

    const updatedRecords = records.filter(
      (record) => record.id !== selectedRecord.id
    );

    setRecords(updatedRecords);
    setSelectedRecord(updatedRecords[0] || null);
    setIsEditing(false);
  };
  const clearFilters = () => {
    setSelectedTag(null);
    setSelectedService(null);
    setSelectedStatus("all");
    setSearchTerm("");
  };
  const tagCounts = records.reduce((acc, record) => {
    (record.tags || []).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });

    return acc;
  }, {});

  const serviceCounts = records.reduce((acc, record) => {
    if (record.service) {
      acc[record.service] = (acc[record.service] || 0) + 1;
    }

    return acc;
  }, {});

  const popularTags = Object.entries(tagCounts);
  const popularServices = Object.entries(serviceCounts);
  const hasActiveFilters =
    selectedTag ||
    selectedService ||
    selectedStatus !== "all" ||
    searchTerm;
  const stats = [
    {
      title: "Incidents",
      value: records.filter((record) => record.type === "incident").length,
      diff: "Detected issues",
      icon: AlertTriangle,
    },
    {
      title: "Changes",
      value: records.filter((record) => record.type === "change").length,
      diff: "Infra updates",
      icon: RefreshCw,
    },
    {
      title: "Solutions",
      value: records.filter((record) => record.type === "solution").length,
      diff: "Known fixes",
      icon: Lightbulb,
    },
    {
      title: "Tags",
      value: new Set(records.flatMap((record) => record.tags || [])).size,
      diff: "Knowledge labels",
      icon: Tag,
    },
  ];

  let filteredRecords =
    activeSection === "dashboard"
      ? records
      : records.filter((record) => record.type === activeSection);

  filteredRecords = filteredRecords.filter((record) => {
    const search = searchTerm.toLowerCase();

    return (
      record.title?.toLowerCase().includes(search) ||
      record.description?.toLowerCase().includes(search) ||
      record.service?.toLowerCase().includes(search) ||
      record.commands?.toLowerCase().includes(search) ||
      (record.tags || []).join(" ").toLowerCase().includes(search)
    );
  });
  if (selectedTag) {
    filteredRecords = filteredRecords.filter((record) =>
      (record.tags || []).includes(selectedTag)
    );
  }

  if (selectedService) {
    filteredRecords = filteredRecords.filter(
      (record) => record.service === selectedService
    );
  }

  if (selectedStatus !== "all") {
    filteredRecords = filteredRecords.filter(
      (record) => record.status === selectedStatus
    );
  }

  filteredRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    }

    if (sortBy === "updated") {
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    }

    return new Date(b.created_at) - new Date(a.created_at);
  });

  const activeMenuItem = menu.find((item) => item.id === activeSection);
  const pageTitle = activeMenuItem ? activeMenuItem.name : "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 text-white">
        <div className="flex items-center gap-3 px-6 py-7 text-lg font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            OK
          </div>
          Ops Knowledge Base
        </div>

        <nav className="mt-4 space-y-1 px-4">
          {menu.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${activeSection === id
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-900"
                }`}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 text-sm text-slate-400">
          © 2026 Ops KB
          <br />
          v0.1.0
        </div>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-10">
          <div className="flex w-[520px] items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-400">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search records..."
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
            <span className="ml-auto rounded-md bg-slate-100 px-2 py-1 text-xs">
              CTRL + K
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Moon size={20} className="text-slate-500" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
              D
            </div>
            <span className="font-medium">admin</span>
          </div>
        </header>

        <section className="p-10">
          <h1 className="mb-8 text-3xl font-bold">{pageTitle}</h1>
          {hasActiveFilters && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">
                  Active Filters:
                </span>

                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200"
                  >
                    Tag: {selectedTag} ×
                  </button>
                )}

                {selectedService && (
                  <button
                    onClick={() => setSelectedService(null)}
                    className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200"
                  >
                    Service: {selectedService} ×
                  </button>
                )}

                {selectedStatus !== "all" && (
                  <button
                    onClick={() => setSelectedStatus("all")}
                    className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700 hover:bg-yellow-200"
                  >
                    Status: {selectedStatus} ×
                  </button>
                )}

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700 hover:bg-purple-200"
                  >
                    Search: {searchTerm} ×
                  </button>
                )}

                <button
                  onClick={clearFilters}
                  className="ml-auto rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
          <div className="mb-6 flex flex-wrap gap-2">
            {["all", "open", "investigating", "resolved", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setIsEditing(false);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-6">
            {stats.map(({ title, value, diff, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-sm text-slate-500">{diff}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-[1.4fr_1fr] gap-6">
            <div
              onClick={() => {
                setSelectedRecord(null);
                setIsEditing(false);
              }}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold">
                  {activeSection === "dashboard"
                    ? `Recent Records (${filteredRecords.length} of ${records.length})`
                    : `${pageTitle} (${filteredRecords.length})`}
                </h2>

                <select
                  value={sortBy}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredRecords.length === 0 && (
                  <div className="px-6 py-8 text-sm text-slate-500">
                    No records found in this section yet.
                  </div>
                )}

                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedRecord(record);
                      setIsEditing(false);
                    }}
                    className={`flex cursor-pointer items-center justify-between px-6 py-4 ${selectedRecord?.id === record.id
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                      }`}
                  >
                    <div>
                      <p className="font-semibold">{record.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeClass(
                            record.type
                          )}`}
                        >
                          {record.type}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status || "open"}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getSeverityClass(
                            record.severity
                          )}`}
                        >
                          {record.severity}
                        </span>
                        {record.service && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
                            {record.service}
                          </span>
                        )}
                        {(record.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">
                      {new Date(record.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Record Details</h2>

                  {selectedRecord && !isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleStartEdit}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </button>

                      <button
                        onClick={handleDeleteRecord}
                        className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {!selectedRecord && (
                  <p className="text-sm text-slate-500">Select a record</p>
                )}

                {selectedRecord && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase text-slate-400">Title</p>
                      {isEditing ? (
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="font-semibold">{selectedRecord.title}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        {selectedRecord.type === "postmortem"
                          ? "Postmortem Details"
                          : "Description"}
                      </p>
                      {isEditing ? (
                        <textarea
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          className="mt-1 h-32 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                        />
                      ) : (
                        <>
                          {selectedRecord.type === "postmortem" && (
                            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                              <div className="flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" />
                                <span className="font-semibold text-blue-700">
                                  Postmortem Report
                                </span>
                              </div>
                            </div>
                          )}

                          {selectedRecord.type === "postmortem" ? (
                            <div className="space-y-4">
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Summary
                                </p>
                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                  {getSummary(selectedRecord.description) || "No summary provided"}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Impact
                                </p>
                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                  {getImpact(selectedRecord.description) || "No impact provided"}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Resolution
                                </p>
                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                  {getResolution(selectedRecord.description) || "No resolution provided"}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Action Items
                                </p>

                                <div className="space-y-2">
                                  {getActionItems(selectedRecord.description).length > 0 ? (
                                    getActionItems(selectedRecord.description).map((item, index) => (
                                      <div key={index} className="flex gap-2 text-sm text-slate-700">
                                        <span className="text-green-600">✓</span>
                                        <span>{item}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-slate-500">No action items provided</p>
                                  )}
                                </div>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Lessons Learned
                                </p>

                                <div className="space-y-2">
                                  {getLessonsLearned(selectedRecord.description).length > 0 ? (
                                    getLessonsLearned(selectedRecord.description).map((lesson, index) => (
                                      <div key={index} className="flex gap-2 text-sm text-slate-700">
                                        <span className="text-blue-600">•</span>
                                        <span>{lesson}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-slate-500">No lessons learned provided</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {selectedRecord.description || "No description"}
                            </p>
                          )}
                          {selectedRecord.type === "postmortem" &&
                            getTimelineItems(selectedRecord.description).length > 0 && (
                              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                                  Incident Timeline
                                </h3>

                                <div className="mt-4">
                                  {getTimelineItems(selectedRecord.description).map((item, index) => {
                                    const timelineItems = getTimelineItems(selectedRecord.description);
                                    const isFirst = index === 0;
                                    const isLast = index === timelineItems.length - 1;

                                    return (
                                      <div key={index} className="flex items-center gap-5">
                                        <div className="relative flex h-8 w-6 justify-center">
                                          {!isFirst && (
                                            <div className="absolute top-0 h-1/2 w-px bg-slate-500/40" />
                                          )}

                                          {!isLast && (
                                            <div className="absolute bottom-0 h-1/2 w-px bg-slate-500/40" />
                                          )}

                                          <div
                                            className={`absolute top-1/2 -translate-y-1/2 bg-blue-600 ${isLast
                                              ? "h-5 w-5 rounded-full"
                                              : "h-2.5 w-4 rounded-full"
                                              }`}
                                          />
                                        </div>

                                        <p className="text-sm leading-6 text-slate-700">
                                          {item}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedRecord.type !== "postmortem" && (
                        <>
                          <div>
                            <p className="text-xs uppercase text-slate-400">
                              Root Cause
                            </p>

                            {isEditing ? (
                              <textarea
                                value={editRootCause}
                                onChange={(event) =>
                                  setEditRootCause(event.target.value)
                                }
                                className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                              />
                            ) : (
                              <p className="text-sm leading-6 text-slate-700">
                                {selectedRecord.root_cause || "Not specified"}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs uppercase text-slate-400">
                              Solution
                            </p>

                            {isEditing ? (
                              <textarea
                                value={editSolution}
                                onChange={(event) =>
                                  setEditSolution(event.target.value)
                                }
                                className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                              />
                            ) : (
                              <p className="text-sm leading-6 text-slate-700">
                                {selectedRecord.solution || "Not specified"}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-400">
                              Commands
                            </p>

                            {isEditing ? (
                              <textarea
                                value={editCommands}
                                onChange={(event) => setEditCommands(event.target.value)}
                                className="mt-1 h-28 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm outline-none focus:border-blue-500"
                                placeholder="Example: docker compose restart jenkins"
                              />
                            ) : (
                              <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                                {selectedRecord.commands || "No commands"}
                              </pre>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Record Metadata
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Type</span>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTypeClass(
                              selectedRecord.type
                            )}`}
                          >
                            {selectedRecord.type}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Status</span>

                          {isEditing && selectedRecord.type === "postmortem" ? (
                            <select
                              value={editStatus}
                              onChange={(event) => setEditStatus(event.target.value)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >
                              <option value="draft">Draft</option>
                              <option value="review">Review</option>
                              <option value="published">Published</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                selectedRecord.status
                              )}`}
                            >
                              {selectedRecord.status}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Severity</span>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getSeverityClass(
                              selectedRecord.severity
                            )}`}
                          >
                            {selectedRecord.severity}
                          </span>
                        </div>

                        <hr className="border-slate-200" />

                        <div className="flex justify-between">
                          <span className="text-slate-500">Service</span>
                          <span className="font-medium">
                            {selectedRecord.service || "Unknown"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Source</span>
                          <span className="font-medium">
                            {selectedRecord.source || "manual"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Created</span>
                          <span>
                            {new Date(selectedRecord.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Updated</span>
                          <span>
                            {selectedRecord.updated_at
                              ? new Date(selectedRecord.updated_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                              : "Never updated"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">First Seen</span>
                          <span>
                            {selectedRecord.first_seen
                              ? new Date(selectedRecord.first_seen).toLocaleString()
                              : "Not tracked"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Seen</span>
                          <span>
                            {selectedRecord.last_seen
                              ? new Date(selectedRecord.last_seen).toLocaleString()
                              : "Not tracked"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Resolved At</span>
                          <span>
                            {selectedRecord.resolved_at
                              ? new Date(selectedRecord.resolved_at).toLocaleString()
                              : "Not resolved"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Event Count</span>
                          <span className="font-medium">
                            {selectedRecord.event_count || 1}
                          </span>
                        </div>
                        <hr className="border-slate-200" />

                        <div>
                          <span className="text-slate-500">Tags</span>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(selectedRecord.tags || []).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Save
                        </button>

                        <button
                          onClick={handleCancelEdit}
                          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Popular Tags</h2>

                <div className="flex flex-wrap gap-2">
                  {popularTags.length === 0 && (
                    <p className="text-sm text-slate-500">No tags yet</p>
                  )}

                  {popularTags.map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(selectedTag === tag ? null : tag);
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${selectedTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {tag} ({count})
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Services</h2>

                <div className="flex flex-wrap gap-2">
                  {popularServices.length === 0 && (
                    <p className="text-sm text-slate-500">No services yet</p>
                  )}

                  {popularServices.map(([service, count]) => (
                    <button
                      key={service}
                      onClick={() => {
                        setSelectedService(
                          selectedService === service ? null : service
                        );
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${selectedService === service
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {service} ({count})
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <Sparkles className="text-blue-600" />
                  <div>
                    <h2 className="text-lg font-bold">Create New Entry</h2>
                    <p className="text-sm text-slate-500">
                      Live classification preview
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Type
                  </label>

                  <select
                    value={entryType}
                    onChange={(event) => setEntryType(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="auto">Auto</option>
                    <option value="incident">Incident</option>
                    <option value="change">Change</option>
                    <option value="solution">Solution</option>
                    <option value="runbook">Runbook</option>
                    <option value="procedure">Procedure</option>
                    <option value="policy">Policy</option>
                    <option value="announcement">Announcement</option>
                    <option value="postmortem">Postmortem</option>
                  </select>
                </div>
                {entryType !== "auto" && (
                  <div className="mb-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Service
                      </label>

                      <input
                        value={manualService}
                        onChange={(event) => setManualService(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                        placeholder="Example: DNS, Jenkins, Zabbix, Linux"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Tags
                      </label>

                      <input
                        value={manualTags}
                        onChange={(event) => setManualTags(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                        placeholder="Example: dns, domains, naming"
                      />
                    </div>
                    {entryType === "postmortem" && (
                      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="font-semibold text-slate-800">
                          Postmortem Template
                        </h3>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Postmortem Status
                          </label>

                          <select
                            value={postmortemStatus}
                            onChange={(event) => setPostmortemStatus(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Severity
                          </label>

                          <select
                            value={postmortemSeverity}
                            onChange={(event) => setPostmortemSeverity(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <textarea
                          value={postmortemImpact}
                          onChange={(event) => setPostmortemImpact(event.target.value)}
                          className="h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                          placeholder="Impact: Who or what was affected?"
                        />

                        <textarea
                          value={postmortemTimeline}
                          onChange={(event) => setPostmortemTimeline(event.target.value)}
                          className="h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                          placeholder="Timeline: What happened and when?"
                        />

                        <textarea
                          value={postmortemResolution}
                          onChange={(event) => setPostmortemResolution(event.target.value)}
                          className="h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                          placeholder="Resolution: How was the issue fixed?"
                        />

                        <textarea
                          value={postmortemActions}
                          onChange={(event) => setPostmortemActions(event.target.value)}
                          className="h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                          placeholder="Action Items: What should be improved?"
                        />

                        <textarea
                          value={postmortemLessons}
                          onChange={(event) => setPostmortemLessons(event.target.value)}
                          className="h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                          placeholder="Lessons Learned"
                        />
                      </div>
                    )}
                  </div>
                )}
                <textarea
                  value={newEntryText}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewEntryText(value);

                    if (entryType === "auto") {
                      handleClassify(value);
                    } else {
                      setClassification(null);
                    }
                  }}
                  className="h-44 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
                  placeholder="Example: Jenkins container failed after restart because of permission denied on volume."
                />

                {classification && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-3 font-semibold text-slate-800">
                      Detected Classification
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Type:</strong> {classification.type}
                      </p>
                      <p>
                        <strong>Service:</strong> {classification.service}
                      </p>
                      <p>
                        <strong>Severity:</strong> {classification.severity}
                      </p>

                      <div>
                        <strong>Tags:</strong>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(classification.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCreateRecord}
                  className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {entryType === "auto" ? "Submit & Classify" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

  );

}

export default App;