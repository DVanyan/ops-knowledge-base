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

const stats = [
  { title: "Incidents", value: 24, diff: "+3 this week", icon: AlertTriangle },
  { title: "Changes", value: 12, diff: "+2 this week", icon: RefreshCw },
  { title: "Solutions", value: 31, diff: "+5 this week", icon: Lightbulb },
  { title: "Tags", value: 48, diff: "+7 this week", icon: Tag },
];

const records = [
  { title: "Jenkins container failed due to volume permissions", type: "incident", tags: ["jenkins", "docker", "permissions"], date: "20.05.2026" },
  { title: "Kernel updated on ubuntu-lab-01", type: "change", tags: ["linux", "kernel", "update"], date: "19.05.2026" },
  { title: "Solution: clean Docker disk usage", type: "solution", tags: ["docker", "disk"], date: "18.05.2026" },
  { title: "High CPU load caused by runaway process", type: "incident", tags: ["cpu", "linux"], date: "17.05.2026" },
];

const menu = [
  ["Dashboard", Home],
  ["Incidents", AlertTriangle],
  ["Changes", RefreshCw],
  ["Solutions / Troubleshooting", Lightbulb],
  ["Commands", Terminal],
  ["Postmortems", FileText],
  ["Root Causes", GitBranch],
  ["Useful Links", Link],
  ["Tags", Tag],
];

function App() {
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
          {menu.map(([name, Icon], index) => (
            <div
              key={name}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                index === 0
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              <Icon size={18} />
              {name}
            </div>
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
            <span>Search records...</span>
            <span className="ml-auto rounded-md bg-slate-100 px-2 py-1 text-xs">CTRL + K</span>
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
          <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

          <div className="grid grid-cols-4 gap-6">
            {stats.map(({ title, value, diff, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

          <div className="mt-8 grid grid-cols-[1.5fr_1fr] gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold">Recent Records</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {records.map((record) => (
                  <div key={record.title} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-semibold">{record.title}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
                          {record.type}
                        </span>
                        {record.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{record.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold">Create New Entry</h2>
                  <p className="text-sm text-slate-500">AI classification ready</p>
                </div>
              </div>

              <textarea
                className="h-44 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
                placeholder="Example: Jenkins container failed after restart because of permission denied on volume. Solution: chown -R 1000:1000 ./jenkins_home and restart compose."
              />

              <button className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                Submit & Classify
              </button>

              <p className="mt-4 text-sm text-slate-500">
                AI will detect type, service, category, root cause, solution and tags.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
