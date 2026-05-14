import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const addTask = async () => {
  if (!title.trim()) {
    alert("Please enter a task title");
    return;
  }

  setLoading(true);

  try {
    // Get current user
    const { data: userData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      alert("Please login again");
      navigate("/");
      return;
    }
    
    const userId = userData.session?.user.id;
    
    if (!userId) {
      alert("You must be logged in to add a task");
      navigate("/");
      return;
    }

    // Insert task WITH user_id (THIS IS THE FIX)
    const taskData = {
      title: title.trim(),
      subject: subject.trim() || "General",
      deadline: deadline || null,
      priority: priority,
      estimated_hours: estimatedHours,
      status: "Pending",
      user_id: userId,  // ← ADD THIS LINE
    };
    
    console.log("Sending task data:", taskData);

    const { data, error } = await supabase
      .from("tasks")
      .insert([taskData])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      alert(`Error: ${error.message}`);
    } else {
      console.log("Success:", data);
      alert("Task added successfully!");
      navigate("/dashboard");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Add New Task</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input 
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input 
                type="text"
                placeholder="Enter subject (e.g. Mathematics)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time (hours)
              </label>
              <input 
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={addTask} 
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Adding..." : "+ Add Task"}
              </button>
              <button 
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}