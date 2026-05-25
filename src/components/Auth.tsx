import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export function Auth({ onUser }: { onUser: (user: any) => void }) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login"|"register">("login");
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) onUser(u);
    });
  }, [onUser]);

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEmail = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span>{user.email}</span>
        <button onClick={() => signOut(auth)} className="text-sm underline">Déconnexion</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-xs mx-auto mt-8 p-4 border rounded bg-white">
      <button onClick={handleGoogle} className="bg-blue-500 text-white rounded px-3 py-2">Connexion Google</button>
      <form onSubmit={handleEmail} className="flex flex-col gap-2">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-2 py-1" required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-2 py-1" required />
        <button type="submit" className="bg-zinc-900 text-white rounded px-3 py-2">{mode === "login" ? "Connexion" : "Créer un compte"}</button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="text-xs underline mt-2">
        {mode === "login" ? "Créer un compte" : "Déjà inscrit ? Connexion"}
      </button>
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </div>
  );
}
