import React, { useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

export default function Abc() {
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formEnabled, setFormEnabled] = useState(false);
  const [editedList, setEditedList] = useState([
    {
      cin: "",
      nom: "",
      prenoms: "",
      date_naissance: "",
      lieu_naissance: "",
      domicile: "",
      arrondissement: "",
      profession: "",
      pere: "",
      mere: "",
      lieu_delivrance: "",
      date_delivrance: "",
    },
  ]);

  const fieldLabels = {
    cin: "LAHARANA / N°:",
    nom: "ANARANA / Nom:",
    prenoms: "FANAMPIN'ANARANA / Prénoms:",
    date_naissance: "TERAKA TAMIN'NY / Né(e) le:",
    lieu_naissance: "TAO / à:",
    domicile: "FONENANA / Domicile:",
    arrondissement: "BORIBORITANY / Arrondissement:",
    profession: "ASA ATAO / Profession:",
    pere: "RAY NITERAKA / Père:",
    mere: "RENY NITERAKA / Mère:",
    lieu_delivrance: "NATAO TAO / Fait à:",
    date_delivrance: "TAMIN'NY / Le:",
  };

  const handleFileChange = (e) => {
    setFichier(e.target.files[0]);
    setError(null);
    setSuccess(false);
    setFormEnabled(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fichier) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("fichier", fichier);

      const res = await fetch("https://n8n.ksyni.net/webhook/envoi", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      if (!res.ok) {
        setError("Erreur lors de l'envoi du fichier.");
        setLoading(false);
        return;
      }

      const result = JSON.parse(text);
      const list = Array.isArray(result)
        ? result.map((item) => item.json || item)
        : [result.json || result];

      setEditedList(list.map((item) => ({ ...item })));
      setFormEnabled(true); // formulaire maintenant modifiable
    } catch (err) {
      setError("Erreur réseau : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index, key) => {
    if (!formEnabled) return;
    const newList = [...editedList];
    newList[index][key] = e.target.value;
    setEditedList(newList);
  };

  const handleSave = async () => {
    if (!formEnabled) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      for (const item of editedList) {
        const { data, error: checkError } = await supabase
          .from("correction")
          .select("cin")
          .eq("cin", item.cin);

        if (checkError) throw checkError;

        if (data && data.length > 0) {
          setError(
            "Ce numéro CIN semble déjà exister. Veuillez le vérifier avant de continuer."
          );
          setSaving(false);
          return;
        }

        const { error } = await supabase.from("correction").insert(item);
        if (error) throw error;
      }

      setSuccess(true);
      setFormEnabled(false);
    } catch (err) {
      setError("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = () => {
    setSuccess(false);
    setError(null);
    setEditedList([
      {
        cin: "",
        nom: "",
        prenoms: "",
        date_naissance: "",
        lieu_naissance: "",
        domicile: "",
        arrondissement: "",
        profession: "",
        pere: "",
        mere: "",
        lieu_delivrance: "",
        date_delivrance: "",
      },
    ]);
    setFormEnabled(false);
    setFichier(null);
  };

  return (
    <div className="main-box fade-in">
      <h1 className="title"> Soumission du CIN</h1>

      {success ? (
        <div className="success-block">
          <div className="big-check">✓</div>
          <div className="big-text">Succès</div>
          <button className="return-btn" onClick={handleReturn}>
            Retour
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="upload">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="input"
            />
            <button type="submit" disabled={loading} className="button">
              {loading ? "En cours..." : "Extraire"}
            </button>
          </form>

          {/* Drapeau uniquement pendant envoi ou sauvegarde */}
          {(loading || saving) && (
            <div className="progress-bar">
              <div className="progress-flag moving-flag"></div>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <h2 className="subtitle">Informations extraites</h2>
          {editedList.map((item, index) => (
            <div key={index} className="card">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="row">
                  <label>{fieldLabels[key] || key}</label>
                  <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => handleChange(e, index, key)}
                    disabled={!formEnabled}
                    onFocus={() => {
                      if (!formEnabled)
                        setError("Veuillez d’abord soumettre votre CIN.");
                    }}
                  />
                </div>
              ))}
            </div>
          ))}

          {formEnabled && (
            <button className="button save" onClick={handleSave}>
              Envoyer
            </button>
          )}
        </>
      )}
    </div>
  );
}
