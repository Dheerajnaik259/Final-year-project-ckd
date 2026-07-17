import pickle 
m = pickle.load(open('model/ckd_model.pkl', 'rb')) 
print(type(m)) 
print(getattr(m, 'n_estimators', 'not a forest')) 
