import React, {
  useEffect,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";

type Role = "owner" | "manager";

type Account = {
  username: string;
  password: string;
  role: Role;
  address?: string;
};

const DEFAULT_ACCOUNTS: Account[] = [
  { username: "owner", password: "EcoTwin@2026", role: "owner" },
  { username: "manager", password: "Manager@2026", role: "manager" },
];

const STORAGE_KEY = "ecotwin-demo-accounts";

export default function EcoTwinAccess({
  children,
}: {
  children: ReactNode;
}) {
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<Account | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showSignup, setShowSignup] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("manager");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setAccounts(JSON.parse(saved) as Account[]);
      } else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_ACCOUNTS),
        );
      }
    } catch {
      setAccounts(DEFAULT_ACCOUNTS);
    }

    setLoaded(true);
  }, []);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const found = accounts.find(
      (account) =>
        account.username.toLowerCase() ===
          username.trim().toLowerCase() &&
        account.password === password,
    );

    if (!found) {
      setError("Invalid user ID or password.");
      return;
    }

    localStorage.setItem("ecotwin-logged-in-user", JSON.stringify(found));
setUser(found);
setPassword("");
  }

  function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!user || !["owner", "manager"].includes(user.role)) {
      setMessage(
        "Only the owner or an authorized manager can create accounts.",
      );
      return;
    }

    if (newUsername.trim().length < 3 || newPassword.length < 6) {
      setMessage(
        "Use a user ID with 3+ characters and password with 6+ characters.",
      );
      return;
    }

    if (!address.trim()) {
      setMessage("Please enter the registered address.");
      return;
    }

    if (
      accounts.some(
        (account) =>
          account.username.toLowerCase() ===
          newUsername.trim().toLowerCase(),
      )
    ) {
      setMessage("That user ID already exists.");
      return;
    }

    const newAccount: Account = {
      username: newUsername.trim(),
      password: newPassword,
      role: newRole,
      address: address.trim(),
    };

    const updated = [...accounts, newAccount];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setAccounts(updated);
      setNewUsername("");
      setNewPassword("");
      setNewRole("manager");
      setAddress("");
      setMessage("Account created successfully.");
    } catch {
      setMessage("Unable to save the account. Please try again.");
    }
  }

  function logout() {
    setUser(null);
    setUsername("");
    setPassword("");
    setAddress("");
    setShowSignup(false);
    setError("");
    setMessage("");
    localStorage.removeItem("ecotwin-logged-in-user");
  }

  return (
    <div className="ecotwin-root">
      <style>{`
        @keyframes ecoFadeIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ecoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes ecoGlow {
          0%, 100% { box-shadow: 0 0 20px #22c55e22; }
          50% { box-shadow: 0 0 40px #22c55e55; }
        }

        .eco-login-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          background: rgba(3, 14, 12, .58);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .eco-login-card {
          width: 100%;
          max-width: 430px;
          box-sizing: border-box;
          padding: 32px;
          border-radius: 24px;
          color: #f0fdf4;
          background: rgba(10, 25, 22, .96);
          border: 1px solid rgba(134, 239, 172, .28);
          animation: ecoFadeIn .6s ease both,
            ecoGlow 4s ease-in-out infinite;
        }

        .eco-input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          margin-top: 7px;
          color: white;
          background: #142923;
          border: 1px solid #315348;
          border-radius: 10px;
          outline: none;
          font-size: 15px;
        }

        .eco-input:focus {
          border-color: #4ade80;
        }

        .eco-btn {
          border: 0;
          border-radius: 10px;
          padding: 13px 16px;
          background: #22c55e;
          color: #052e16;
          font-weight: 800;
          cursor: pointer;
        }

        .eco-secondary {
          border: 1px solid #426658;
          border-radius: 10px;
          padding: 10px 13px;
          background: #142923;
          color: #dcfce7;
          cursor: pointer;
        }

        .eco-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 18px;
          background: #0b1c17;
          color: #dcfce7;
          border-bottom: 1px solid #244c3c;
        }

        .eco-error {
          color: #fca5a5;
          font-size: 13px;
          margin-top: 12px;
        }

        .eco-success {
          color: #86efac;
          font-size: 13px;
          margin-top: 12px;
        }

        .eco-field {
          display: block;
          margin-top: 16px;
          color: #bbf7d0;
          font-size: 13px;
        }

        .eco-brand-icon {
          animation: ecoFloat 3s ease-in-out infinite;
        }
      `}</style>

      {!loaded ? (
        <div style={{ minHeight: "100vh", background: "#071713" }} />
      ) : !user ? (
        <div className="eco-login-backdrop">
          <section className="eco-login-card">
            <div
              className="eco-brand-icon"
              style={{ fontSize: 48, textAlign: "center" }}
            >
              ♻️
            </div>

            <p
              style={{
                textAlign: "center",
                color: "#86efac",
                letterSpacing: 3,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              SMART WASTE • SMARTER FUTURE
            </p>

            <h1
              style={{
                textAlign: "center",
                fontSize: 31,
                margin: "8px 0",
                color: "#f0fdf4",
              }}
            >
              Welcome to EcoTwin AI
            </h1>

            <p
              style={{
                textAlign: "center",
                color: "#a7c5b6",
                fontSize: 14,
              }}
            >
              Manager and owner access portal
            </p>

            <form onSubmit={login}>
              <label className="eco-field">
                User ID
                <input
                  className="eco-input"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your user ID"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="eco-field">
                Password
                <input
                  className="eco-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              {error && <p className="eco-error">{error}</p>}

              <button
                className="eco-btn"
                type="submit"
                style={{ width: "100%", marginTop: 22 }}
              >
                Login to Dashboard →
              </button>
            </form>

            <div
              style={{
                marginTop: 20,
                padding: 12,
                borderRadius: 10,
                background: "#10251e",
                color: "#b8d8c8",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#86efac" }}>
                Hackathon demo accounts
              </strong>
              <br />
              Owner: <code>owner</code> / <code>EcoTwin@2026</code>
              <br />
              Manager: <code>manager</code> / <code>Manager@2026</code>
            </div>
          </section>
        </div>
      ) : (
        <>
          <header className="eco-header">
            <div>
              <strong>♻️ EcoTwin AI</strong>
              <span
                style={{
                  marginLeft: 10,
                  color: "#9bbdad",
                  fontSize: 12,
                }}
              >
                {user.role.toUpperCase()} · {user.username}
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="eco-secondary"
                onClick={() => {
                  setShowSignup(!showSignup);
                  setMessage("");
                  setAddress("");
                }}
              >
                + Create Account
              </button>

              <button className="eco-secondary" onClick={logout}>
                Logout
              </button>
            </div>
          </header>

          {showSignup && (
            <div
              style={{
                padding: 18,
                background: "#10251e",
                color: "white",
              }}
            >
              <form
                onSubmit={createAccount}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "end",
                  flexWrap: "wrap",
                }}
              >
                <label className="eco-field" style={{ marginTop: 0 }}>
                  New user ID
                  <input
                    className="eco-input"
                    value={newUsername}
                    onChange={(event) =>
                      setNewUsername(event.target.value)
                    }
                    placeholder="Enter new user ID"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="eco-field" style={{ marginTop: 0 }}>
                  Temporary password
                  <input
                    className="eco-input"
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <label className="eco-field" style={{ marginTop: 0 }}>
                  Registered Address
                  <textarea
                    className="eco-input"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="House number, street, area and city"
                    autoComplete="street-address"
                    rows={3}
                    required
                  />
                </label>

                <label className="eco-field" style={{ marginTop: 0 }}>
                  Role
                  <select
                    className="eco-input"
                    value={newRole}
                    onChange={(event) =>
                      setNewRole(event.target.value as Role)
                    }
                  >
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </label>

                <button className="eco-btn" type="submit">
                  Create Account
                </button>
              </form>

              {message && (
                <p
                  className={
                    message.startsWith("Account created")
                      ? "eco-success"
                      : "eco-error"
                  }
                >
                  {message}
                </p>
              )}
            </div>
          )}

          <div style={{ animation: "ecoFadeIn .8s ease both" }}>
  {children &&
    React.cloneElement(
      children as React.ReactElement<any>,
      { registeredAddress: user.address ?? "" }
    )}
</div>
        </>
      )}
    </div>
  );
}