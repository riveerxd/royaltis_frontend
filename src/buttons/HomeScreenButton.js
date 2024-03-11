import {Text, TouchableOpacity} from "react-native";

export default function HomeScreenButton({text, icon}) {
    return (
        <TouchableOpacity className={"flex-row border-black border-2 rounded-lg p-4 mx-5 items-center mb-5"}>
            {icon}
            <Text className={"text-2xl ml-2"}>{text}</Text>
        </TouchableOpacity>
    )
}