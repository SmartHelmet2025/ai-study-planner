import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Plus, Brain, Calendar, User, Settings, LogOut, ListChecks } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [userName, setUserName] = useState("Student");
  const [generatingAI, setGeneratingAI] = useState(false);
  const navigate = useNavigate();

  // Add Task state variables
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [studyHours, setStudyHours] = useState(1);
  const [addingTask, setAddingTask] = useState(false);
  
  // Task filter and management state
  const [taskFilter, setTaskFilter] = useState("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Calendar state variables
const [currentDate, setCurrentDate] = useState(new Date());
const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [selectedTask, setSelectedTask] = useState<any>(null);
const [showDateModal, setShowDateModal] = useState(false);
const [showTaskModal, setShowTaskModal] = useState(false);

// AI Planner state variables
const [dailyAvailableHours, setDailyAvailableHours] = useState(4);
const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
const [activePlanTab, setActivePlanTab] = useState<"plan" | "analytics" | "tips">("plan");
const [studyPlan, setStudyPlan] = useState<any[]>([]);

// Profile state variables
const [showEditProfile, setShowEditProfile] = useState(false);
const [userEmail, setUserEmail] = useState("");
const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editBio, setEditBio] = useState("");

// Settings state variables
const [activeSettingsTab, setActiveSettingsTab] = useState("general");
const [defaultView, setDefaultView] = useState("dashboard");
const [language, setLanguage] = useState("en");
const [timezone, setTimezone] = useState("America/New_York");
const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
const [emailNotifications, setEmailNotifications] = useState(true);
const [dailyReminders, setDailyReminders] = useState(true);
const [deadlineAlerts, setDeadlineAlerts] = useState(true);
const [browserNotifications, setBrowserNotifications] = useState(false);
const [reminderTime, setReminderTime] = useState("09:00");
const [darkMode, setDarkMode] = useState(false);
const [defaultPriority, setDefaultPriority] = useState<"High" | "Medium" | "Low">("Medium");
const [defaultStudyHours, setDefaultStudyHours] = useState(1);
const [autoSave, setAutoSave] = useState(true);
const [showCompleted, setShowCompleted] = useState(true);
const [aiPriority, setAiPriority] = useState("balanced");
const [backupFrequency, setBackupFrequency] = useState("weekly");

  // 🔐 check auth
  const checkUser = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    navigate("/", { replace: true });
  } else {
    const email = data.session.user.email;
    setUserName(email?.split("@")[0] || "Student");
    setUserEmail(email || "student@example.com");
    setEditName(email?.split("@")[0] || "Student");
    setEditEmail(email || "");
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

  // 📊 Compute dashboard metrics
  const pendingTasks = tasks.filter((t) => t.status !== "Done").length;
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const totalSubjects = [...new Set(tasks.map((t) => t.subject).filter(Boolean))].length;
  const totalStudyHours = tasks.reduce((acc, t) => acc + (Number(t.estimated_hours) || 0), 0);
  const pendingTasksList = tasks.filter((t) => t.status !== "Done");
  const uniqueSubjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];
  const completedTasksList = tasks.filter(t => t.status === "Done");

  // Filtered pending tasks based on filter selection
  const getFilteredTasks = () => {
    let filtered = pendingTasksList;
    const today = new Date().toISOString().split("T")[0];
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split("T")[0];

    switch(taskFilter) {
      case "today":
        filtered = filtered.filter(t => t.deadline === today);
        break;
      case "next7":
        filtered = filtered.filter(t => t.deadline && t.deadline >= today && t.deadline <= next7DaysStr);
        break;
      case "priority":
        filtered = [...filtered].sort((a, b) => {
  const priorityOrder: { [key: string]: number } = { High: 3, Medium: 2, Low: 1 };
  return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
});
        break;
      case "subject":
        if (selectedSubjectFilter) {
          filtered = filtered.filter(t => t.subject === selectedSubjectFilter);
        }
        break;
      default:
        break;
    }
    return filtered;
  };


 const handleAddTask = async () => {
  console.log("Button clicked!");
  console.log("Title:", title);
  console.log("Subject:", subject);
  
  if (!title.trim()) {
    alert("Please enter a task title");
    return;
  }

  setAddingTask(true);
  const { data: userData } = await supabase.auth.getSession();
  console.log("User data:", userData);
  
  const userId = userData.session?.user.id;
  console.log("User ID:", userId);
  
  if (!userId) {
    alert("You must be logged in to add a task");
    setAddingTask(false);
    return;
  }

  const taskData = {
    title: title.trim(),
    subject: subject.trim() || "General",
    deadline: deadline || null,
    priority: priority,
    estimated_hours: studyHours,
    status: "Pending",
    user_id: userId,
  };
  console.log("Task data being sent:", taskData);

  const { error } = await supabase.from("tasks").insert([taskData]);

  if (error) {
    console.error("Error adding task:", error);
    alert("Failed to add task: " + error.message);
  } else {
    alert("Task added successfully!");
    setSubject("");
    setTitle("");
    setDeadline("");
    setPriority("Medium");
    setStudyHours(1);
    await fetchTasks();
    setActiveMenu("dashboard");
  }
  setAddingTask(false);
};
  // Cancel add task
  const handleCancelAdd = () => {
    setSubject("");
    setTitle("");
    setDeadline("");
    setPriority("Medium");
    setStudyHours(1);
    setActiveMenu("dashboard");
  };


  // Task management handlers
  const handleCheckToggle = (taskId: string) => {
    const newChecked = new Set(checkedTasks);
    if (newChecked.has(taskId)) {
      newChecked.delete(taskId);
    } else {
      newChecked.add(taskId);
    }
    setCheckedTasks(newChecked);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await supabase.from("tasks").delete().eq("id", taskId);
      fetchTasks();
      setCheckedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleMarkDone = async (taskId: string) => {
    await supabase.from("tasks").update({ status: "Done" }).eq("id", taskId);
    fetchTasks();
    setCheckedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    setExpandedTaskId(null);
  };

  const handleRestoreTask = async (taskId: string) => {
    await supabase.from("tasks").update({ status: "Pending" }).eq("id", taskId);
    fetchTasks();
  };

  const handleDeleteCompleted = async (taskId: string) => {
    if (window.confirm("Delete this completed task permanently?")) {
      await supabase.from("tasks").delete().eq("id", taskId);
      fetchTasks();
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

  const saveEditedTask = async () => {
    if (editingTask) {
      await supabase.from("tasks").update({
        title: editingTask.title,
        subject: editingTask.subject,
        deadline: editingTask.deadline,
        priority: editingTask.priority,
        estimated_hours: editingTask.estimated_hours,
      }).eq("id", editingTask.id);
      fetchTasks();
      closeEditModal();
    }
  };

  // Calendar helper functions
const navigateCalendar = (direction: number) => {
  const newDate = new Date(currentDate);
  newDate.setMonth(newDate.getMonth() + direction);
  setCurrentDate(newDate);
};

const getMonthDays = () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days: Date[] = [];
  
  // Previous month days
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, daysInPrevMonth - i));
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

const getWeekDays = () => {
  const today = new Date(currentDate);
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }
  return weekDays;
};

const getDayHours = () => {
  return Array.from({ length: 24 }, (_, i) => i);
};

const getTasksForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0];
  return tasks.filter(task => task.deadline === dateStr);
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

