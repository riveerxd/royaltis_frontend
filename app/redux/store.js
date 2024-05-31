import {combineReducers, createStore} from "redux/src";
import * as SecureStore from 'expo-secure-store';

const storeToken = async (token) => {
    await SecureStore.setItemAsync("token", token)
    console.log("token saved")
};

const removeToken = async (token) => {
    await SecureStore.deleteItemAsync("token")
    console.log("Token deleted")

}

const authReducer = (state = {loggedIn: false}, action) => {
    switch (action.type) {
        case "LOGIN":
            storeToken(action.token)
            return {...state, loggedIn: true}
        case "LOGOUT":
            removeToken(action.token)
            return {...state, loggedIn: false}
        default:
            return state
    }
}

const rootReducer = combineReducers({
    auth: authReducer
})

const store = createStore(rootReducer)
export default store