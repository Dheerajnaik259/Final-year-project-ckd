"""
CKD Readmission Prediction - Hybrid RF + XGBoost Weighted Voting Model
========================================================================
Dataset  : ckd_clinical_data.csv (actual clinical data)
Target   : readmission (0 = No, 1 = Yes)
Model    : Weighted Soft Voting - Random Forest (50%) + XGBoost (50%)
Extras   : SHAP explainability, SMOTE balancing, cross-validation
Output   : ckd_hybrid_model.pkl, scaler.pkl, feature_names.json
"""

import numpy as np
import pandas as pd
import json
import os
import sys
import logging
from pathlib import Path
import warnings
warnings.filterwarnings("ignore")

from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import shap

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# 1. LOAD DATASET
# ─────────────────────────────────────────────

def load_ckd_dataset(csv_path: str = "ckd_clinical_data.csv") -> pd.DataFrame:
    """
    Load CKD clinical data from CSV file.
    Handles missing values and data preprocessing.
    """
    logger.info(f"Loading dataset from {csv_path}...")
    
    # Try multiple possible paths
    possible_paths = [
        csv_path,
        Path(__file__).parent / csv_path,
        Path(__file__).parent.parent / csv_path,
        Path(__file__).parent.parent.parent / csv_path,
    ]
    
    df = None
    for path in possible_paths:
        if os.path.exists(path):
            df = pd.read_csv(path)
            logger.info(f"Successfully loaded from {path}")
            break
    
    if df is None:
        logger.error(f"Dataset not found. Tried paths:")
        for path in possible_paths:
            logger.error(f"  {path}")
        raise FileNotFoundError(f"Dataset not found in any of the expected locations")
    
    logger.info(f"Dataset shape: {df.shape}")
    logger.info(f"Columns: {df.columns.tolist()}")
    
    # Handle missing values
    logger.info(f"Missing values before handling: {df.isnull().sum().sum()}")
    
    # Fill numeric columns with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)
    
    # Fill categorical columns with mode
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].mode()[0], inplace=True)
    
    logger.info(f"Missing values after handling: {df.isnull().sum().sum()}")
    
    return df


# ─────────────────────────────────────────────
# 2. PREPROCESSING
# ─────────────────────────────────────────────

def preprocess(df: pd.DataFrame, target_col: str = "readmission"):
    """
    Preprocess data: handle encoding, scaling, feature selection.
    """
    logger.info("Starting preprocessing...")
    
    # Check if target column exists
    if target_col not in df.columns:
        logger.error(f"Target column '{target_col}' not found in dataset.")
        logger.error(f"Available columns: {df.columns.tolist()}")
        raise ValueError(f"Target column '{target_col}' not found")
    
    # Separate features and target
    X = df.drop(target_col, axis=1)
    y = df[target_col]
    
    # Store feature names
    feature_names = X.columns.tolist()
    logger.info(f"Number of features: {len(feature_names)}")
    
    # Convert categorical to numeric
    for col in X.columns:
        if X[col].dtype == 'object':
            logger.info(f"Encoding categorical column: {col}")
            X[col] = pd.factorize(X[col])[0]
    
    # Handle target encoding if needed
    if y.dtype == 'object':
        logger.info(f"Encoding target variable...")
        y_unique = y.unique()
        logger.info(f"Target classes: {y_unique}")
        y = pd.factorize(y)[0]
    
    # Scale features
    logger.info("Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    logger.info(f"Preprocessed data shape: {X_scaled.shape}")
    logger.info(f"Target distribution: {np.bincount(y)}")
    
    return X_scaled, y, scaler, feature_names


# ─────────────────────────────────────────────
# 3. BUILD HYBRID MODEL
# ─────────────────────────────────────────────

def build_hybrid_model():
    """
    Hybrid Weighted Soft Voting:
      RF (50%) + XGBoost (50%)
      Final = average of both probabilities
    """
    logger.info("Building hybrid RF-XGBoost model...")
    
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
        verbose=0
    )

    xgb = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
        verbosity=0
    )

    # Soft voting = average of predicted probabilities
    hybrid = VotingClassifier(
        estimators=[("rf", rf), ("xgb", xgb)],
        voting="soft",
        weights=[0.5, 0.5],
        n_jobs=-1
    )

    return hybrid


# ─────────────────────────────────────────────
# 4. TRAIN + EVALUATE
# ─────────────────────────────────────────────

def train_and_evaluate(model, X_train, X_test, y_train, y_test, feature_names):
    """
    Train the model and evaluate performance.
    """
    logger.info("Training Hybrid RF-XGBoost Weighted Voting Model...")
    model.fit(X_train, y_train)
    logger.info("Model training complete.")

    # Predictions
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    # Metrics
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)

    logger.info(f"\n{'='*60}")
    logger.info(f"  Accuracy: {acc*100:.2f}%")
    logger.info(f"  ROC-AUC:  {auc:.4f}")
    logger.info(f"{'='*60}")
    logger.info("\nConfusion Matrix:")
    logger.info(f"  True Negatives:  {cm[0][0]}")
    logger.info(f"  False Positives: {cm[0][1]}")
    logger.info(f"  False Negatives: {cm[1][0]}")
    logger.info(f"  True Positives:  {cm[1][1]}")
    logger.info("\nClassification Report:")
    logger.info("\n" + classification_report(y_test, y_pred,
                                 target_names=["No Readmission", "Readmission"]))

    # Cross-validation
    logger.info("Running 5-Fold Cross Validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_train, y_train, cv=cv,
                                 scoring="accuracy", n_jobs=-1)
    logger.info(f"  CV Scores: {np.round(cv_scores*100, 2)}")
    logger.info(f"  Mean:      {cv_scores.mean()*100:.2f}% +/- {cv_scores.std()*100:.2f}%")

    return model, {"accuracy": acc, "auc": auc, "cv_mean": cv_scores.mean()}


