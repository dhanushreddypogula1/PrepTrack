"""
src/predict.py
ML prediction for placement probability + CTC.

Models:
  - XGBoost classifier  → placement_probability (0..1)
  - XGBoost regressor   → predicted_ctc (LPA)

On first import, if no saved models exist, generates synthetic training
data and trains both models. Models are cached to models/ for reuse.
"""
import os
import numpy as np
import pandas as pd
import joblib
from xgboost import XGBClassifier, XGBRegressor
from sklearn.preprocessing import LabelEncoder

# ── Paths ─────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(ROOT, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CLF_PATH = os.path.join(MODELS_DIR, "placement_clf.joblib")
REG_PATH = os.path.join(MODELS_DIR, "ctc_reg.joblib")
ENC_PATH = os.path.join(MODELS_DIR, "branch_encoder.joblib")

# ── Feature schema ────────────────────────────────────────────────────
FEATURES = [
    "branch_enc", "cgpa", "dsa_score", "projects", "internships",
    "certifications", "hackathons", "backlogs", "aptitude_score",
    "communication_score", "resume_score",
]
BRANCHES = ["CSE", "ECE", "IT", "MECH", "CIVIL", "EEE"]


# ── Synthetic data generator ──────────────────────────────────────────
def _generate_training_data(n: int = 5000, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic synthetic placement data based on Indian
    engineering college patterns.
    """
    rng = np.random.default_rng(seed)
    branches = rng.choice(BRANCHES, n, p=[0.35, 0.18, 0.20, 0.12, 0.08, 0.07])
    cgpa = np.clip(rng.normal(7.5, 0.9, n), 5.0, 10.0)
    dsa = np.clip(rng.normal(60, 22, n), 0, 100).astype(int)
    projects = np.clip(rng.poisson(2.5, n), 0, 15)
    internships = np.clip(rng.poisson(0.8, n), 0, 5)
    certs = np.clip(rng.poisson(2.0, n), 0, 10)
    hackathons = np.clip(rng.poisson(1.2, n), 0, 10)
    backlogs = np.clip(rng.poisson(0.4, n), 0, 10)
    apti = np.clip(rng.normal(65, 18, n), 0, 100).astype(int)
    comm = np.clip(rng.normal(62, 17, n), 0, 100).astype(int)
    resume = np.clip(rng.normal(60, 18, n), 0, 100).astype(int)

    # Branch bonus (CSE/IT > ECE > others for software placements)
    branch_bonus = np.where(np.isin(branches, ["CSE", "IT"]), 0.15,
                    np.where(branches == "ECE", 0.05, -0.05))

    # Placement score (latent)
    score = (
        0.20 * (cgpa - 5) / 5
        + 0.20 * dsa / 100
        + 0.10 * np.minimum(projects, 5) / 5
        + 0.10 * np.minimum(internships, 3) / 3
        + 0.05 * np.minimum(certs, 5) / 5
        + 0.05 * np.minimum(hackathons, 5) / 5
        - 0.15 * np.minimum(backlogs, 5) / 5
        + 0.10 * apti / 100
        + 0.08 * comm / 100
        + 0.07 * resume / 100
        + branch_bonus
    )
    score += rng.normal(0, 0.08, n)  # noise

    # Binary placement (threshold around median)
    placed = (score > 0.42).astype(int)

    # CTC (LPA) — realistic Indian range
    ctc = (
        3.0
        + 12.0 * np.clip(score, 0, 1.2)
        + rng.normal(0, 1.2, n)
    )
    ctc = np.where(placed == 1, np.clip(ctc, 3.0, 50.0), 0.0)

    return pd.DataFrame({
        "branch": branches,
        "cgpa": cgpa,
        "dsa_score": dsa,
        "projects": projects,
        "internships": internships,
        "certifications": certs,
        "hackathons": hackathons,
        "backlogs": backlogs,
        "aptitude_score": apti,
        "communication_score": comm,
        "resume_score": resume,
        "placed": placed,
        "ctc": ctc,
    })


# ── Train / Load ──────────────────────────────────────────────────────
def _train_and_save():
    print("🧠 Training placement models on synthetic data (one-time)...")
    df = _generate_training_data(n=5000)

    enc = LabelEncoder()
    enc.fit(BRANCHES)
    df["branch_enc"] = enc.transform(df["branch"])

    X = df[FEATURES].values
    y_clf = df["placed"].values

    clf = XGBClassifier(
        n_estimators=200, max_depth=5, learning_rate=0.1,
        eval_metric="logloss", random_state=42, n_jobs=-1,
    )
    clf.fit(X, y_clf)

    # Regressor only on placed students
    placed_df = df[df["placed"] == 1]
    Xr = placed_df[FEATURES].values
    yr = placed_df["ctc"].values
    reg = XGBRegressor(
        n_estimators=200, max_depth=5, learning_rate=0.1,
        random_state=42, n_jobs=-1,
    )
    reg.fit(Xr, yr)

    joblib.dump(clf, CLF_PATH)
    joblib.dump(reg, REG_PATH)
    joblib.dump(enc, ENC_PATH)
    print(f"✅ Saved models to {MODELS_DIR}")
    return clf, reg, enc


def _load_or_train():
    if os.path.exists(CLF_PATH) and os.path.exists(REG_PATH) and os.path.exists(ENC_PATH):
        return (
            joblib.load(CLF_PATH),
            joblib.load(REG_PATH),
            joblib.load(ENC_PATH),
        )
    return _train_and_save()


_clf, _reg, _enc = _load_or_train()


# ── Public API ────────────────────────────────────────────────────────
def _profile_to_features(profile: dict) -> np.ndarray:
    """Turn a profile dict into the feature vector the models expect."""
    branch = profile.get("branch", "CSE")
    if branch not in BRANCHES:
        branch = "CSE"
    branch_enc = _enc.transform([branch])[0]

    row = [
        branch_enc,
        float(profile.get("cgpa", 7.0)),
        int(profile.get("dsa_score", 50)),
        int(profile.get("projects", 0)),
        int(profile.get("internships", 0)),
        int(profile.get("certifications", 0)),
        int(profile.get("hackathons", 0)),
        int(profile.get("backlogs", 0)),
        int(profile.get("aptitude_score", 50)),
        int(profile.get("communication_score", 50)),
        int(profile.get("resume_score", 50)),
    ]
    return np.array([row], dtype=float)


def predict(profile: dict) -> dict:
    """
    Predict placement probability + CTC for a single profile.
    Returns: {placement_probability, predicted_ctc, feature_importances}
    """
    X = _profile_to_features(profile)
    prob = float(_clf.predict_proba(X)[0, 1])

    if prob >= 0.30:
        ctc = float(_reg.predict(X)[0])
        ctc = max(3.0, min(ctc, 50.0))
    else:
        ctc = 0.0

    # Feature importances (from classifier, descending)
    importances = _clf.feature_importances_
    pretty_names = {
        "branch_enc": "Branch",
        "cgpa": "CGPA",
        "dsa_score": "DSA Score",
        "projects": "Projects",
        "internships": "Internships",
        "certifications": "Certifications",
        "hackathons": "Hackathons",
        "backlogs": "Backlogs",
        "aptitude_score": "Aptitude",
        "communication_score": "Communication",
        "resume_score": "Resume Score",
    }
    pairs = sorted(
        [[pretty_names[f], float(imp)] for f, imp in zip(FEATURES, importances)],
        key=lambda x: x[1], reverse=True,
    )

    return {
        "placement_probability": round(prob, 4),
        "predicted_ctc": round(ctc, 2),
        "feature_importances": pairs,
    }


def get_scenario_predictions(base_profile: dict, scenarios: list[dict]) -> list[dict]:
    """
    Run predict() for each scenario profile.
    Returns a list of {placement_probability, predicted_ctc} dicts.
    """
    results = []
    for s in scenarios:
        r = predict(s)
        results.append({
            "placement_probability": r["placement_probability"],
            "predicted_ctc": r["predicted_ctc"],
        })
    return results


if __name__ == "__main__":
    # Smoke test
    sample = {
        "branch": "CSE", "cgpa": 8.5, "dsa_score": 75,
        "projects": 3, "internships": 1, "certifications": 4,
        "hackathons": 2, "backlogs": 0,
        "aptitude_score": 80, "communication_score": 75, "resume_score": 70,
    }
    print(predict(sample))