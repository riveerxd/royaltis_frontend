import {ActivityIndicator, SafeAreaView, Text, TextInput, ToastAndroid, TouchableOpacity, View} from "react-native";
import {useState} from "react"
import {Feather} from "@expo/vector-icons";
import axios from "axios";
import {useDispatch} from "react-redux";
import {useNavigation} from "@react-navigation/native";
import {ipAddress} from "./constants";

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
        try {
            setLoading(true)
            const payload = {
                username: username,
                password: password
            }
            const response = await axios.post("http://" + ipAddress + ":8080/login", payload)

            if (response.status === 200) {
                const newToken = response.headers.get("X-Token")
                console.log(newToken)
                handleLogin(newToken)
            } else {
                console.error(response.data)
                ToastAndroid.show("Invalid credentials", ToastAndroid.SHORT)
            }
        } catch (error) {
            console.log(error)
            ToastAndroid.show("Server error", ToastAndroid.SHORT)
        } finally {
            setLoading(false)
            setUsername("")
            setPassword("")
        }
    }
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
                            loading ? <ActivityIndicator size={24} color={"#00ADB5"}/> : <Text className={"text-xl font-azonix text-center"}>
                                Login
                            </Text>
                        }
                    </View>
                </TouchableOpacity>

            </View>

        </View>
    )
}