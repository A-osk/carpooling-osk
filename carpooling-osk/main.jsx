import React, { useState, useEffect } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom/client";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔥 JOUW SUPABASE
const supabaseUrl = "https://gyrcwkwxoyerejhjfwnx.supabase.co";
const supabaseKey = "PLAATS_HIER_JE_PUBLIC_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [inputUser, setInputUser] = useState("");
  const [rides, setRides] = useState([]);
  const [form, setForm] = useState({
    location: "",
    date: "",
    time: "",
    seats: "",
  });

  const locations = [
    "Middelburg Sandberglaan (tankstation)",
    "Middelburg Huisartsenpost Veersepoort",
    "Veere (Poppe, Veerseweg)",
    "OSK Topshuis",
  ];

  // 🔄 realtime ophalen
  useEffect(() => {
    fetchRides();

    const channel = supabase
      .channel("rides")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, fetchRides)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRides = async () => {
    const { data } = await supabase.from("rides").select("*");
    setRides(data || []);
  };

  const login = () => {
    if (!inputUser) return;
    setUser(inputUser);
    localStorage.setItem("user", inputUser);
  };

  const addRide = async () => {
    await supabase.from("rides").insert([
      {
        ...form,
        owner: user,
        reservations: [],
        messages: [],
      },
    ]);
  };

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Carpooling OSK</h1>
        <input placeholder="Naam" value={inputUser} onChange={e => setInputUser(e.target.value)} />
        <button onClick={login}>Start</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Carpooling OSK</h1>

      <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
        <option>Kies locatie</option>
        {locations.map(l => <option key={l}>{l}</option>)}
      </select>

      <input type="date" onChange={e => setForm({ ...form, date: e.target.value })} />
      <input type="time" onChange={e => setForm({ ...form, time: e.target.value })} />
      <input type="number" placeholder="plaatsen" onChange={e => setForm({ ...form, seats: e.target.value })} />

      <button onClick={addRide}>Toevoegen</button>

      <h2>Ritten</h2>
      {rides.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <b>{r.owner}</b>
          <p>{r.location}</p>
          <p>{r.date} {r.time}</p>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);