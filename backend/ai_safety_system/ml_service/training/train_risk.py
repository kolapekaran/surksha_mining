import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

# 🔥 FEATURES:
# [fire, no_helmet, no_vest, fatigue]

X = np.array([
    [1, 1, 1, 1],  # worst case
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 0],  # safe
])

# 🎯 TARGET RISK SCORE
y = np.array([
    95,
    80,
    70,
    60,
    40,
    5
])

# 🔥 MODEL
model = RandomForestRegressor()
model.fit(X, y)

# 💾 SAVE
joblib.dump(model, "models/risk_model.pkl")

print("✅ Risk model trained & saved")