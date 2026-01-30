import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [characters, setCharacters] = useState([]);
  const [professions, setProfessions] = useState({});
  const [selectedChar, setSelectedChar] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCode, setNewTemplateCode] = useState("");

  const [status, setStatus] = useState("");

  useEffect(() => {
    loadKey();
    loadProfessions();
  }, []);

  // 🔹 API KEY
  async function loadKey() {
    const snap = await getDoc(doc(db, "users", "personal"));
    if (snap.exists()) setApiKey(snap.data().apiKey);
  }

  async function saveKey() {
    if (!apiKey) return;
    await setDoc(doc(db, "users", "personal"), {
      apiKey,
      createdAt: new Date()
    });
    setStatus("✅ API key guardada");
  }

  // 🔹 GW2 DATA
  async function loadProfessions() {
    const res = await fetch("https://api.guildwars2.com/v2/professions?ids=all");
    const data = await res.json();
    const map = {};
    data.forEach(p => (map[p.id] = p));
    setProfessions(map);
  }

  async function loadCharacters() {
    const res = await fetch(
      `https://api.guildwars2.com/v2/characters?ids=all&access_token=${apiKey}`
    );
    const data = await res.json();
    setCharacters(data);
  }

  // 🔹 FIRESTORE TEMPLATES
async function loadTemplates(characterName) {
  const q = query(
    collection(db, "templates"),
    where("characterName", "==", characterName)
  );

  const snap = await getDocs(q);
  setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}


  async function addTemplate() {
    if (!newTemplateName || !newTemplateCode || !selectedChar) return;

    await addDoc(collection(db, "templates"), {
      characterName: selectedChar.name,
      name: newTemplateName,
      template: newTemplateCode,
      createdAt: new Date()
    });

    setNewTemplateName("");
    setNewTemplateCode("");
    loadTemplates(selectedChar.name);
  }

  async function deleteTemplate(id) {
    await deleteDoc(doc(db, "templates", id));
    loadTemplates(selectedChar.name);
  }

  // 🔹 UI
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>GW2 Templates</h1>

      {/* API KEY */}
      <div style={styles.card}>
        <h3>API Key</h3>
        <input
          type="password"
          placeholder="Introduce tu API key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={styles.input}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={saveKey}>💾 Guardar</button>
          <button onClick={loadCharacters} style={{ marginLeft: 10 }}>
            ⚔️ Cargar personajes
          </button>
        </div>
        <p>{status}</p>
      </div>

      {/* CONTENT */}
      <div style={styles.layout}>
        {/* CHARACTERS */}
        <div style={styles.column}>
          <h3>Personajes</h3>
          {characters.map(char => (
            <div
              key={char.name}
              onClick={() => {
                setSelectedChar(char);
                loadTemplates(char.name);
              }}
              style={{
                ...styles.charRow,
                ...(selectedChar?.name === char.name ? styles.charSelected : {})
              }}
            >
              {professions[char.profession] && (
                <img
                  src={professions[char.profession].icon}
                  alt=""
                  width={26}
                />
              )}
              <div>
                <strong>{char.name}</strong>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {char.profession}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TEMPLATES */}
        <div style={styles.column}>
          {selectedChar ? (
            <>
              <h3>Templates – {selectedChar.name}</h3>

              <input
                placeholder="Nombre de la template (ej: Fractal DPS)"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                style={styles.input}
              />

              <input
                placeholder="[&DQctOhcqSTptAQAAaAEAAIIBAACEAQAAbR0...]"
                value={newTemplateCode}
                onChange={e => setNewTemplateCode(e.target.value)}
                style={{ ...styles.input, marginTop: 8 }}
              />

              <button onClick={addTemplate} style={{ marginTop: 8 }}>
                ➕ Añadir template
              </button>

              <div style={{ marginTop: 20 }}>
                {templates.map(t => (
                  <div key={t.id} style={styles.templateCard}>
                    <div>
                      <strong>{t.name}</strong>
                      <div>
                        <code style={{ wordBreak: "break-all", opacity: 0.8 }}>
                          {t.template}
                        </code>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTemplate(t.id)}
                      style={styles.deleteBtn}
                    >
                      🗑
                    </button>
                  </div>
                ))}

                {templates.length === 0 && (
                  <p style={{ opacity: 0.6 }}>
                    Este personaje no tiene templates aún.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p style={{ opacity: 0.6 }}>
              Selecciona un personaje para ver sus templates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e5e7eb",
    padding: 20,
    fontFamily: "system-ui, sans-serif"
  },
  title: {
    textAlign: "center",
    marginBottom: 20
  },
  card: {
    background: "#020617",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 20
  },
  column: {
    background: "#020617",
    padding: 16,
    borderRadius: 12
  },
  charRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderRadius: 8,
    cursor: "pointer"
  },
  charSelected: {
    background: "#1e293b"
  },
  templateCard: {
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 10
  },
  deleteBtn: {
    background: "#7f1d1d",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    height: 32
  },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #1e293b",
    background: "#020617",
    color: "#e5e7eb"
  }
};

export default App;
