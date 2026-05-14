import { supabase } from "../lib/supabase";

export default function TaskCard({ task, refresh }: any) {
  const deleteTask = async () => {
    await supabase.from("tasks").delete().eq("id", task.id);
    refresh();
  };

  const markDone = async () => {
    await supabase
      .from("tasks")
      .update({ status: "Done" })
      .eq("id", task.id);

    refresh();
  };

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h2>{task.title}</h2>
      <p>{task.subject}</p>
      <p>{task.deadline}</p>
      <p>Status: {task.status}</p>

      <button onClick={markDone} className="bg-green-500 p-1 m-1">
        Done
      </button>

      <button onClick={deleteTask} className="bg-red-500 p-1">
        Delete
      </button>
    </div>
  );
}