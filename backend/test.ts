async function test() {
  console.log("Registering user...");
  const regRes = await fetch("http://localhost:3001/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testuser", email: "test@example.com", password: "password" })
  });
  
  const regData = await regRes.json();
  console.log("Register Response:", regRes.status, regData);
  
  if (regRes.status !== 200 && regRes.status !== 400) {
      console.error("Failed to register");
      return;
  }
  
  console.log("Logging in...");
  const loginRes = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password" })
  });
  const loginData = await loginRes.json();
  console.log("Login Response:", loginRes.status, loginData);
  
  const token = loginData.token;
  
  console.log("Saving session...");
  const sessionRes = await fetch("http://localhost:3001/api/sessions", {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ duration: 60, sessionType: "focus" }) // 60 seconds
  });
  const sessionData = await sessionRes.json();
  console.log("Session Response:", sessionRes.status, JSON.stringify(sessionData));
  
  console.log("Fetching /api/me");
  const meRes = await fetch("http://localhost:3001/api/me", {
      headers: { "Authorization": `Bearer ${token}` }
  });
  console.log("Me Response:", await meRes.json());
}

test();
