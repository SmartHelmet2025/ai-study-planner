import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TaskCard from "../components/TaskCard";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*");
    setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const pending = tasks.filter(t => t.status === "Pending").length;
  const done = tasks.filter(t => t.status === "Done").length;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Dashboard</h1>

      <div className="flex gap-4 mb-4">
        <div>Pending: {pending}</div>
        <div>Done: {done}</div>
      </div>

      <Link to="/add" className="bg-blue-500 p-2">
        Add Task
      </Link>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} refresh={fetchTasks} />
        ))}
      </div>
    </div>
  );
}