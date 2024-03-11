import {StatusBar, Text, TouchableOpacity, View} from "react-native";
import {FontAwesome5, MaterialIcons} from "@expo/vector-icons";

export default function DefaultScreen(){
    return(
        <View className={"flex-1 items-center justify-center  bg-white mt-[-20%]"}>
            <Text className={"text-8xl font-bold mb-1 pt-2"}>Royaltis</Text>
            <Text className={"text-2xl font-bold mb-16"}>welcome</Text>

            <TouchableOpacity className={"flex-row border-black border-2 rounded-lg p-4 mx-5 items-center mb-5"}>
                <Text className={"text-3xl mr-2"}>Play as guest</Text>
                <MaterialIcons name="keyboard-double-arrow-right" size={30} color="black"/>
            </TouchableOpacity>
            <TouchableOpacity className={"flex-row border-black border-2 rounded-lg p-4 mx-5 items-center"}>
                <Text className={"text-2xl mr-2"}>Log in</Text>
                <FontAwesome5 name="user-shield" size={28} color="black" />
            </TouchableOpacity>



            <StatusBar style="auto"/>
        </View>
    )
}