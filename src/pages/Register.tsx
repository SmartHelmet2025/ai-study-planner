import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    await supabase.auth.signUp({ email, password });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 bg-gray-900 rounded-xl w-80">
        <h1 className="text-xl mb-4">Register</h1>

        <input
          className="w-full p-2 mb-2 text-black"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-2 text-black"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-green-500 w-full p-2"
          onClick={register}
        >
          Register
        </button>
      </div>
    </div>
  );
}