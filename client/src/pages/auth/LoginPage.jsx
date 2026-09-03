import { useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "../../api.js";
import Field from "../../components/common/Field.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [registerMode, setRegisterMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      const path = registerMode ? "/auth/register" : "/auth/login";
      const loginData = await api(path, {
        method: "POST",
        body: JSON.stringify(form),
      });

      login(loginData);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="auth">
      <form onSubmit={submit}>
        <div className="auth-logo">
          <Sparkles />
        </div>
        <h1>Accessories Flow</h1>
        <p>{registerMode ? "Create store account" : "Sign in to continue"}</p>

        {registerMode && (
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </Field>
        )}

        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
        </Field>

        {error && <div className="error">{error}</div>}

        <button className="primary" type="submit">
          {registerMode ? "Register" : "Login"}
        </button>

        <button
          type="button"
          className="link"
          onClick={() => setRegisterMode(!registerMode)}
        >
          {registerMode ? "Already registered? Login" : "New user? Register"}
        </button>
      </form>
    </div>
  );
}
