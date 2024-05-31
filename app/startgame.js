import {Alert, Text, TextInput, TouchableOpacity, View} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import {useState} from "react"
import {useNavigation, useRoute} from "@react-navigation/native";
import {getAPIUrlFromStorage, getTokenFromStorage, showAPIConfigAlert} from "./Utils";

export default function StartGame() {
    const [count, setCount] = useState(10)
    const [interval, setInterval] = useState(1500)

    const route = useRoute()
    const recievedData = route.params

    const navigation = useNavigation()

    const fetchStartGame = async () => {
        const API_BASE_URL = await getAPIUrlFromStorage();
        if (API_BASE_URL == null) {
            showAPIConfigAlert(navigation);
            return;
        }

        const token = await getTokenFromStorage();

        try {
            const payload = {
                gameId: recievedData.gameId,
                count: count,
                interval: interval,
                lobbyCode: recievedData.lobbyCode
            };

            const response = await fetch(API_BASE_URL + ":8082/start", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log("game started");
                navigation.goBack();
            } else {
                const errorData = await response;
                console.error(errorData);
                Alert.alert(
                    "Server error",
                    errorData.message || "Unknown error",
                    [{text: "OK"}]
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert(
                "Network error",
                error.message + ": The API endpoint is down or has wrong configuration",
                [{text: "OK"}, {
                    text: "configure", onPress: () => navigation.navigate("Settings")
                }]
            );
        }
    };


    return (
        <View className={"flex-1 bg-[#393E46] p-1"}>
            <View className={"bg-gray-200 p-3 rounded-xl items-center flex-row my-2 mx-1"}>
                <MaterialIcons name="timer" size={24} color="#00ADB5" className={"mr-2"}/>
                <TextInput
                    className={"flex-1 font-azonix"}
                    placeholder={"count"}
                    onChangeText={(text) => setCount(text)}
                    value={count}
                >
                </TextInput>
            </View>

            <View className={"bg-gray-200 p-3 rounded-xl items-center flex-row my-2 mx-1"}>
                <MaterialIcons name="timer" size={24} color="#00ADB5" className={"mr-2"}/>
                <TextInput
                    className={"flex-1 font-azonix"}
                    placeholder={"interval"}
                    onChangeText={(text) => setInterval(text)}
                    value={interval}
                >
                </TextInput>
            </View>

            <TouchableOpacity
                className={"bg-transparent rounded-xl p-4 items-center flex-row justify-center border-2 border-[#00ADB5]"}
                onPress={() => fetchStartGame()}
            >
                <MaterialIcons name="play-arrow" size={26} color="#00ADB5" className={"mr-2"}/>
                <Text className={"font-azonix text-white"}>Start Game</Text>
            </TouchableOpacity>


        </View>
    )
}