// AI Planner handlers
const generateStudyPlan = () => {
  const pending = pendingTasksList;
  let filteredTasks = pending;
  
  // Filter by selected subjects if any
  if (selectedSubjects.length > 0) {
    filteredTasks = pending.filter(t => selectedSubjects.includes(t.subject));
  }
  
  // Sort by priority and deadline
  const sortedTasks = [...filteredTasks].sort((a, b) => {
  const priorityOrder: { [key: string]: number } = { High: 3, Medium: 2, Low: 1 };
  const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  if (priorityDiff !== 0) return priorityDiff;
    
    // Then by deadline
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });
  
  // Distribute tasks across days based on available hours
  const plan: any[] = [];
  let currentDay = new Date();
  let hoursUsedToday = 0;
  
  for (const task of sortedTasks) {
    const taskHours = task.estimated_hours || 2;
    
    if (hoursUsedToday + taskHours <= dailyAvailableHours) {
      // Add to current day
      plan.push({
        ...task,
        day: currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        hours: taskHours
      });
      hoursUsedToday += taskHours;
    } else {
      // Move to next day
      currentDay.setDate(currentDay.getDate() + 1);
      hoursUsedToday = taskHours;
      plan.push({
        ...task,
        day: currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        hours: taskHours
      });
    }
  }
  
  setStudyPlan(plan);
};

const handleGenerateAI = async () => {
  setGeneratingAI(true);
  // Simulate AI processing
  setTimeout(() => {
    generateStudyPlan();
    setGeneratingAI(false);
    setActivePlanTab('plan');
  }, 1000);
};

const autoReschedule = () => {
  generateStudyPlan();
};

