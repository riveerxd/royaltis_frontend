import 'react-native-gesture-handler'
import Editor from "./editor"
import Home from "./home"
import Game from "./game";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import GameConfirmation from "./gameconfirmation";
import GameList from "./gameslist";
import {Text, TouchableOpacity, View} from "react-native";
import {Feather, Ionicons} from "@expo/vector-icons";
import Login from "./login";
import {useNavigation} from "@react-navigation/native";
import {Provider, useDispatch, useSelector} from "react-redux";
import store from "./redux/store"
import {useFonts} from "expo-font";

const Stack = createNativeStackNavigator()

const HomeHeader = () => {
    const loggedId = useSelector(state => state.auth.loggedIn)
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const handlePress = () => {
        if (loggedId) {
            //navigation.navigate("UserDetails")
            dispatch({type: "LOGOUT"})
        } else {
            navigation.navigate("Login")
        }
    }

    return (
        <TouchableOpacity onPress={() => handlePress()}>
            {loggedId ? <Feather name="log-in" size={30} color="#00ADB5"/> :
                <Feather name="user" size={30} color="#00ADB5"/>}
        </TouchableOpacity>
    )

}
const EmptyIcon = () => {

    return <View>
        <Ionicons name="arrow-back-outline" size={28} color="transparent"/>
    </View>
}
export default function Index() {
    const navigation = useNavigation()
    const [fontsLoaded, fontError] = useFonts({
        // Define your font here
        'azonix': require('../assets/fonts/azonix.otf'),
    });

    const CustomHeader = ({title, goBack, rightElement}) => {
        return (
            <View className={"bg-[#222831] flex-row items-center p-2"}>
                {
                    goBack ? <TouchableOpacity
                        onPress={navigation.goBack}
                    >
                        <Ionicons name="arrow-back-outline" size={25} color="#FFFFFF"/>
                    </TouchableOpacity> : <EmptyIcon/>
                }

                <Text className={"font-azonix text-3xl flex-1 text-center text-white"} numberOfLines={1}
                      ellipsizeMode="tail">
                    {title}
                </Text>
                {
                    rightElement ? rightElement : <EmptyIcon/>
                }
            </View>

        );
    };
    return (
        <Provider store={store}>
            {
                fontsLoaded ? <Stack.Navigator screenOptions={{
                    headerTitleAlign: "center",
                    statusBarStyle: "light",
                    statusBarColor: "#222831",
                    headerTitleStyle: {
                        fontSize: 26,
                        fontFamily: "azonix",
                        color: "#FFFFFF"
                    },
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "#222831"
                    },
                    animation: "ios",
                    animationDuration: 1,
                }} initialRouteName={"Home"}>

                    <Stack.Screen name="Home" options={{
                        headerRight: () => <HomeHeader/>, headerTitle: "Royaltis",
                        header: () => <CustomHeader title="Royaltis" goBack={false} rightElement={<HomeHeader/>}/>,
                    }} component={Home}/>

                    <Stack.Screen name="Editor"
                                  options={{header: () => <CustomHeader title={"map editor"} goBack={true}/>}}
                                  component={Editor}/>

                    <Stack.Screen name="Game" component={Game}/>

                    <Stack.Screen name={"GC"} options={{
                        header: () => <CustomHeader title={"preview"} goBack={true}/>
                    }} component={GameConfirmation}/>

                    <Stack.Screen name={"GL"}
                                  options={{header: () => <CustomHeader title={"Templates"} goBack={true}/>}}
                                  component={GameList}/>

                    <Stack.Screen name={"Login"} component={Login}
                                  options={{
                                      header: () => <CustomHeader title={"Login"} goBack={true}/>
                                  }}
                    />
                </Stack.Navigator> : <View className={"bg-red-600"}>
                    <Text className={"bg-white"}>LOADING</Text>
                </View>
            }
        </Provider>

    )

}