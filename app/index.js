import 'react-native-gesture-handler'
import Editor from "./editor"
import {createDrawerNavigator} from "@react-navigation/drawer"
import Home from "./home"

const Drawer = createDrawerNavigator();
export default function Index() {

    return (
        <Drawer.Navigator screenOptions={{headerTitleAlign:"center"}} initialRouteName={"Home"}>
            <Drawer.Screen name="Home" options={{headerTitleStyle:{display:"none"}, headerTransparent:true}} component={Home}/>
            <Drawer.Screen name="Editor" options={{headerTransparent:false, headerShadowVisible:true, headerTitle:"Map editor"}} component={Editor}/>
        </Drawer.Navigator>
    )

}