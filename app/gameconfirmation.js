import {ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View} from "react-native";
import {FontAwesome5, MaterialIcons} from "@expo/vector-icons";
import MapView, {Marker, Polygon} from "react-native-maps";
import {useNavigation, useRoute} from "@react-navigation/native";
import {customMapStyle} from "./styles/mapStyles";
import {getAPIUrlFromStorage, getInitialRegion, getTokenFromStorage, showAPIConfigAlert} from "./Utils";
import {useState} from "react"

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

    const uploadGameData = async () => {
        const API_BASE_URL = await getAPIUrlFromStorage();
        if (API_BASE_URL == null) {
            showAPIConfigAlert(navigation);
            setLoading(false); // Ensure loading is set to false if API URL is missing
            return;
        }

        const token = await getTokenFromStorage();
        console.log("found token: " + token);
        setLoading(true);

        try {
            const response = await fetch(API_BASE_URL + ":8082/creategame", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(finalData)
            });

            if (response.status === 200 || response.status === 201) {
                navigation.reset({
                    index: 0,
                    routes: [{name: "Home"}]
                });
                console.log("data uploaded");

                Alert.alert(
                    "Success",
                    "Data successfully uploaded!",
                    [{text: "OK"}]
                );
            } else {
                const errorData = await response;
                Alert.alert(
                    "Server error",
                    errorData.message || "Unknown error",
                    [{text: "OK"}]
                );
            }
        } catch (error) {
            console.log(error);
            Alert.alert(
                "Network error",
                error.message + ": The API endpoint is down or has wrong configuration",
                [{text: "OK"}, {
                    text: "configure", onPress: () => navigation.navigate("Settings")
                }]
            );
        } finally {
            setLoading(false);
        }
    };

    const [imageLoading, setImageLoading] = useState(false)

    const handleOnLayout = () => {
        setImageLoading(true)
    }

    return (
        <View className={"flex-1 bg-[#4D5B66]"}>
            {
                console.log(JSON.stringify(finalData))
            }
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
                                    coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                                    anchor={{x: 0.5, y: 0.5}}
                                    tracksViewChanges={false}
                                >
                                    <Image source={require("../assets/icons/dot_optimized.png")}
                                           style={{height: 15, width: 15}}
                                           onLayout={handleOnLayout}
                                           key={`key-${imageLoading}${curr.id}`}
                                    />
                                </Marker>
                            })
                        }

                        {
                            mapCenter ? (<Marker
                                coordinate={mapCenter.coords}
                                tracksViewChanges={false}
                                anchor={{x: 0.5, y: 0.5}}
                            >
                                <Image source={require("../assets/icons/center(1).png")}
                                       style={{height: 25, width: 25}}
                                       onLayout={handleOnLayout}
                                       key={`key-${imageLoading}`}/>
                            </Marker>) : null
                        }


                        {
                            lootboxMarkers.map((curr) => {
                                return <Marker
                                    onSelect={(event) => event.stopPropagation()}
                                    key={curr.id}
                                    coordinate={curr.coords}
                                    anchor={{x: 0.5, y: 0.5}}
                                    tracksViewChanges={false}
                                >
                                    <Image source={require("../assets/icons/lootbox_optimized(2).png")}
                                           style={{height: 25, width: 25}}
                                           onLayout={handleOnLayout}
                                           key={`key-${imageLoading}${curr.id}`}/>

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
                    {
                        loading ? <ActivityIndicator size={28}/> :
                            <FontAwesome5 name="cloud-upload-alt" size={28} color="#00ADB5"/>
                    }
                </TouchableOpacity>
            </View>
        </View>
    )
}