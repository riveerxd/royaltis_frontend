import {ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useState} from "react"
import {Feather} from "@expo/vector-icons";
import {useDispatch} from "react-redux";
import {useNavigation} from "@react-navigation/native";
import {getAPIUrlFromStorage, showAPIConfigAlert} from "./Utils";

export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const handleLogin = (token) => {
        dispatch({type: "LOGIN", token: token})
        navigation.goBack()
    }

    const fetchLogin = async () => {
        console.log("logpressed")
        const APIUrl = await getAPIUrlFromStorage();
        if (APIUrl == null) {
            console.log("no api endpoint")
            showAPIConfigAlert(navigation);
            return; // Exit the function early if the API URL is missing
        }

        try {
            setLoading(true);
            const payload = {
                username: username,
                password: password
            };

            const response = await fetch(APIUrl + ":8082/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) { // Check response.ok instead of response.status
                const newToken = response.headers.get("X-Token");
                console.log(newToken);
                handleLogin(newToken);
            } else {
                const errorData = await response; // Parse error response
                console.error(errorData);

                let errorMessage = "Invalid credentials";
                if (response.status === 401) {
                    errorMessage = "Authentication error: " + errorMessage;
                } else {
                    errorMessage = "Server error: " + errorData.message || "Unknown error"; // Use detailed message if available
                }

                Alert.alert(errorMessage, "", [{text: "OK"}]);
            }
        } catch (error) {
            console.log(error);

            Alert.alert(
                "Server error",
                error.message + ": The API endpoint is down", // Show error message from the exception
                [
                    {text: "OK"},
                    {
                        text: "Configure",
                        onPress: () => {
                            navigation.navigate("Settings");
                        }
                    }
                ]
            );
        } finally {
            setLoading(false);
            setUsername("");
            setPassword("");
        }
    };

    return (
        <View className={"flex-1 py-3 justify-start items-center flex-col bg-[#393E46]"}>
            <View
                className={"w-[95%] bg-[#4D5B66] shadow-black shadow-xl items-center justify-center py-8  rounded-[10]"}>
                <View className={"bg-gray-200 p-5 rounded-xl items-center flex-row m-3"}>
                    <Feather name="user" size={24} color="#00ADB5" className={"mr-2"}/>
                    <TextInput
                        className={"flex-1 font-azonix"}
                        placeholder={"username"}
                        onChangeText={(text) => setUsername(text)}
                        value={username}
                    >
                    </TextInput>
                </View>
                <View className={"bg-gray-200 p-5 rounded-xl items-center flex-row m-3"}>
                    <Feather name="lock" size={24} color="#00ADB5" className={"mr-2"}/>
                    <TextInput
                        className={"flex-1 font-azonix"}
                        placeholder={"password"}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                    >

                    </TextInput>
                </View>

                <TouchableOpacity
                    className={(loading ? "opacity-60" : "opacity-100") + " py-4 px-12 rounded-xl shadow-lg bg-white flex-row mx-3"}
                    onPress={() => fetchLogin()}
                    activeOpacity={1}
                    disabled={loading}
                >
                    <View className={"flex-1 flex-row justify-center items-center h-max"}>


                        {
                            loading ? <ActivityIndicator size={24} color={"#00ADB5"}/> :
                                <Text className={"text-xl font-azonix text-center"}>
                                    Login
                                </Text>
                        }
                    </View>
                </TouchableOpacity>

            </View>

        </View>
    )
}