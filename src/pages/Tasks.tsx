import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");

  const navigate = useNavigate();

  const addTask = async () => {
    await supabase.from("tasks").insert([
      {
        title,
        subject,
        deadline,
        status: "Pending",
      },
    ]);

    navigate("/dashboard");
  };

  return (
    <div className="p-6">
      <h1>Add Task</h1>

      <input placeholder="Title" onChange={e => setTitle(e.target.value)} />
      <input placeholder="Subject" onChange={e => setSubject(e.target.value)} />
      <input placeholder="Deadline" onChange={e => setDeadline(e.target.value)} />

      <button onClick={addTask} className="bg-blue-500 p-2">
        Save
      </button>
    </div>
  );
}