import {Alert, Text, TouchableOpacity, View} from "react-native";
import {useEffect} from "react";
import {useNavigation} from "@react-navigation/native";
import {useDispatch, useSelector} from "react-redux";
import {AntDesign} from "@expo/vector-icons";
import {useFonts} from "expo-font";
import * as SecureStore from 'expo-secure-store';
import MultipleDigitsInput from "./Components/MultipleDigitsInput";
import {getAPIUrlFromStorage, showAPIConfigAlert} from "./Utils";

export default function Home() {
    const navigation = useNavigation()
    const isLoggedIn = useSelector(state => state.auth.loggedIn)
    const dispatch = useDispatch()

    const [fontsLoaded, fontError] = useFonts({
        'azonix': require('../assets/fonts/azonix.otf'),
    });

    const fetchJoin = async (code) => {
        const API_BASE_URL = await getAPIUrlFromStorage();
        if (API_BASE_URL == null) {
            showAPIConfigAlert(navigation);
            return; // Exit the function if the API URL is missing
        }

        try {
            const payload = {
                lobbyCode: code
            };

            const response = await fetch(API_BASE_URL + ":8082/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const gameId = await response.json();
                navigation.navigate("Game", {
                    gameId: gameId,
                    lobbyCode: parseInt(code)
                });
            } else if (response.status === 403) {
                Alert.alert(
                    "Lobby code invalid",
                    "Lobby does not exist",
                    [{text: "OK"}]
                );
            } else {
                const errorData = await response;
                Alert.alert(
                    "Server error",
                    errorData.message || "Unknown error",
                    [{text: "OK"}]
                );
            }
        } catch (error) {
            console.log(error);
            Alert.alert(
                "Network error",
                error.message + ": The API endpoint is down or has wrong configuration",
                [{text: "OK"}, {
                    text: "configure", onPress: () => navigation.navigate("Settings")
                }]
            );
        }
    };


    useEffect(() => {
        const display = async () => {
            const isAvailable = await SecureStore.isAvailableAsync();
            if (isAvailable) {
                try {
                    let token = await SecureStore.getItemAsync("token");
                    if (token) {
                        dispatch({type: "LOGIN", token: token})
                    }
                } catch (e) {
                    console.error("Error retrieving token:", e);
                }
            } else {
                console.warn("SecureStore not available yet");
            }
        };

        display();
    }, []);

    const renderAdmin = () => {
        if (isLoggedIn) {
            return <>
                <View className={"bg-[#4D5B66] px-3 py-6 rounded-2xl w-full  shadow-2xl shadow-black mt-3"}>
                    <Text className={"text-center text-4xl mb-5 text-white font-azonix"}>Admin panel</Text>

                    <TouchableOpacity
                        className={"border-[3px] border-[#00ADB5] p-5 rounded-xl mb-2  flex-row shadow-2xl"}
                        onPress={() => navigation.navigate("Editor")}
                    >
                        <Text className={"text-white text-center text-2xl font-azonix mr-auto"}>Editor</Text>
                        <AntDesign name="arrowright" size={28} color="white"/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={"border-[3px] border-[#00ADB5] p-5 rounded-xl mb-2  flex-row shadow-2xl"}
                        onPress={() => navigation.navigate("GL")}
                    >
                        <Text className={"text-white text-2xl text-center font-azonix mr-auto"}>Templates</Text>
                        <AntDesign name="arrowright" size={28} color="white"/>
                    </TouchableOpacity>
                </View>
            </>
        }
    }


    return (
        <View className={"flex-1 bg-[#393E46] flex-col p-1"}>
            <View className={"flex-1 items-center flex-col "}>
                <View className={"bg-[#4D5B66] pb-3 py-6 rounded-2xl w-full shadow-black shadow-2xl"}>
                    <Text className={"text-center text-4xl mb-5 text-white font-azonix"}>Lobby Code</Text>
                    <View className={"flex-row items-center justify-center mb-2"}>

                        <MultipleDigitsInput onCodeComplete={fetchJoin}/>

                    </View>
                </View>

                {
                    renderAdmin()
                }

            </View>
        </View>
    )
}