import {createStore, combineReducers} from "redux/src";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem("token", token);
        console.log("Token stored successfully:", token);
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

const removeToken = async (token) =>{
    try{
        await AsyncStorage.removeItem("token")
        console.log("Token deleted")
    }catch (error){
        console.error(error)
    }
}

const authReducer = (state = {loggedIn: false}, action) =>{
    switch (action.type){
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

const  rootReducer = combineReducers({
    auth: authReducer
})

const store = createStore(rootReducer)
export default store