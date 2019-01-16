
# coding: utf-8

# In[]:

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.metrics import roc_curve, auc
from sklearn import svm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import GridSearchCV
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import precision_recall_curve
from sklearn.model_selection import train_test_split
import random
from sklearn.model_selection import RandomizedSearchCV
from sklearn import preprocessing
from sklearn.model_selection import GridSearchCV
#from sklearn.xgboost.sklearn import XGBClassifier
#import xgboost as xgb
from sklearn.ensemble import GradientBoostingClassifier
from sklearn import metrics
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import classification_report
from imblearn.over_sampling import SMOTE
from pandas.core.frame import DataFrame
from sklearn.externals import joblib
import ranknet
import testa
import copy
from pandas.core.frame import DataFrame

import pickle
#new_model=RandomForestClassifier()
#with open ('model.pkl','rb') as f:
#    new_model = pickle.load(f)
#    print('aaa')

def MachineLearningModel(featureMatrix):
    # 加载模型文件，生成模型对象
    #new_model = joblib.load("model.joblib")
    new_model=RandomForestClassifier()
    with open ('model.pkl','rb') as f:
        new_model = pickle.load(f)
        print('aaa')
    predicted = new_model.predict(featureMatrix)
    predicted = predicted.tolist()
    gid = featureMatrix.index.tolist()
    return gid, predicted

def predict(site, point_list, S, k = 15):
    totalGrid = pd.read_table('selected_37_feature_matrix_no_scale.txt', index_col=0)
    totalGrid = totalGrid.loc[point_list, :]
    #distance = pd.read_csv('bj_unicom_ssgrid_neartable.csv')
    #select_grid = np.unique(distance['fnid']).tolist()
    #overlap_grid = list(set(totalGrid.index.tolist()).intersection(set(select_grid)))
    #totalGrid = totalGrid.loc[overlap_grid, :]
    #grid_to_198_distance = pd.read_table('grid_to_198_distance.txt', index_col=0)
    #grid_to_198_distance = grid_to_198_distance.loc[overlap_grid,:]
    print(totalGrid)
    data_matrix = pd.read_csv('data-competence_money.csv', index_col=0)

    if site == 1:
        # Get column names first
        scaled_df = copy.deepcopy(totalGrid)
	scaled_df['competence'] = scaled_df['competence']*S*k
        colnames = scaled_df.columns
	rownames = scaled_df.index
        # Create the Scaler object
        scaler = preprocessing.StandardScaler()
        # Fit your data on the scaler object
        scaled_df = scaler.fit_transform(scaled_df)
        scaled_df = pd.DataFrame(scaled_df,index = rownames , columns=colnames)
	print(scaled_df)
        classifier_gid, classifier_lable = MachineLearningModel(scaled_df)
        #pd.Series(classifier_lable).groupby(classifier_lable).count()
        tmp = [classifier_gid, classifier_lable]
        tmp = DataFrame(tmp).T
        tmp.rename(columns={0:'gid', 1:'label'}, inplace=True)
        test_new = tmp[tmp['label']==1]
        if test_new.shape[0]>0:
            test_new_ = totalGrid.iloc[test_new.index.tolist(),:]
            a = ranknet.predictRank(test_new_)
            grid_index = test_new_.index[a[0].tolist()[0]]
            final_index.append(grid_index)
            return([grid_index])
        else:
            test_new_  = scaled_df
            a = ranknet.predictRank(test_new_)
            print(a)
	    print(test_new_)
            return([test_new_.index[a[0].tolist()[0]]])

    if site > 1:
        final_index = []
        scaled_df = copy.deepcopy(totalGrid)
        scaled_df['competence'] = scaled_df['competence']*S*k
        colnames = scaled_df.columns
        rownames = scaled_df.index
        # Create the Scaler object
        scaler = preprocessing.StandardScaler()
        # Fit your data on the scaler object
        scaled_df = scaler.fit_transform(scaled_df)
        scaled_df = pd.DataFrame(scaled_df, columns=colnames, index = rownames)
        classifier_gid, classifier_lable = MachineLearningModel(scaled_df)
        tmp = [classifier_gid, classifier_lable]
        tmp = DataFrame(tmp).T
        tmp.rename(columns={0:'gid', 1:'label'}, inplace=True)
        test_new = tmp[tmp['label']==1]
        if test_new.shape[0]>0:
            test_new_ = totalGrid.iloc[test_new.index.tolist(),:]
            a = ranknet.predictRank(test_new_)
            grid_index = test_new_.index[a[0].tolist()[0]]
            final_index.append(grid_index)
        else:
            test_new_ = scaled_df
            a = ranknet.predictRank(test_new_)
            grid_index = test_new_.index[a[0].tolist()[0]]
            final_index.append(grid_index)
        point_list_train = data_matrix.index.tolist()
        for j in range(site-1):
            scaled_df.drop([grid_index], axis=0, inplace=True)
            ###############################################################
            # Add the module.
            point_list_train.append(grid_index)
            competence = []
            for gridID in range(scaled_df.shape[0]):
                point = scaled_df.index.tolist()[gridID]
                competence.append(sum(testa.calculate(point, point_list_train)))
            scaled_df['competence'] = [x*S*k for x in competence]
            ###############################################################
            # Get column names first
            colnames = scaled_df.columns
            rownames = scaled_df.index
            # Create the Scaler object
            scaler = preprocessing.StandardScaler()
            # Fit your data on the scaler object
            scaled_df = scaler.fit_transform(scaled_df)
            scaled_df = pd.DataFrame(scaled_df, columns=colnames, index = rownames)
            classifier_gid, classifier_lable = MachineLearningModel(scaled_df)
            tmp = [classifier_gid, classifier_lable]
            tmp = DataFrame(tmp).T
            tmp.rename(columns={0:'gid', 1:'label'}, inplace=True)
            test_new = tmp[tmp['label']==1]
            if test_new.shape[0]>0:
                test_new_ = totalGrid.iloc[test_new.index.tolist(),:]
                a = ranknet.predictRank(test_new_)
                grid_index = test_new_.index[a[0].tolist()[0]]
                final_index.append(grid_index)
            else:
                test_new_ = scaled_df
                a = ranknet.predictRank(test_new_)
                grid_index = test_new_.index[a[0].tolist()[0]]
                final_index.append(grid_index)
    return(final_index)
#print(predict(1,[168806,175192,191650],500))
