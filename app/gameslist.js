import {ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {customMapStyle} from "./styles/mapStyles";
import MapView, {Marker, Polygon, PROVIDER_GOOGLE} from "react-native-maps";
import {AntDesign} from "@expo/vector-icons";
import {useEffect, useState} from "react"
import {getAPIUrlFromStorage, getInitialRegion, getTokenFromStorage, showAPIConfigAlert} from "./Utils";
import {useNavigation} from "@react-navigation/native";

export default function GameList() {
    const navigation = useNavigation()
    const [data, setData] = useState([[], [], [], []])


    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const fetchCreateLobby = async (gameId) => {
        const API_BASE_URL = await getAPIUrlFromStorage();
        if (API_BASE_URL == null) {
            showAPIConfigAlert(navigation);
            return; // Exit the function if the API URL is missing
        }
        const token = await getTokenFromStorage();

        try {
            const payload = {gameId: gameId};

            const response = await fetch(API_BASE_URL + ":8082/createlobby", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 201) { // Corrected status code
                const lobbyCode = await response.json();
                navigation.navigate("Game", {
                    gameId: gameId,
                    lobbyCode: lobbyCode
                });
            } else {
                const errorData = await response;
                Alert.alert(
                    "Server error",
                    errorData.message || "Unknown error",
                    [{text: "OK"}]
                );
            }

        } catch (error) {
            console.error(error);
            Alert.alert(
                "Unexpected error",
                error.message + ": The API endpoint is down or has wrong configuration",
                [{text: "OK"}, {
                    text: "configure", onPress: () => navigation.navigate("Settings")
                }]
            );
        }
    };


    const fetchData = async () => {
        const API_BASE_URL = await getAPIUrlFromStorage();
        if (API_BASE_URL == null) {
            showAPIConfigAlert(navigation);
            return; // Exit the function if the API URL is missing
        }
        const token = await getTokenFromStorage();

        try {
            const response = await fetch(API_BASE_URL + ":8082/gamelist", {
                method: "GET",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("data retrieved");
                console.log("data: " + JSON.stringify(data));
                setData(data);
            } else {
                const errorData = await response;
                Alert.alert(
                    "Server error",
                    errorData.message || "Unknown error",
                    [{text: "OK"}]
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert(
                "Network error",
                error.message + ": The API endpoint is down or has wrong configuration",
                [{text: "OK"}, {
                    text: "configure", onPress: () => navigation.navigate("Settings")
                }]
            );
        }
    };


    useEffect(() => {
        onRefresh()
    }, []);

    const gameData = data[0]
    const borderData = data[1]
    const lootboxData = data[2]
    const middlePoints = data[3]

    const [imageLoading, setImageLoading] = useState(false)

    const handleOnLayout = () => {
        setImageLoading(true)
    }

    const feed = () => {
        {
            console.log("gamedata: " + typeof gameData)
        }
        {
            console.log("data: " + typeof data)
        }
        if (data[0].length > 0) {
            return gameData.map((currGd, index) => {
                return <View className={"bg-[#4D5B66] p-1 rounded-xl mb-5"} key={index}>
                    <View className={"flex-1"} style={{borderRadius: 10, overflow: "hidden"}}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            customMapStyle={customMapStyle}
                            style={{height: 200}}
                            initialRegion={
                                getInitialRegion(borderData.filter((curr) => curr.gameId === currGd.gameId))
                            }

                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                            toolbarEnabled={false}
                            moveOnMarkerPress={false}

                        >

                            {

                                <Polygon
                                    coordinates={polygonCoordinates(borderData.filter((curr) => curr.gameId === currGd.gameId))}
                                    fillColor="rgba(0,0,0,0)"
                                    strokeColor="rgba(255,0,0,1)"
                                    strokeWidth={3}
                                    onPress={(event) => event.stopPropagation()}
                                />


                            }

                            {
                                borderData.map((curr) => {
                                    if (curr.gameId === currGd.gameId) {
                                        return <Marker
                                            key={curr.id}
                                            coordinate={{
                                                latitude: curr.coords.latitude,
                                                longitude: curr.coords.longitude
                                            }}
                                            anchor={{x: 0.5, y: 0.5}}
                                            onPress={(event) => event.stopPropagation()}
                                            tracksViewChanges={false}
                                        >
                                            <Image source={require("../assets/icons/dot_optimized.png")}
                                                   style={{height: 15, width: 15}}
                                                   onLayout={handleOnLayout}
                                                   key={`key-${imageLoading}${curr.id}`}
                                            />

                                        </Marker>
                                    }
                                })
                            }

                            {
                                <Marker
                                    coordinate={{
                                        latitude: middlePoints[index].coordinates.latitude,
                                        longitude: middlePoints[index].coordinates.longitude
                                    }}
                                    tracksViewChanges={false}
                                >
                                    <Image source={require("../assets/icons/center(1).png")}
                                           style={{height: 25, width: 25}}
                                           onLayout={handleOnLayout}
                                           key={`key-${imageLoading}`}/>
                                </Marker>

                            }

                            {
                                lootboxData.map((curr) => {
                                    if (curr.gameId === currGd.gameId) {
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
                                    }
                                })
                            }
                        </MapView>
                        <View className={"flex-row justify-between p-2  mt-1"}>
                            <View>
                                <Text className={"text-2xl font-azonix text-white"}>{currGd.gameName}</Text>
                                <Text className={"font-azonix text-white"}>{currGd.gameId}</Text>
                            </View>
                            <TouchableOpacity
                                className={"bg-transparent border-2 border-[#00ADB5] px-5 rounded-xl flex-row p-2 "}
                                onPress={() => fetchCreateLobby(currGd.gameId)}
                            >
                                <AntDesign name="arrowright" size={24} color="#00ADB5"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            })
        } else {
            return refreshing ? <View className={"items-center"}>
                    <ActivityIndicator size={40} color={"#00ADB5"}/>
                </View> :
                <Text className={"text-3xl font-azonix text-red-600 text-center"}>An unexpected error has occurred. The
                    server might be experiencing some issues.</Text>
        }
    }
    const polygonCoordinates = (data) => data.map(point => point.coords);
    return (
        <ScrollView className={"flex-1 p-1 bg-[#393E46]"} style={{flex: 1}} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
        }>
            {
                feed()
            }
        </ScrollView>
    )
}