# ─────────────────────────────────────────────
# 5. SHAP EXPLAINABILITY
# ─────────────────────────────────────────────

def compute_shap(X_train, X_test, y_train, feature_names):
    """
    Compute SHAP feature importance using XGBoost base learner.
    """
    logger.info("Computing SHAP feature importance...")

    xgb_standalone = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        verbosity=0
    )
    xgb_standalone.fit(X_train, y_train)

    explainer = shap.TreeExplainer(xgb_standalone)
    shap_values = explainer.shap_values(X_test[:min(100, len(X_test))])

    # Handle both binary and multiclass SHAP outputs
    if isinstance(shap_values, list):
        mean_shap = np.abs(shap_values[1]).mean(axis=0)
    else:
        mean_shap = np.abs(shap_values).mean(axis=0)

    shap_df = pd.DataFrame({
        "feature": feature_names,
        "importance": mean_shap
    }).sort_values("importance", ascending=False)

    logger.info("\nTop 10 Features by SHAP:")
    for idx, row in shap_df.head(10).iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")

    return shap_df


# ─────────────────────────────────────────────
# 6. SAVE ARTIFACTS
# ─────────────────────────────────────────────

def save_artifacts(model, scaler, feature_names, shap_df, output_dir: str = "."):
    """
    Save model, scaler, and feature names for production use.
    """
    logger.info("Saving model artifacts...")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Save model
    import pickle
    model_path = os.path.join(output_dir, "ckd_hybrid_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    logger.info(f"  Saved: {model_path}")

    # Save scaler
    scaler_path = os.path.join(output_dir, "scaler.pkl")
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    logger.info(f"  Saved: {scaler_path}")

    # Save feature names as JSON
    feature_names_path = os.path.join(output_dir, "feature_names.json")
    with open(feature_names_path, "w") as f:
        json.dump(feature_names, f, indent=2)
    logger.info(f"  Saved: {feature_names_path}")

    # Save SHAP importance
    shap_path = os.path.join(output_dir, "shap_importance.csv")
    shap_df.to_csv(shap_path, index=False)
    logger.info(f"  Saved: {shap_path}")

    logger.info("All artifacts saved successfully!")


# ─────────────────────────────────────────────
# 7. PREDICTION DEMO
# ─────────────────────────────────────────────

def predict_single(model, scaler, feature_names, sample: dict):
    """
    Single patient prediction demo.
    """
    try:
        # Create DataFrame with correct feature order
        input_df = pd.DataFrame([sample])[feature_names]
        input_scaled = scaler.transform(input_df)
        prob = model.predict_proba(input_scaled)[0][1] * 100

        if prob < 30:
            risk = "LOW"
            rec = "Routine follow-up in 30 days. Continue current treatment."
        elif prob < 60:
            risk = "MEDIUM"
            rec = "Monitor weekly. Review medication and diet. Schedule nephrology consult."
        else:
            risk = "HIGH"
            rec = "Immediate clinical review advised. Consider hospitalization assessment."

        logger.info(f"\n{'='*60}")
        logger.info(f"  Readmission Probability: {prob:.1f}%")
        logger.info(f"  Risk Level: {risk}")
        logger.info(f"  Recommendation: {rec}")
        logger.info(f"{'='*60}")
        
        return {"probability": round(prob, 2), "risk": risk, "recommendation": rec}
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return None


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":

    logger.info("=" * 60)
    logger.info("CKD Readmission Predictor - Model Training")
    logger.info("=" * 60)

    try:
        # Step 1: Load dataset
        csv_path = "ckd_clinical_data.csv"
        df = load_ckd_dataset(csv_path)
        
        logger.info(f"Dataset info:")
        logger.info(f"  Shape: {df.shape}")
        logger.info(f"  Columns: {list(df.columns)}")
        if 'readmitted' in df.columns:
            logger.info(f"  Target distribution: {df['readmitted'].value_counts().to_dict()}")

        # Step 2: Preprocess
        X, y, scaler, feature_names = preprocess(df, target_col="readmitted")

        # Step 3: Apply SMOTE for class balancing
        logger.info("Applying SMOTE for class balancing...")
        sm = SMOTE(random_state=42)
        X_res, y_res = sm.fit_resample(X, y)
        logger.info(f"  Before SMOTE: {dict(zip(*np.unique(y, return_counts=True)))}")
        logger.info(f"  After SMOTE: {dict(zip(*np.unique(y_res, return_counts=True)))}")

        # Step 4: Train/Test split
        logger.info("Splitting data into train/test (80/20)...")
        X_train, X_test, y_train, y_test = train_test_split(
            X_res, y_res, test_size=0.2, stratify=y_res, random_state=42
        )
        logger.info(f"  Train size: {X_train.shape[0]}")
        logger.info(f"  Test size: {X_test.shape[0]}")

        # Step 5: Build and train model
        model = build_hybrid_model()
        model, metrics = train_and_evaluate(model, X_train, X_test, y_train, y_test, feature_names)

        # Step 6: Compute SHAP
        shap_df = compute_shap(X_train, X_test, y_train, feature_names)

        # Step 7: Save artifacts
        save_artifacts(model, scaler, feature_names, shap_df, output_dir=".")

        # Step 8: Demo prediction
        logger.info("\nDemo Prediction (sample patient):")
        sample_patient = {feature: np.mean(df[feature]) for feature in feature_names}
        result = predict_single(model, scaler, feature_names, sample_patient)

        logger.info("=" * 60)
        logger.info("Model training and evaluation complete!")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Error during training: {str(e)}", exc_info=True)
        sys.exit(1)