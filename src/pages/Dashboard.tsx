import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔐 check auth
  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      navigate("/", { replace: true });
    }
  };

  // 📦 fetch tasks
  const fetchTasks = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setTasks(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkUser();
    fetchTasks();
  }, []);

  // 🧠 SIMPLE AI SUGGESTION (earliest deadline first)
  const aiSuggestion =
    tasks.length > 0
      ? tasks.reduce((prev, curr) =>
          new Date(prev.deadline) < new Date(curr.deadline) ? prev : curr
        )
      : null;

  // 🗑 delete task
  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  // ✅ mark done
  const markDone = async (id: string) => {
    await supabase
      .from("tasks")
      .update({ status: "Done" })
      .eq("id", id);

    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>

        <div className="flex gap-3">
          <Link
            to="/add"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Add Task
          </Link>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* AI SUGGESTION */}
      {aiSuggestion && (
        <div className="bg-white p-4 rounded shadow mb-6">
          🧠 <b>AI Suggestion:</b> Focus on{" "}
          <span className="text-blue-600 font-semibold">
            {aiSuggestion.title}
          </span>{" "}
          first (closest deadline)
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Add your first task.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded shadow"
            >
              <h2 className="text-xl font-bold">{task.title}</h2>
              <p className="text-gray-600">{task.subject}</p>
              <p className="text-sm">Deadline: {task.deadline}</p>

              <p className="mt-2">
                Status:{" "}
                <span
                  className={
                    task.status === "Done"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {task.status}
                </span>
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => markDone(task.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Done
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-gray-800 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}