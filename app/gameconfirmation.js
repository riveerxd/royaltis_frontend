import {Text, TextInput, ToastAndroid, TouchableOpacity, View} from "react-native";
import {FontAwesome5, MaterialIcons} from "@expo/vector-icons";
import MapView, {Callout, Marker, Polygon} from "react-native-maps";
import {useNavigation, useRoute} from "@react-navigation/native";
import {customMapStyle} from "./styles/mapStyles";
import {getInitialRegion} from "../src/utilities/Utils";
import {useState, useRef} from "react"
import axios from "axios";
import {ipAddress} from "./constants";
export default function GameConfirmation() {

    const route = useRoute()
    const navigation = useNavigation()
    const recievedData = route.params

    const [gameName, setGameName] = useState(null)

    const borderMarkers = recievedData[0]
    const lootboxMarkers = recievedData[1]
    const mapCenter = recievedData[2][0]
    const polygonCoordinates = borderMarkers.map(point => point.coords);
    const finalData = [borderMarkers, lootboxMarkers, [mapCenter], [{type: "gameName", value: gameName}]]

    const [loading, setLoading] = useState(false);
    const uploadGameData =async () =>{
        setLoading(true)
        try{
            axios.defaults.headers.common = {
                "Authorization": "fK/na9RvJZPfevoC0IkVNz7S2MA4plEno/R+9hMGhnY=",
                "Content-Type": "application/json"
            };
            const response = await axios.post("http://"+ipAddress+":8080/creategame", finalData)


            if (response.status === 200 || response.status === 201){
                navigation.reset({
                    index:0,
                    routes: [{name: "Home"}]
                })
                console.log("data uploaded")
                ToastAndroid.show("Data successfully uploaded!", ToastAndroid.SHORT)

            }else{
                console.log("Error uploading data", response.status, response.data)
            }

        }catch (error){
            console.log(error)
        }finally {
            setLoading(false)
        }
    }
    return (
        <View className={"flex-1 bg-[#4D5B66]"}>
            <View className={"flex-1 w-full p-2 justify-evenly pb-6"}>
                <View className={"block w-full h-[50%] rounded-full"} style={{overflow: "hidden", borderRadius: 10}}>
                    <MapView
                        customMapStyle={customMapStyle}
                        initialRegion={getInitialRegion(recievedData[0])}
                        style={{flex: 1}}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                        toolbarEnabled={false}
                        moveOnMarkerPress={false}
                        
                    >

                        {

                            borderMarkers.length > 0 &&
                            <Polygon
                                coordinates={polygonCoordinates}
                                fillColor="rgba(0,0,0,0)"
                                strokeColor="rgba(255,0,0,1)"
                                strokeWidth={3}
                                onPress={(event) => event.stopPropagation()}
                            />


                        }

                        {
                            borderMarkers.map((curr) => {
                                return <Marker
                                    key={curr.id}
                                    coordinate={{ latitude: curr.coords.latitude, longitude: curr.coords.longitude }}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    icon={require("../assets/icons/dot_optimized.png")}
                                >
                                </Marker>
                            })
                        }

                        {
                            mapCenter ? (<Marker
                                coordinate={mapCenter.coords}
                                icon={require("../assets/icons/center(1).png")}
                            >
                            </Marker>) : null
                        }


                        {
                            lootboxMarkers.map((curr) => {
                                return <Marker
                                    onSelect={(event) => event.stopPropagation()}
                                    key={curr.id}
                                    coordinate={curr.coords}
                                    anchor={{x: 0.5, y: 0.5}}
                                    icon={require("../assets/icons/lootbox_optimized(2).png")}
                                >


                                </Marker>
                            })
                        }
                    </MapView>
                </View>
                <View className={"flex-1 justify-between"}>
                    <View className={"bg-gray-200 p-5 rounded-xl items-center flex-row my-3"}>
                        <MaterialIcons name="drive-file-rename-outline" size={26} color="#00ADB5" className={"mr-2"}/>
                        <TextInput
                            className={"flex-1 font-azonix"}
                            placeholder={"game name"}
                            value={gameName}
                            onChangeText={(text) => setGameName(text)}
                        >
                        </TextInput>
                    </View>

                </View>
                <TouchableOpacity
                    className={"bg-transparent rounded-xl p-4 items-center flex-row justify-center border-2 border-[#00ADB5]"}
                    onPress={() => uploadGameData()}
                >
                    <Text className={"text-center mr-3 text-2xl font-bold text-white"}>Upload game data</Text>
                    <FontAwesome5 name="cloud-upload-alt" size={28} color="#00ADB5"/>
                </TouchableOpacity>
            </View>
        </View>
    )
}