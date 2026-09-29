from tensorflow import keras

model = keras.Sequential([
    keras.layers.Flatten(input_shape=(64,64,3)),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy')

# dummy training
import numpy as np
X = np.random.rand(100,64,64,3)
y = np.random.randint(0,2,100)  

model.fit(X, y, epochs=3)

model.save("models/fatigue_model.h5")