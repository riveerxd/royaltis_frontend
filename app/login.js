import {Text, TextInput, ToastAndroid, TouchableOpacity, View} from "react-native";
import {useState} from "react"
import {Feather} from "@expo/vector-icons";
import axios from "axios";
import {useDispatch} from "react-redux";
import {useNavigation} from "@react-navigation/native";

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
            const response = await axios.post("http://192.168.0.243:8080/login", payload)

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
        <View className={"flex-1 flex-row justify-center items-center bg-[#F5F5F5]"}>
            <View
                className={" flex-[0.9] bg-[#2F89FC] border-blue-400 border-2 shadow-xl items-center justify-center py-16  rounded-[10]"}>
                <View className={"bg-gray-200 p-5 rounded-xl items-center flex-row m-3"}>
                    <Feather name="user" size={24} color="black" className={"mr-2"}/>
                    <TextInput
                        className={"flex-1"}
                        placeholder={"username"}
                        onChangeText={(text) => setUsername(text)}
                        value={username}
                    >
                    </TextInput>
                </View>
                <View className={"bg-gray-200 p-5 rounded-xl items-center flex-row m-3"}>
                    <Feather name="lock" size={24} color="black" className={"mr-2"}/>
                    <TextInput
                        className={"flex-1"}
                        placeholder={"password"}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                    >

                    </TextInput>
                </View>

                <TouchableOpacity
                    className={(loading ? "opacity-60" : "opacity-100") + " py-5 px-12 rounded-[5] shadow-lg bg-white"}
                    onPress={() => fetchLogin()}
                    activeOpacity={1}
                    disabled={loading}
                >
                    <Text className={"text-xl font-bold"}>
                        Login
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}