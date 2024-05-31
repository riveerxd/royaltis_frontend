import React, {createRef, useEffect, useMemo, useState} from "react";
import {io} from "socket.io-client";
import {ActivityIndicator, Alert, Image, Text, TouchableOpacity, View} from "react-native"
import MapView, {Marker, Polygon, PROVIDER_GOOGLE} from "react-native-maps";
import {Feather, FontAwesome} from "@expo/vector-icons";
import {useNavigation, useNavigationState, useRoute} from "@react-navigation/native";
import {getAPIUrlFromStorage, getInitialRegion, getTokenFromStorage, showAPIConfigAlert} from "./Utils";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {customMapStyle} from "./styles/mapStyles";
import * as Location from "expo-location"

import {useSelector} from "react-redux";

export default function Game() {
    const route = useRoute()
    const recievedData = route.params
    const navigation = useNavigation()

    const [currentBorders, setCurrentBorders] = useState([])
    const [currentLootboxes, setCurrentLootboxes] = useState([])
    const [removedItems, setRemovedItems] = useState([])
    const mapRef = createRef()
    const modalRef = createRef()
    const snapPoints = useMemo(() => ["30%", "50%", "75%"], [])
    const [modalData, setModalData] = useState({})
    const [data, setData] = useState({})
    const [location, setLocation] = useState(null);
    const isLoggedIn = useSelector(state => state.auth.loggedIn)


    useEffect(() => {

        if (data.borders) {
            setCurrentBorders(data.borders)
            setCurrentLootboxes(data.lootboxes)
        }
    }, [data]);


    useEffect(() => {
        fetchInitData()
    }, []);

    const fetchInitData = async () => {
        const API_BASE_URL = await getAPIUrlFromStorage();
        if (API_BASE_URL == null) {
            showAPIConfigAlert(navigation);
            return; // Exit the function if the API URL is missing
        }

        const token = await getTokenFromStorage();

        try {
            const payload = {
                gameId: recievedData.gameId
            };

            const response = await fetch(API_BASE_URL + ":8082/getinitialdata", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setData(data);
            } else {
                const errorData = await response; // Try to get error data from server
                console.error(errorData);
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


    const [socket, setSocket] = useState(null)
    const fetchItemDelete = (obj) => {
        if (socket) {
            socket.emit("item_delete", obj)
            //setRemovedItems([...removedItems, obj])
            console.log("item deleted: " + JSON.stringify(obj))
        } else {
            console.log("socket is null")
        }
    }

    const deleteItems = (data) => {
        const newLootboxes = currentLootboxes.map((curr) => {
            return {
                ...curr,
                items: curr.items.filter((item) => {
                    return !data.includes(item.itemId)
                })
            }
        })
        setCurrentLootboxes(newLootboxes)
    }

    const {routes, index} = useNavigationState(state => state);
    const currentRoute = routes[index - 1];
    useEffect(() => {
        (async () => {
            try {
                const APIUrl = await getAPIUrlFromStorage();
                const newSocket = io(APIUrl + ":9090", {
                    extraHeaders: {
                        "X-LobbyCode": recievedData.lobbyCode
                    },
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                });


                newSocket.on('connect_error', (error) => {
                    console.error('Socket.IO connection error:', error);
                    console.debug('Connection details:', {
                        APIUrl,
                        recievedData,
                        socketId: newSocket.id
                    });
                });

                newSocket.on('connect_timeout', (timeout) => {
                    console.warn('Socket.IO connection timed out:', timeout);
                });

                newSocket.on('error', (error) => {
                    console.error('Socket.IO general error:', error);
                });

                newSocket.on('reconnect', (attemptNumber) => {
                    console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
                });

                newSocket.on('reconnect_attempt', (attemptNumber) => {
                    console.log('Socket.IO attempting to reconnect...', attemptNumber);
                });

                newSocket.on('reconnect_error', (error) => {
                    console.error('Socket.IO reconnection error:', error);
                });

                newSocket.on('reconnect_failed', () => {
                    console.error('Socket.IO could not reconnect. Giving up.');
                });

                newSocket.on('borders', (data) => {
                    console.log("data: " + data)
                    setCurrentBorders(JSON.parse(data));
                });

                newSocket.on("removed_items", (data) => {
                    console.log("recieved deleted items: " + data)
                    setRemovedItems(JSON.parse(data))
                });

                newSocket.on("disconnect", (reason) => {
                    if (!(currentRoute.name === "GL")) {
                        // ... your existing logic here
                    }
                });

                setSocket(newSocket)

                let isAlertShown = false;

                const checkConnectionInterval = setInterval(() => {
                    if (!newSocket.connected && !isAlertShown) {
                        isAlertShown = true;
                        Alert.alert(
                            "Disconnected from server",
                            "The connection to the server was lost",
                            [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        navigation.reset({
                                            index: 0,
                                            routes: [{name: "Home"}],
                                        });
                                        isAlertShown = false;
                                    },
                                },
                            ]
                        );
                    }
                }, 5000);

                return () => {
                    clearInterval(checkConnectionInterval);
                    newSocket.disconnect();
                    setSocket("disconnected");
                };
            } catch (error) {
                console.error("Error in useEffect:", error);
                // Handle the error appropriately (e.g., display an error message to the user)
            }
        })();
    }, []);

    const LOCATION_TASK_NAME = 'background-location-task';
    useEffect(() => {
        // Request permissions and start background task
        const startLocationUpdates = async () => {
            let {status} = await Location.requestBackgroundPermissionsAsync();
            if (status === 'granted') {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    deferredUpdatesInterval: 5000,
                    foregroundService: {
                        notificationTitle: 'Royaltis',
                        notificationBody: 'Tracking location in the background'
                    }
                });
            } else {
                console.error('Location permission not granted');
            }
        };

        startLocationUpdates();

        // Optional: Stop updates when component unmounts
        return () => {
            Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        };
    }, []);

    const polygonCoordinates = () => {
        return currentBorders.map(point => point.coords)

    }

    const handleModalPress = (obj) => {
        modalRef.current.present()
        setModalData(obj)
    }


    const containsItem = (id) => {
        for (const curr of removedItems) {
            console.log("comparing " + curr.itemId + " with " + id)
            if (curr.itemId == id) {
                console.log("true")
                return true
            }
        }
        console.log("false")
        return false
    }

    const modalContents = () => {
        const items = () => {
            let itemCount = 0
            const countActualItems = modalData.items.forEach((curr) => {
                if (!containsItem(curr.itemId)) {
                    itemCount++;
                }
            })
            if (itemCount === 0) {
                return <View className={"items-center pt-3"}>
                    <Text className={"font-azonix text-red-500 text-3xl"}>Lootbox is empty</Text>
                </View>
            }
            return modalData.items.map((curr, index) => {
                console.log(containsItem(curr.itemId))
                console.log("modal: " + JSON.stringify(modalData))
                console.log("currentLootboxes: " + JSON.stringify(currentLootboxes))
                if (containsItem(curr.itemId)) {
                    return null
                } else {
                    return <View key={index}
                                 className={"bg-[#393E46] flex-row items-center p-2 rounded-xl mb-1"}>
                        <View className={"flex-1 flex-row items-center mr-auto"}>
                            <Feather name="box" size={26} color="#00ADB5" className={"mr-1"}/>
                            <Text className={"flex-1 text-white capitalize font-bold text-lg"}
                                  ellipsizeMode={"tail"} numberOfLines={1}>{curr.name}</Text>
                        </View>
                        <View>
                            <TouchableOpacity
                                onPress={() => fetchItemDelete(curr)}
                            >
                                <FontAwesome name="remove" size={28} color="#FF0000"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            })
        }

        return (
            <View className={"flex-1 flex-col items-center"}
            >
                {
                    console.log("modal data: " + JSON.stringify(modalData))
                }
                <Text className={"font-azonix text-3xl text-white"}>Lootbox {modalData.id}</Text>
                <View className={"items-center"}>
                    <Text className={"p-1 font-azonix text-gray-400"}>Lat {modalData.coords.latitude}</Text>
                    <Text className={"p-1 font-azonix text-gray-400"}>Lng {modalData.coords.longitude}</Text>
                </View>

                <BottomSheetScrollView
                    contentContainerStyle={{
                        alignItems: "center",
                        flexDirection: "row"
                    }}>
                    <View className={"w-full p-3"}>
                        {
                            items()
                        }
                    </View>
                </BottomSheetScrollView>
            </View>
        )
    }
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <View className={"flex-row bg-[#222831] p-2 rounded-b-xl"}>
                <Text className={"flex-1 text-white text-2xl font-azonix"}>Lobby {recievedData.lobbyCode} on
                    game {recievedData.gameId}</Text>

                <TouchableOpacity style={{display: isLoggedIn ? "block" : "none"}}>
                    <FontAwesome name="play" size={30} color="#00ADB5" onPress={() => navigation.navigate("StartGame", {
                        gameId: recievedData.gameId,
                        lobbyCode: recievedData.lobbyCode
                    })}/>
                </TouchableOpacity>

            </View>
            <BottomSheetModalProvider>
                <BottomSheetModal
                    ref={modalRef}
                    snapPoints={snapPoints}
                    index={0}
                    enablePanDownToClose={true}
                    backgroundStyle={{
                        backgroundColor: "#222831"
                    }}
                    containerStyle={{
                        zIndex: 1
                    }}
                >
                    {modalContents}
                </BottomSheetModal>

                {data.borders ?
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        ref={mapRef}
                        initialRegion={getInitialRegion(data.borders)}
                        toolbarEnabled={false}
                        showsCompass={false}
                        showsMyLocationButton={false}
                        showsUserLocation={true}
                        showsPointsOfInterest={false}
                        userInterfaceStyle={"dark"}
                        style={{flex: 1, marginTop: -10, zIndex: -1}}
                        customMapStyle={customMapStyle}
                    >
                        {
                            currentBorders.length > 0 &&
                            <Polygon
                                coordinates={polygonCoordinates()}
                                fillColor="rgba(0,0,0,0)"
                                strokeColor="rgba(255,0,0,1)"
                                strokeWidth={3}
                            />


                        }
                        {
                            currentBorders && currentBorders.length != 0 && currentBorders ? currentBorders.map((curr) => {
                                return <Marker
                                    key={curr.id}
                                    coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                                    anchor={{x: 0.5, y: 0.5}}
                                    tracksViewChanges={false}

                                >
                                    <Image source={require("../assets/icons/dot_optimized.png")}
                                           style={{height: 25, width: 25}}/>

                                </Marker>
                            }) : ""
                        }

                        {
                            <Marker
                                coordinate={{
                                    latitude: data.middlePoint.coordinates.latitude,
                                    longitude: data.middlePoint.coordinates.longitude
                                }}
                                anchor={{
                                    x: 0.5, y: 0.5
                                }}
                                tracksViewChanges={false}
                            >
                                <Image source={require("../assets/icons/center(1).png")}
                                       style={{height: 25, width: 25}}/>

                            </Marker>
                        }

                        {

                            currentLootboxes.map((curr) => {
                                return <Marker
                                    onSelect={(event) => event.stopPropagation()}
                                    key={curr.id}
                                    coordinate={curr.coords}
                                    anchor={{x: 0.5, y: 0.5}}
                                    onPress={() => handleModalPress(curr)}
                                    tracksViewChanges={false}
                                >
                                    <Image source={require("../assets/icons/lootbox_optimized(2).png")}
                                           style={{height: 25, width: 25}}/>

                                </Marker>
                            })

                        }

                    </MapView> : <ActivityIndicator size={28}/>
                }

            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );


}
