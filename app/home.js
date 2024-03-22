import {Pressable, StatusBar, Text, TouchableOpacity, View} from "react-native";
import {Link} from "expo-router";
import {FontAwesome, FontAwesome5, MaterialIcons} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";

export default function Home() {

    return (
        <View className={"flex-1 items-start pt-20 bg-white p-1.5 flex-col justify-start w-full"}>
            <View className={"flex-col mb-16 items-center w-full"}>
                <Text className={"text-7xl font-black pt-2"}>Royaltis</Text>
                <Text className={"text-xl font-bold pl-1"}>welcome</Text>
            </View>
            <View className={"flex-col justify-center"}>
                <Text className={"text-2xl font-bold"}>Available games</Text>
                <View className={"flex-row w-full bg-black/80 shadow-2xl rounded-lg border-2 border-black p-3 mb-2"}>
                    <View className={"mr-auto"}>
                        <Text className={"text-2xl text-white"}>GAME NAME</Text>
                        <Text className={"text-white text-xl"}>56 players</Text>
                    </View>
                    <View className={"bg-white border border-black rounded-lg p-3"}>
                        <TouchableOpacity className={"items-center justify-center flex-row"}>
                            <Text className={"text-2xl font-bold mr-2"}>JOIN</Text>
                            <FontAwesome name="user-plus" size={28} color="black"/>
                        </TouchableOpacity>
                    </View>

                </View>

                <View className={"flex-row w-full bg-black/70 shadow-2xl rounded-lg p-3"}>
                    <View className={"mr-auto"}>
                        <Text className={"text-2xl text-white"}>GAME NAME</Text>
                        <Text className={"text-white text-xl"}>56 players</Text>
                    </View>
                    <View className={"justify-center bg-white/30 rounded-lg p-3"}>
                        <TouchableOpacity className={"items-center justify-center flex-row"}>
                            <Text className={"text-white text-xl mr-2"}>JOIN</Text>
                            <FontAwesome name="user-plus" size={28} color="white"/>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
            <StatusBar style="auto"/>
        </View>
    )
}