const exportPlan = (format: string) => {
  if (studyPlan.length === 0) {
    alert("No plan to export. Generate a plan first.");
    return;
  }
  
  if (format === 'csv') {
    const headers = ['Day', 'Subject', 'Title', 'Hours', 'Priority', 'Deadline'];
    const rows = studyPlan.map(item => [
      item.day,
      item.subject,
      item.title,
      item.hours,
      item.priority,
      item.deadline || 'No deadline'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_plan_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    alert("Plan exported successfully!");
  }
};

const syncWithCalendar = () => {
  setActiveMenu("calendar");
  alert("Plan synced with calendar view!");
};

// Profile handlers
const handleUpdateProfile = async () => {
  // Update profile logic here
  // You can update user metadata in Supabase if needed
  setUserName(editName);
  setShowEditProfile(false);
  alert("Profile updated successfully!");
};

// Settings handlers
const exportAllData = () => {
  const data = {
    tasks,
    exportDate: new Date().toISOString(),
    version: "2.0.0"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `studyplanner_backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  alert("Data exported successfully!");
};

const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedData = JSON.parse(e.target?.result as string);
      if (importedData.tasks && Array.isArray(importedData.tasks)) {
        const { data: userData } = await supabase.auth.getSession();
        const userId = userData.session?.user.id;
        
        for (const task of importedData.tasks) {
          await supabase.from("tasks").insert([
            {
              title: task.title,
              subject: task.subject || "General",
              deadline: task.deadline || null,
              priority: task.priority || "Medium",
              estimated_hours: task.estimated_hours || 1,
              status: task.status || "Pending",
              user_id: userId,
            }
          ]);
        }
        await fetchTasks();
        alert(`Imported ${importedData.tasks.length} tasks successfully!`);
      } else {
        alert("Invalid backup file format");
      }
    } catch (error) {
      alert("Error importing data");
    }
  };
  reader.readAsText(file);
};

const clearAllData = async () => {
  if (window.confirm("⚠️ WARNING: This will permanently delete ALL your tasks. This action cannot be undone. Are you sure?")) {
    const { data: userData } = await supabase.auth.getSession();
    const userId = userData.session?.user.id;
    
    const { error } = await supabase.from("tasks").delete().eq("user_id", userId);
    if (!error) {
      await fetchTasks();
      alert("All data has been cleared successfully.");
    } else {
      alert("Error clearing data");
    }
  }
};

const saveAllSettings = () => {
  localStorage.setItem("studyplanner_settings", JSON.stringify({
    defaultView,
    language,
    timezone,
    dateFormat,
    emailNotifications,
    dailyReminders,
    deadlineAlerts,
    browserNotifications,
    reminderTime,
    darkMode,
    defaultPriority,
    defaultStudyHours,
    autoSave,
    showCompleted,
    aiPriority,
    backupFrequency
  }));
  
  // Apply dark mode if enabled
  if (darkMode) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  
  alert("Settings saved successfully!");
};

// Load saved settings on mount
useEffect(() => {
  const savedSettings = localStorage.getItem("studyplanner_settings");
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    setDefaultView(settings.defaultView || "dashboard");
    setLanguage(settings.language || "en");
    setTimezone(settings.timezone || "America/New_York");
    setDateFormat(settings.dateFormat || "MM/DD/YYYY");
    setEmailNotifications(settings.emailNotifications ?? true);
    setDailyReminders(settings.dailyReminders ?? true);
    setDeadlineAlerts(settings.deadlineAlerts ?? true);
    setBrowserNotifications(settings.browserNotifications ?? false);
    setReminderTime(settings.reminderTime || "09:00");
    setDarkMode(settings.darkMode || false);
    setDefaultPriority(settings.defaultPriority || "Medium");
    setDefaultStudyHours(settings.defaultStudyHours || 1);
    setAutoSave(settings.autoSave ?? true);
    setShowCompleted(settings.showCompleted ?? true);
    setAiPriority(settings.aiPriority || "balanced");
    setBackupFrequency(settings.backupFrequency || "weekly");
    
    if (settings.darkMode) {
      document.body.classList.add("dark-mode");
    }
  }
}, []);

  return (

    <div className="dashboard-container">
      {/* ========================= */}
      {/* SIDEBAR */}
      {/* ========================= */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">📚</div>
          <h2>StudyPlanner AI</h2>
        </div>

<nav className="sidebar-nav">
  <button className={`nav-item ${activeMenu === "dashboard" ? "active" : ""}`} onClick={() => setActiveMenu("dashboard")}>
    <span className="nav-icon"><LayoutDashboard size={20} /></span>
    <span>Dashboard</span>
  </button>
  
  <button className={`nav-item ${activeMenu === "tasks" ? "active" : ""}`} onClick={() => setActiveMenu("tasks")}>
    <span className="nav-icon"><ListChecks size={20} /></span>
    <span>My Tasks</span>
  </button>
  
  <button className={`nav-item ${activeMenu === "completed" ? "active" : ""}`} onClick={() => setActiveMenu("completed")}>
    <span className="nav-icon"><CheckSquare size={20} /></span>
    <span>Completed</span>
  </button>
  
  <Link to="/add" className="nav-item">
    <span className="nav-icon"><Plus size={20} /></span>
    <span>Add Task</span>
  </Link>
  
  <button className={`nav-item ${activeMenu === "ai" ? "active" : ""}`} onClick={() => setActiveMenu("ai")}>
    <span className="nav-icon"><Brain size={20} /></span>
    <span>AI Planner</span>
  </button>
  
  <button className={`nav-item ${activeMenu === "calendar" ? "active" : ""}`} onClick={() => setActiveMenu("calendar")}>
    <span className="nav-icon"><Calendar size={20} /></span>
    <span>Calendar</span>
  </button>
  
  <button className={`nav-item ${activeMenu === "profile" ? "active" : ""}`} onClick={() => setActiveMenu("profile")}>
    <span className="nav-icon"><User size={20} /></span>
    <span>Profile</span>
  </button>
  
  <button className={`nav-item ${activeMenu === "settings" ? "active" : ""}`} onClick={() => setActiveMenu("settings")}>
    <span className="nav-icon"><Settings size={20} /></span>
    <span>Settings</span>
  </button>
</nav>

<button onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="logout-btn">
  <span className="nav-icon"><LogOut size={20} /></span>
  <span>Logout</span>
</button>
      </aside>

      {/* ========================= */}
      {/* MAIN */}
      {/* ========================= */}
      <main className="dashboard-main">
        {/* ========================= */}
        {/* DASHBOARD */}
        {/* ========================= */}
        {activeMenu === "dashboard" && (
          <>
            <div className="top-header">
              <div>
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">
                  Here's your study overview for today
                </p>
              </div>
              <div className="user-box">
                <span>Hello, {userName} 👋</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div>
                  <p>Pending Tasks</p>
                  <h2>{pendingTasks}</h2>
                </div>
                <div className="stat-icon purple">📋</div>
              </div>

              <div className="stat-card">
                <div>
                  <p>Completed Tasks</p>
                  <h2>{completedTasks}</h2>
                </div>
                <div className="stat-icon green">✅</div>
              </div>

              <div className="stat-card">
                <div>
                  <p>Subjects</p>
                  <h2>{totalSubjects}</h2>
                </div>
                <div className="stat-icon blue">📚</div>
              </div>

              <div className="stat-card">
                <div>
                  <p>Study Hours</p>
                  <h2>{totalStudyHours}h</h2>
                </div>
                <div className="stat-icon orange">⏰</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Upcoming Deadlines</h3>
                </div>
                {loading ? (
                  <p>Loading tasks...</p>
                ) : pendingTasksList.length === 0 ? (
                  <p>No pending tasks available.</p>
                ) : (
                  pendingTasksList.slice(0, 4).map((task: any) => (
                    <div className="deadline-item" key={task.id}>
                      <div>
                        <h4>{task.title}</h4>
                        <p>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</p>
                      </div>
                      <span className={`deadline-badge ${task.priority?.toLowerCase() || "medium"}`}>
                        {task.priority || "Medium"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="dashboard-card">
                <h3>Tasks Overview</h3>
                <div className="overview-center">
                  <div className="circle-chart">
                    <div className="circle-inner">
                      <h2>{tasks.length}</h2>
                      <p>Total</p>
                    </div>
                  </div>
                  <div className="overview-legend">
                    <div>
                      <span className="dot purple"></span>
                      Pending ({pendingTasks})
                    </div>
                    <div>
                      <span className="dot green"></span>
                      Completed ({completedTasks})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-banner">
              <div>
                <h3>✨ AI Recommendation</h3>
                <p>
                  Study your highest priority tasks first and focus on upcoming deadlines.
                </p>
              </div>
              <button className="primary-btn" onClick={handleGenerateAI} disabled={generatingAI}>
                {generatingAI ? "Generating..." : "View AI Plan"}
              </button>
            </div>
          </>
        )}

        {/* ========================= */}
        {/* ADD TASK */}
        {/* ========================= */}
        {activeMenu === "addtask" && (
          <div className="addtask-page">
            <div className="top-header">
              <div>
                <h1 className="dashboard-title">Add New Task</h1>
                <p className="dashboard-subtitle">
                  Add your study task and stay on track.
                </p>
              </div>
              <div className="user-box">Hello, {userName} 👋</div>
            </div>

            <div className="addtask-card">
              <h3 className="section-title">Task Details</h3>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject (e.g. Mathematics)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="task-row">
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated Time (hrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="task-actions">
                <button className="cancel-btn" onClick={handleCancelAdd}>
                  Cancel
                </button>
                <button className="addtask-btn" onClick={handleAddTask} disabled={addingTask}>
                  {addingTask ? "Adding..." : "+ Add Task"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* MY TASKS (PENDING ONLY) */}
        {/* ========================= */}
        {activeMenu === "tasks" && (
          <div
            className="dashboard-card task-section"
            style={{ width: "100%", maxWidth: "900px" }}
          >
            <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 20px 0" }}>
              My Tasks - Pending
            </h2>

            {/* TASK INBOX & OVERVIEW */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "20px",
                backgroundColor: "#ffffff",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 12px 0" }}>
                TASK INBOX & OVERVIEW
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <div>
                  <span style={{ fontSize: "17px" }}>Total Tasks:</span>
                  <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px" }}>
                    {tasks.length}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "17px" }}>In Progress:</span>
                  <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px" }}>
                    {pendingTasks}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "17px" }}>Overdue:</span>
                  <span
                    style={{
                      fontSize: "17px",
                      fontWeight: "500",
                      color: "#d32f2f",
                      marginLeft: "4px",
                    }}
                  >
                    {
                      pendingTasksList.filter((t) => {
                        const today = new Date().toISOString().split("T")[0];
                        return (
                          t.deadline &&
                          t.deadline < today &&
                          t.status !== "Completed"
                        );
                      }).length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* FILTER BUTTONS */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              {[
                { key: "all", label: "All Tasks" },
                { key: "today", label: "Today" },
                { key: "next7", label: "Next 7 Days" },
                { key: "priority", label: "Priority" },
                { key: "subject", label: "By Subject" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTaskFilter(key)}
                  style={{
                    backgroundColor: taskFilter === key ? "#6a5acd" : "#e5e7eb",
                    color: taskFilter === key ? "white" : "#1f2937",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* SUBJECT DROPDOWN */}
            {taskFilter === "subject" && (
              <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Select subject</option>
                  {uniqueSubjects.map((sub, i) => (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* TASK LIST */}
            <div
              className="task-list"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
              }}
            >
              {getFilteredTasks().length === 0 ? (
                <p style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                  🎉 No pending tasks! Great job!
                </p>
              ) : (
                getFilteredTasks().map((task: any) => {
                  const priorityDotColor =
                    task.priority === "High"
                      ? "#d32f2f"
                      : task.priority === "Medium"
                      ? "#f59e0b"
                      : "#3b82f6";

                  const isChecked = checkedTasks.has(task.id);
                  const isExpanded = expandedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: isExpanded ? "#f9f7ff" : "white",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                      }}
                    >
                      {/* MAIN ROW */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto auto 1fr auto auto",
                          alignItems: "center",
                          gap: "12px",
                          padding: "14px 20px",
                        }}
                        onClick={() =>
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }
                      >
                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckToggle(task.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: "pointer" }}
                        />

                        {/* PRIORITY DOT */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            minWidth: "70px",
                          }}
                        >
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: priorityDotColor,
                              display: "inline-block",
                            }}
                          />
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {task.priority}
                          </span>
                        </div>

                        {/* TASK INFO */}
                        <div>
                          <div style={{ fontSize: "15px", marginBottom: "2px" }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            {task.subject}
                          </div>
                        </div>

                        {/* DEADLINE */}
                        <div style={{ textAlign: "right", fontSize: "14px" }}>
                          {task.deadline ? (
                            <span>Due: {task.deadline}</span>
                          ) : (
                            <span style={{ color: "#6b7280" }}>No deadline</span>
                          )}
                        </div>

                        {/* DELETE — only visible when checkbox is checked */}
                        {isChecked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (task.id) handleDelete(task.id);
                            }}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 10px",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <div style={{ width: "58px" }} />
                        )}
                      </div>

                      {/* EXPANDED ROW — Edit & Complete buttons */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: "0 20px 14px 52px",
                            display: "flex",
                            gap: "10px",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* EDIT BUTTON */}
                          <button
                            style={{
                              backgroundColor: "white",
                              color: "#374151",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              padding: "5px 16px",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                            onClick={() => openEditModal(task)}
                          >
                            ✏️ Edit
                          </button>

                          {/* COMPLETE BUTTON */}
                          <button
                            onClick={() => handleMarkDone(task.id)}
                            style={{
                              backgroundColor: "#1D9E75",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              padding: "5px 16px",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            ✅ Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* COMPLETED TASKS */}
        {/* ========================= */}
        {activeMenu === "completed" && (
          <div
            className="dashboard-card task-section"
            style={{ width: "100%", maxWidth: "900px" }}
          >
            <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 20px 0" }}>
              ✅ Completed Tasks
            </h2>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "20px",
                backgroundColor: "#f0fdf4",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 12px 0", color: "#166534" }}>
                Completed Tasks Summary
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <div>
                  <span style={{ fontSize: "17px" }}>Total Completed:</span>
                  <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px", color: "#166534" }}>
                    {completedTasks}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "17px" }}>Total Study Hours Completed:</span>
                  <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px", color: "#166534" }}>
                    {completedTasksList.reduce((sum, task: any) => 
                      sum + Number(task.study_hours || task.estimated_hours || 0), 0
                    )} hrs
                  </span>
                </div>
              </div>
            </div>

            {/* COMPLETED TASKS LIST */}
            <div
              className="task-list"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
              }}
            >
              {completedTasksList.length === 0 ? (
                <p style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                  🎯 No completed tasks yet. Complete some tasks to see them here!
                </p>
              ) : (
                completedTasksList.map((task: any) => {
                  const priorityDotColor =
                    task.priority === "High"
                      ? "#d32f2f"
                      : task.priority === "Medium"
                      ? "#f59e0b"
                      : "#3b82f6";

                  return (
                    <div
                      key={task.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: "#f9f9f9",
                        padding: "14px 20px",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto auto",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {/* PRIORITY DOT */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            minWidth: "70px",
                          }}
                        >
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: priorityDotColor,
                              display: "inline-block",
                            }}
                          />
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {task.priority}
                          </span>
                        </div>

                        {/* TASK INFO */}
                        <div>
                          <div style={{ fontSize: "15px", marginBottom: "2px", textDecoration: "line-through", color: "#6b7280" }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            {task.subject}
                          </div>
                        </div>

                        {/* DEADLINE */}
                        <div style={{ textAlign: "right", fontSize: "14px", color: "#6b7280" }}>
                          {task.deadline ? (
                            <span>Due: {task.deadline}</span>
                          ) : (
                            <span>No deadline</span>
                          )}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleRestoreTask(task.id)}
                            style={{
                              backgroundColor: "#f59e0b",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 10px",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            🔄 Restore
                          </button>
                          <button
                            onClick={() => handleDeleteCompleted(task.id)}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 10px",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

                {/* ========================= */}
        {/* AI PLANNER */}
        {/* ========================= */}
        {activeMenu === "ai" && (
          <div className="ai-page">
            <div className="top-header">
              <div>
                <h1 className="dashboard-title">🤖 AI Study Planner</h1>
                <p className="dashboard-subtitle">
                  Let AI create the best study plan for you with smart recommendations
                </p>
              </div>
              <div className="action-buttons">
                <button className="export-btn" onClick={() => exportPlan('csv')}>
                  📥 Export Plan
                </button>
                <button className="sync-btn" onClick={syncWithCalendar}>
                  📅 Sync Calendar
                </button>
              </div>
            </div>

            <div className="ai-grid">
              {/* LEFT PANEL - Study Preferences */}
              <div className="ai-card">
                <h3 className="section-title">Study Preferences</h3>
                
                <div className="form-group">
                  <label>Study Strategy</label>
                  <select defaultValue="Balanced (Default)">
                    <option>Balanced (Default)</option>
                    <option>Deadline-Focused</option>
                    <option>Priority-Focused</option>
                    <option>Energy-Peak Optimized</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Available Hours Per Day</label>
                  <select 
                    value={dailyAvailableHours}
                    onChange={(e) => setDailyAvailableHours(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                      <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subjects to Focus (Optional)</label>
                  <div
                    onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: "#fafafa",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>
                      {selectedSubjects.length > 0 ? selectedSubjects.join(", ") : "All Subjects"}
                    </span>
                    <span>▼</span>
                  </div>
                  {subjectDropdownOpen && (
                    <div style={{
                      marginTop: "8px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      background: "white",
                      padding: "8px",
                      maxHeight: "150px",
                      overflowY: "auto"
                    }}>
                      {uniqueSubjects.map(sub => (
                        <label key={sub} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(sub)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubjects([...selectedSubjects, sub]);
                              } else {
                                setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
                              }
                            }}
                          />
                          {sub}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <button className="generate-ai-btn" onClick={handleGenerateAI} disabled={generatingAI}>
                  {generatingAI ? "🤖 Analyzing..." : "✨ Generate Smart Plan"}
                </button>
                
                <button className="reschedule-btn" onClick={autoReschedule}>
                  🔄 Auto-Optimize Plan
                </button>
              </div>

              {/* RIGHT PANEL - Plan Display */}
              <div className="ai-card">
                <div className="plan-tabs">
                  <button 
                    className={`tab ${activePlanTab === 'plan' ? 'active' : ''}`}
                    onClick={() => setActivePlanTab('plan')}
                  >
                    📋 Study Plan
                  </button>
                  <button 
                    className={`tab ${activePlanTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActivePlanTab('analytics')}
                  >
                    📊 Analytics
                  </button>
                  <button 
                    className={`tab ${activePlanTab === 'tips' ? 'active' : ''}`}
                    onClick={() => setActivePlanTab('tips')}
                  >
                    💡 Tips
                  </button>
                </div>
                
                {/* STUDY PLAN TAB */}
                {activePlanTab === 'plan' && (
                  <div className="plan-list">
                    {studyPlan.length === 0 ? (
                      <div className="empty-state">
                        <span className="empty-icon">🎯</span>
                        <p>No plan generated yet</p>
                        <small>Click "Generate Smart Plan" to get started</small>
                      </div>
                    ) : (
                      <>
                        {/* Summary Stats */}
                        <div className="plan-summary">
                          <div className="summary-item">
                            <span>📚 Total Tasks</span>
                            <strong>{studyPlan.length}</strong>
                          </div>
                          <div className="summary-item">
                            <span>⏱ Total Hours</span>
                            <strong>{studyPlan.reduce((sum, i) => sum + i.hours, 0)}h</strong>
                          </div>
                          <div className="summary-item">
                            <span>📅 Days</span>
                            <strong>{new Set(studyPlan.map(i => i.day)).size}</strong>
                          </div>
                        </div>
                        
                        {/* Gantt Chart View */}
                        {studyPlan.length > 0 && (
                          <div className="gantt-chart">
                            <h4>📊 Study Timeline</h4>
                            {studyPlan.slice(0, 5).map((item, idx) => (
                              <div key={idx} className="gantt-item">
                                <div className="gantt-label">{item.day.substring(0, 3)}</div>
                                <div className="gantt-bar-container">
                                  <div 
                                    className={`gantt-bar ${item.priority?.toLowerCase() || 'medium'}`}
                                    style={{ width: `${Math.min(100, (item.hours / 6) * 100)}%` }}
                                    title={`${item.title} - ${item.hours}h`}
                                  >
                                    {item.subject}
                                  </div>
                                </div>
                                <div className="gantt-hours">{item.hours}h</div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Detailed Plan List */}
                        {studyPlan.map((item: any, index: number) => (
                          <div className="plan-day" key={index}>
                            <div className="day-header">
                              <h4>📅 {item.day}</h4>
                              <span className={`priority-badge ${item.priority?.toLowerCase() || 'medium'}`}>
                                {item.priority || 'Medium'}
                              </span>
                            </div>
                            <div className="plan-item">
                              <div className="plan-subject">
                                📘 <strong>{item.subject}</strong>
                              </div>
                              <div className="plan-details">
                                <span>📝 {item.title}</span>
                                <span className="plan-hours">⏱ {item.hours}h</span>
                              </div>
                              <div className="plan-progress">
                                <small>📅 Deadline: {item.deadline || 'No deadline'}</small>
                                <button 
                                  className="quick-complete-btn"
                                  onClick={() => {
                                    const task = tasks.find(t => t.title === item.title && t.subject === item.subject);
                                    if (task?.id) handleMarkDone(task.id);
                                  }}
                                >
                                  ✓ Mark Complete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* ANALYTICS TAB */}
                {activePlanTab === 'analytics' && (
                  <div className="analytics-content">
                    <h4>📊 Study Analytics Dashboard</h4>
                    
                    <div className="stats-row">
                      <div className="stat">
                        <span>📋 Completion Rate</span>
                        <strong>{tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0}%</strong>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div className="stat">
                        <span>⭐ Productivity Score</span>
                        <strong>{Math.floor((completedTasks / Math.max(tasks.length, 1)) * 100)}/100</strong>
                      </div>
                    </div>

                    <div className="stats-row">
                      <div className="stat">
                        <span>⏰ Total Study Hours</span>
                        <strong>{totalStudyHours}h</strong>
                      </div>
                      <div className="stat">
                        <span>✅ Completed Tasks</span>
                        <strong>{completedTasks}</strong>
                      </div>
                    </div>

                    <div className="stats-row">
                      <div className="stat">
                        <span>📚 Pending Tasks</span>
                        <strong>{pendingTasks}</strong>
                      </div>
                      <div className="stat">
                        <span>📅 Subjects</span>
                        <strong>{totalSubjects}</strong>
                      </div>
                    </div>
                    
                    <div className="subject-breakdown">
                      <h5>📚 Subject Distribution</h5>
                      {uniqueSubjects.map(sub => {
                        const subjectTasks = tasks.filter(t => t.subject === sub);
                        const completedSubjectTasks = subjectTasks.filter(t => t.status === "Done").length;
                        const percentage = subjectTasks.length > 0 ? (completedSubjectTasks / subjectTasks.length) * 100 : 0;
                        return (
                          <div key={sub} className="subject-item">
                            <div className="subject-name">
                              <span>{sub}</span>
                              <span className="subject-count">{subjectTasks.length} tasks</span>
                            </div>
                            <div className="subject-progress">
                              <div className="subject-progress-bar" style={{ width: `${percentage}%` }} />
                            </div>
                            <div className="subject-stats">
                              {completedSubjectTasks}/{subjectTasks.length} completed ({percentage.toFixed(0)}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="study-insights">
                      <h5>💡 Key Insights</h5>
                      <ul>
                        <li>🎯 You have <strong>{pendingTasks}</strong> pending tasks</li>
                        <li>✅ <strong>{completedTasks}</strong> tasks completed so far</li>
                        <li>⏰ Total study time: <strong>{totalStudyHours}</strong> hours</li>
                        <li>📊 Average study time per task: <strong>{(totalStudyHours / Math.max(tasks.length, 1)).toFixed(1)}</strong> hours</li>
                        {pendingTasksList.filter(t => {
                          const today = new Date().toISOString().split("T")[0];
                          return t.deadline && t.deadline < today;
                        }).length > 0 && (
                          <li>⚠️ You have <strong>{pendingTasksList.filter(t => {
                            const today = new Date().toISOString().split("T")[0];
                            return t.deadline && t.deadline < today;
                          }).length}</strong> overdue tasks! Focus on them first.</li>
                        )}
                        {studyPlan.length > 0 && (
                          <li>📅 Your study plan covers <strong>{new Set(studyPlan.map(i => i.day)).size}</strong> days</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TIPS TAB */}
                {activePlanTab === 'tips' && (
                  <div className="tips-content">
                    <h4>💡 Productivity Tips for Success</h4>
                    
                    <div className="tip-category">
                      <h5>🎯 Study Strategies</h5>
                      <ul>
                        <li>📚 Use the <strong>Pomodoro Technique</strong>: 25 min study, 5 min break</li>
                        <li>🎯 Apply the <strong>2-Minute Rule</strong>: If a task takes less than 2 minutes, do it immediately</li>
                        <li>⭐ Use <strong>Eisenhower Matrix</strong>: Prioritize tasks by urgency and importance</li>
                        <li>📝 Practice <strong>Active Recall</strong>: Test yourself instead of just re-reading</li>
                        <li>🧠 Use <strong>Spaced Repetition</strong> for better memory retention</li>
                      </ul>
                    </div>

                    <div className="tip-category">
                      <h5>⏰ Time Management</h5>
                      <ul>
                        <li>🌅 Study during your <strong>peak energy hours</strong> (morning or evening)</li>
                        <li>🚫 <strong>Eliminate distractions</strong>: Put your phone away during study sessions</li>
                        <li>📅 <strong>Plan ahead</strong>: Review your tasks the night before</li>
                        <li>💪 Take <strong>regular breaks</strong> to maintain focus and avoid burnout</li>
                        <li>🎯 Set <strong>SMART goals</strong>: Specific, Measurable, Achievable, Relevant, Time-bound</li>
                      </ul>
                    </div>

                    <div className="tip-category">
                      <h5>📚 Task Management</h5>
                      <ul>
                        <li>✂️ <strong>Break large tasks</strong> into smaller, manageable chunks</li>
                        <li>🏆 <strong>Reward yourself</strong> after completing difficult tasks</li>
                        <li>📝 <strong>Review completed tasks</strong> to track your progress</li>
                        <li>🎯 Set <strong>specific, achievable goals</strong> for each study session</li>
                        <li>📊 Use the <strong>80/20 Rule</strong>: 80% of results come from 20% of efforts</li>
                      </ul>
                    </div>

                    <div className="motivation-quote">
                      <p>"The secret of getting ahead is getting started." - Mark Twain</p>
                    </div>
                    
                    <div className="quick-actions">
                      <h5>⚡ Quick Actions</h5>
                      <button onClick={handleGenerateAI} className="quick-tip-btn">
                        🤖 Generate New Plan
                      </button>
                      <button onClick={() => setActiveMenu("tasks")} className="quick-tip-btn">
                        📋 View My Tasks
                      </button>
                      <button onClick={() => setActiveMenu("addtask")} className="quick-tip-btn">
                        ➕ Add New Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

               {/* ========================= */}
        {/* CALENDAR */}
        {/* ========================= */}
        {activeMenu === "calendar" && (
          <div className="calendar-container">
            <div className="calendar-header">
              <div className="calendar-nav">
                <button onClick={() => navigateCalendar(-1)} className="nav-btn">
                  ←
                </button>
                <h2>
                  {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                </h2>
                <button onClick={() => navigateCalendar(1)} className="nav-btn">
                  →
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="today-btn">
                  Today
                </button>
              </div>
              <div className="calendar-view-buttons">
                <button 
                  className={`view-btn ${calendarView === 'month' ? 'active' : ''}`}
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </button>
                <button 
                  className={`view-btn ${calendarView === 'week' ? 'active' : ''}`}
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </button>
                <button 
                  className={`view-btn ${calendarView === 'day' ? 'active' : ''}`}
                  onClick={() => setCalendarView('day')}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Month View */}
            {calendarView === 'month' && (
              <>
                <div className="calendar-weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>
                <div className="calendar-grid">
                  {getMonthDays().map((date, index) => {
                    const dateTasks = getTasksForDate(date);
                    const isToday = isSameDay(date, new Date());
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    
                    return (
                      <div 
                        key={index} 
                        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                        onClick={() => {
                          setSelectedDate(date);
                          setShowDateModal(true);
                        }}
                      >
                        <div className="day-number">{date.getDate()}</div>
                        <div className="day-tasks">
                          {dateTasks.slice(0, 3).map(task => (
                            <div key={task.id} className={`task-badge ${task.priority?.toLowerCase()}`}>
                              {task.title}
                            </div>
                          ))}
                          {dateTasks.length > 3 && (
                            <div className="more-tasks">+{dateTasks.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Week View */}
            {calendarView === 'week' && (
              <div className="week-view">
                <div className="week-header">
                  {getWeekDays().map(day => (
                    <div key={day.toISOString()} className="week-day-header">
                      <div className="week-day-name">
                        {day.toLocaleString('default', { weekday: 'short' })}
                      </div>
                      <div className={`week-day-date ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="week-grid">
                  {getWeekDays().map(day => {
                    const dayTasks = getTasksForDate(day);
                    return (
                      <div key={day.toISOString()} className="week-day-column">
                        <div className="week-day-tasks">
                          {dayTasks.map(task => (
                            <div 
                              key={task.id} 
                              className={`week-task-item ${task.priority?.toLowerCase()}`}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskModal(true);
                              }}
                            >
                              <div className="task-title">{task.title}</div>
                              <div className="task-subject">{task.subject}</div>
                              <div className="task-hours">⏱ {task.estimated_hours || task.studyHours || 1}h</div>
                            </div>
                          ))}
                          {dayTasks.length === 0 && (
                            <div className="no-tasks">No tasks</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day View */}
            {calendarView === 'day' && selectedDate && (
              <div className="day-view">
                <div className="day-view-header">
                  <h3>
                    {selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                </div>
                <div className="day-timeline">
                  {getDayHours().map(hour => {
                    const tasksAtHour = getTasksForDate(selectedDate);
                    
                    return (
                      <div key={hour} className="timeline-hour">
                        <div className="hour-label">{hour}:00</div>
                        <div className="hour-tasks">
                          {tasksAtHour.length > 0 && hour === 9 && tasksAtHour.map(task => (
                            <div key={task.id} className={`day-task-item ${task.priority?.toLowerCase()}`}>
                              <strong>{task.title}</strong> - {task.subject}
                              <span className="task-hours">({task.estimated_hours || task.studyHours || 1}h)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Details Modal */}
            {showTaskModal && selectedTask && (
              <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                <div className="task-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{selectedTask.title}</h3>
                    <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Subject:</strong> {selectedTask.subject}</p>
                    <p><strong>Priority:</strong> 
                      <span className={`priority-badge ${selectedTask.priority?.toLowerCase()}`}>
                        {selectedTask.priority}
                      </span>
                    </p>
                    <p><strong>Deadline:</strong> {selectedTask.deadline || 'No deadline'}</p>
                    <p><strong>Study Hours:</strong> {selectedTask.estimated_hours || selectedTask.studyHours || 1}h</p>
                    <p><strong>Status:</strong> {selectedTask.status}</p>
                  </div>
                  <div className="modal-footer">
                    <button className="edit-btn" onClick={() => {
                      setShowTaskModal(false);
                      openEditModal(selectedTask);
                    }}>
                      Edit Task
                    </button>
                    <button className="close-btn" onClick={() => setShowTaskModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Date Tasks Modal */}
            {showDateModal && selectedDate && (
              <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
                <div className="tasks-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>
                      {selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <button className="modal-close" onClick={() => setShowDateModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    {getTasksForDate(selectedDate).length === 0 ? (
                      <p>No tasks for this day</p>
                    ) : (
                      getTasksForDate(selectedDate).map(task => (
                        <div key={task.id} className="date-task-item">
                          <div className="task-info">
                            <strong>{task.title}</strong>
                            <span className={`priority-dot ${task.priority?.toLowerCase()}`}></span>
                          </div>
                          <div className="task-details">
                            <span>{task.subject}</span>
                            <span>⏱ {task.estimated_hours || task.studyHours || 1}h</span>
                          </div>
                          <button 
                            className="view-task-btn"
                            onClick={() => {
                              setShowDateModal(false);
                              setSelectedTask(task);
                              setShowTaskModal(true);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

                {/* ========================= */}
        {/* PROFILE PAGE - ENHANCED */}
        {/* ========================= */}
        {activeMenu === "profile" && (
          <div className="profile-page">
            <div className="top-header">
              <div>
                <h1 className="dashboard-title">👤 My Profile</h1>
                <p className="dashboard-subtitle">
                  Manage your personal information and study statistics
                </p>
              </div>
              <button className="edit-profile-btn" onClick={() => setShowEditProfile(true)}>
                ✏️ Edit Profile
              </button>
            </div>

            <div className="profile-grid">
              {/* LEFT COLUMN - Profile Card */}
              <div className="profile-card">
                <div className="profile-avatar">
                  <div className="avatar-large">
                    {userName ? userName.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="avatar-status online"></div>
                </div>
                <h3 className="profile-name">{userName}</h3>
                <p className="profile-email">{userEmail || "student@example.com"}</p>
                <p className="profile-join-date">
                  📅 Joined {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </p>
                
                <div className="profile-stats-mini">
                  <div className="mini-stat">
                    <span>📚</span>
                    <div>
                      <strong>{totalSubjects}</strong>
                      <small>Subjects</small>
                    </div>
                  </div>
                  <div className="mini-stat">
                    <span>✅</span>
                    <div>
                      <strong>{completedTasks}</strong>
                      <small>Completed</small>
                    </div>
                  </div>
                  <div className="mini-stat">
                    <span>⏰</span>
                    <div>
                      <strong>{totalStudyHours}</strong>
                      <small>Hours</small>
                    </div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="profile-action-btn" onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                  }}>
                    🚪 Logout
                  </button>
                  <button className="profile-action-btn secondary" onClick={() => setActiveMenu("settings")}>
                    ⚙️ Settings
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN - Statistics & Progress */}
              <div className="profile-stats">
                {/* Achievement Stats */}
                <div className="stats-card">
                  <h4>🏆 Achievements</h4>
                  <div className="achievements-grid">
                    <div className={`achievement-badge ${completedTasks >= 1 ? 'unlocked' : 'locked'}`}>
                      <span>🎯</span>
                      <p>First Task</p>
                      <small>Complete 1 task</small>
                    </div>
                    <div className={`achievement-badge ${completedTasks >= 10 ? 'unlocked' : 'locked'}`}>
                      <span>⭐</span>
                      <p>Rising Star</p>
                      <small>Complete 10 tasks</small>
                    </div>
                    <div className={`achievement-badge ${completedTasks >= 50 ? 'unlocked' : 'locked'}`}>
                      <span>🏅</span>
                      <p>Master</p>
                      <small>Complete 50 tasks</small>
                    </div>
                    <div className={`achievement-badge ${totalStudyHours >= 100 ? 'unlocked' : 'locked'}`}>
                      <span>🔥</span>
                      <p>Study Warrior</p>
                      <small>100 study hours</small>
                    </div>
                  </div>
                </div>

                {/* Study Streak */}
                <div className="stats-card">
                  <h4>📅 Study Streak</h4>
                  <div className="streak-container">
                    <div className="streak-days">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="streak-day">{day}</div>
                      ))}
                    </div>
                    <div className="streak-info">
                      <strong>{Math.floor(Math.random() * 30) + 1} day streak</strong>
                      <p>🔥 Keep going! You're doing great!</p>
                    </div>
                  </div>
                </div>

                {/* Study Progress Charts */}
                <div className="stats-card">
                  <h4>📊 Study Progress</h4>
                  <div className="progress-stats">
                    <div className="progress-item">
                      <div className="progress-label">
                        <span>Task Completion</span>
                        <span>{tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-label">
                        <span>Productivity</span>
                        <span>{Math.floor((completedTasks / Math.max(tasks.length, 1)) * 100)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.floor((completedTasks / Math.max(tasks.length, 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-label">
                        <span>Consistency</span>
                        <span>{Math.min(100, Math.floor((completedTasks / 50) * 100))}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(100, Math.floor((completedTasks / 50) * 100))}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject Performance */}
                <div className="stats-card">
                  <h4>📚 Subject Performance</h4>
                  <div className="subject-performance">
                    {uniqueSubjects.slice(0, 5).map(sub => {
                      const subjectTasks = tasks.filter(t => t.subject === sub);
                      const completedSubject = subjectTasks.filter(t => t.status === "Done").length;
                      const percentage = subjectTasks.length > 0 ? (completedSubject / subjectTasks.length) * 100 : 0;
                      return (
                        <div key={sub} className="subject-perf-item">
                          <div className="subject-perf-name">
                            <span>{sub}</span>
                            <span>{completedSubject}/{subjectTasks.length}</span>
                          </div>
                          <div className="subject-perf-bar">
                            <div className="subject-perf-fill" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="stats-card">
                  <h4>🕐 Recent Activity</h4>
                  <div className="recent-activities">
                    {tasks.filter(t => t.status === "Done").slice(0, 5).map(task => (
                      <div key={task.id} className="activity-item">
                        <div className="activity-icon">✅</div>
                        <div className="activity-details">
                          <p className="activity-title">{task.title}</p>
                          <p className="activity-subject">{task.subject}</p>
                        </div>
                        <div className="activity-time">Completed</div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === "Done").length === 0 && (
                      <div className="no-activity">
                        <p>No completed tasks yet</p>
                        <small>Complete your first task to see activity here!</small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Study Tips */}
                <div className="stats-card tips-card">
                  <h4>💡 Personalized Tips</h4>
                  <div className="tips-list">
                    <div className="tip-item">
                      <span>🎯</span>
                      <p>You have {pendingTasks} pending task{pendingTasks !== 1 ? 's' : ''}. Focus on completing them!</p>
                    </div>
                    {completedTasks > 0 && (
                      <div className="tip-item">
                        <span>⭐</span>
                        <p>Great job! You've completed {completedTasks} task{completedTasks !== 1 ? 's' : ''} so far!</p>
                      </div>
                    )}
                    {totalStudyHours > 0 && (
                      <div className="tip-item">
                        <span>⏰</span>
                        <p>You've studied {totalStudyHours} hour{totalStudyHours !== 1 ? 's' : ''}. Keep the momentum!</p>
                      </div>
                    )}
                    <div className="tip-item">
                      <span>💪</span>
                      <p>Try the Pomodoro technique: 25 min study, 5 min break</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Edit Profile Modal */}
            {showEditProfile && (
              <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
                <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>✏️ Edit Profile</h3>
                    <button className="modal-close" onClick={() => setShowEditProfile(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={editEmail} disabled />
                      <small>Email cannot be changed</small>
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea 
                        rows={3} 
                        value={editBio} 
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setShowEditProfile(false)}>Cancel</button>
                    <button className="save-btn" onClick={handleUpdateProfile}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

               {/* ========================= */}
        {/* SETTINGS PAGE - ENHANCED */}
        {/* ========================= */}
        {activeMenu === "settings" && (
          <div className="settings-page">
            <div className="top-header">
              <div>
                <h1 className="dashboard-title">⚙ Settings</h1>
                <p className="dashboard-subtitle">
                  Customize your study planner experience
                </p>
              </div>
            </div>

            <div className="settings-grid">
              {/* LEFT COLUMN - Settings Categories */}
              <div className="settings-sidebar">
                <div className="settings-nav">
                  <button 
                    className={`settings-nav-btn ${activeSettingsTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('general')}
                  >
                    <span>🎨</span> General
                  </button>
                  <button 
                    className={`settings-nav-btn ${activeSettingsTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('notifications')}
                  >
                    <span>🔔</span> Notifications
                  </button>
                  <button 
                    className={`settings-nav-btn ${activeSettingsTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('appearance')}
                  >
                    <span>🎨</span> Appearance
                  </button>
                  <button 
                    className={`settings-nav-btn ${activeSettingsTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('preferences')}
                  >
                    <span>⚡</span> Preferences
                  </button>
                  <button 
                    className={`settings-nav-btn ${activeSettingsTab === 'backup' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('backup')}
                  >
                    <span>💾</span> Backup & Data
                  </button>
                  <button 
                    className={`settings-nav-btn ${activeSettingsTab === 'about' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('about')}
                  >
                    <span>ℹ️</span> About
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN - Settings Content */}
              <div className="settings-content">
                
                {/* GENERAL SETTINGS */}
                {activeSettingsTab === 'general' && (
                  <div className="settings-section">
                    <h3>General Settings</h3>
                    <div className="settings-group">
                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Default Dashboard View</h4>
                          <p>Choose which page to show when you log in</p>
                        </div>
                        <select 
                          value={defaultView}
                          onChange={(e) => setDefaultView(e.target.value)}
                          className="setting-select"
                        >
                          <option value="dashboard">Dashboard</option>
                          <option value="tasks">My Tasks</option>
                          <option value="calendar">Calendar</option>
                          <option value="ai">AI Planner</option>
                        </select>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Language</h4>
                          <p>Select your preferred language</p>
                        </div>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="setting-select"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                        </select>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Time Zone</h4>
                          <p>Your local time zone for deadlines</p>
                        </div>
                        <select 
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="setting-select"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                          <option value="Europe/Paris">Central European Time (CET)</option>
                          <option value="Asia/Tokyo">Japan Time (JST)</option>
                          <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                        </select>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Date Format</h4>
                          <p>How dates should be displayed</p>
                        </div>
                        <select 
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value)}
                          className="setting-select"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFICATION SETTINGS */}
                {activeSettingsTab === 'notifications' && (
                  <div className="settings-section">
                    <h3>Notification Settings</h3>
                    <div className="settings-group">
                      <div className="setting-item toggle-item">
                        <div className="setting-info">
                          <h4>Email Notifications</h4>
                          <p>Receive email updates about your tasks</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item toggle-item">
                        <div className="setting-info">
                          <h4>Daily Reminders</h4>
                          <p>Get daily reminders about pending tasks</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={dailyReminders}
                            onChange={(e) => setDailyReminders(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item toggle-item">
                        <div className="setting-info">
                          <h4>Task Deadline Alerts</h4>
                          <p>Receive alerts when deadlines are approaching</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={deadlineAlerts}
                            onChange={(e) => setDeadlineAlerts(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item toggle-item">
                        <div className="setting-info">
                          <h4>Browser Notifications</h4>
                          <p>Show notifications in your browser</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={browserNotifications}
                            onChange={(e) => setBrowserNotifications(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Reminder Time</h4>
                          <p>When to send daily reminders</p>
                        </div>
                        <input 
                          type="time" 
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="setting-time"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* APPEARANCE SETTINGS */}
                {activeSettingsTab === 'appearance' && (
                  <div className="settings-section">
                    <h3>Appearance Settings</h3>
                    <div className="settings-group">
                      <div className="setting-item toggle-item">
                        <div className="setting-info">
                          <h4>Dark Mode</h4>
                          <p>Switch between light and dark theme</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={darkMode}
                            onChange={(e) => setDarkMode(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREFERENCES SETTINGS */}
                {activeSettingsTab === 'preferences' && (
                  <div className="settings-section">
                    <h3>Study Preferences</h3>
                    <div className="settings-group">
                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Default Priority</h4>
                          <p>Default priority for new tasks</p>
                        </div>
                        <select 
                          value={defaultPriority}
                          onChange={(e) => setDefaultPriority(e.target.value as any)}
                          className="setting-select"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Default Study Hours</h4>
                          <p>Default estimated hours for new tasks</p>
                        </div>
                        <input 
                          type="number" 
                          min="0.5" 
                          step="0.5"
                          value={defaultStudyHours}
                          onChange={(e) => setDefaultStudyHours(Number(e.target.value))}
                          className="setting-number"
                        />
                      </div>

                      <div className="setting-item toggle-item">
                        <div className="setting-info">
                          <h4>Auto-save Tasks</h4>
                          <p>Automatically save tasks as you create them</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={autoSave}
                            onChange={(e) => setAutoSave(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item toggle-item">
                        <div className="setting-info">
                          <h4>Show Completed Tasks</h4>
                          <p>Display completed tasks in main view</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={showCompleted}
                            onChange={(e) => setShowCompleted(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>AI Recommendation Priority</h4>
                          <p>How the AI should prioritize tasks</p>
                        </div>
                        <select 
                          value={aiPriority}
                          onChange={(e) => setAiPriority(e.target.value)}
                          className="setting-select"
                        >
                          <option value="deadline">Deadline-focused</option>
                          <option value="priority">Priority-focused</option>
                          <option value="balanced">Balanced</option>
                          <option value="studyTime">Study time optimized</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* BACKUP & DATA SETTINGS */}
                {activeSettingsTab === 'backup' && (
                  <div className="settings-section">
                    <h3>Backup & Data</h3>
                    <div className="settings-group">
                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Export All Data</h4>
                          <p>Download all your tasks and study data</p>
                        </div>
                        <button className="action-btn export-data-btn" onClick={exportAllData}>
                          📥 Export Data (JSON)
                        </button>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Import Data</h4>
                          <p>Import tasks from a backup file</p>
                        </div>
                        <input 
                          type="file" 
                          accept=".json"
                          onChange={importData}
                          className="file-input"
                        />
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Auto-backup Frequency</h4>
                          <p>How often to automatically backup your data</p>
                        </div>
                        <select 
                          value={backupFrequency}
                          onChange={(e) => setBackupFrequency(e.target.value)}
                          className="setting-select"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="never">Never</option>
                        </select>
                      </div>

                      <div className="setting-item">
                        <div className="setting-info">
                          <h4>Clear All Data</h4>
                          <p>Permanently delete all your tasks (cannot be undone)</p>
                        </div>
                        <button className="action-btn danger-btn" onClick={clearAllData}>
                          🗑️ Clear All Data
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ABOUT SETTINGS */}
                {activeSettingsTab === 'about' && (
                  <div className="settings-section">
                    <h3>About StudyPlanner AI</h3>
                    <div className="settings-group about-group">
                      <div className="about-header">
                        <div className="app-icon">📚</div>
                        <h2>StudyPlanner AI</h2>
                        <p className="version">Version 2.0.0</p>
                      </div>

                      <div className="about-info">
                        <div className="info-item">
                          <span>📅</span>
                          <div>
                            <strong>Release Date</strong>
                            <p>January 2025</p>
                          </div>
                        </div>
                        <div className="info-item">
                          <span>👨‍💻</span>
                          <div>
                            <strong>Developer</strong>
                            <p>StudyPlanner Team</p>
                          </div>
                        </div>
                        <div className="info-item">
                          <span>🌐</span>
                          <div>
                            <strong>Website</strong>
                            <p>www.studyplanner.ai</p>
                          </div>
                        </div>
                        <div className="info-item">
                          <span>📧</span>
                          <div>
                            <strong>Support</strong>
                            <p>support@studyplanner.ai</p>
                          </div>
                        </div>
                      </div>

                      <div className="stats-summary">
                        <h4>Your Stats</h4>
                        <div className="stats-grid">
                          <div className="stat-item">
                            <span>📋</span>
                            <strong>{tasks.length}</strong>
                            <p>Total Tasks</p>
                          </div>
                          <div className="stat-item">
                            <span>✅</span>
                            <strong>{completedTasks}</strong>
                            <p>Completed</p>
                          </div>
                          <div className="stat-item">
                            <span>⏰</span>
                            <strong>{totalStudyHours}</strong>
                            <p>Study Hours</p>
                          </div>
                          <div className="stat-item">
                            <span>📚</span>
                            <strong>{totalSubjects}</strong>
                            <p>Subjects</p>
                          </div>
                        </div>
                      </div>

                      <div className="about-buttons">
                        <button className="about-btn" onClick={() => window.open('#', '_blank')}>
                          📖 Documentation
                        </button>
                        <button className="about-btn" onClick={() => window.open('#', '_blank')}>
                          💬 Community
                        </button>
                        <button className="about-btn" onClick={() => window.open('#', '_blank')}>
                          ⭐ Rate Us
                        </button>
                      </div>

                      <div className="copyright">
                        <p>© 2025 StudyPlanner AI. All rights reserved.</p>
                        <p>Made with ❤️ for students worldwide</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="settings-save-bar">
                  <button className="save-settings-btn" onClick={saveAllSettings}>
                    💾 Save All Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT TASK MODAL */}
        {showEditModal && editingTask && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Task</h3>
              
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                placeholder="Task Title"
              />
              
              <input
                type="text"
                value={editingTask.subject || ""}
                onChange={(e) => setEditingTask({...editingTask, subject: e.target.value})}
                placeholder="Subject"
              />
              
              <input
                type="date"
                value={editingTask.deadline || ""}
                onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})}
              />
              
              <select
                value={editingTask.priority || "Medium"}
                onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              
              <input
                type="number"
                value={editingTask.estimated_hours || 1}
                onChange={(e) => setEditingTask({...editingTask, estimated_hours: Number(e.target.value)})}
                placeholder="Estimated Hours"
              />
              
              <div className="modal-buttons">
                <button onClick={saveEditedTask}>Save</button>
                <button onClick={closeEditModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}