import React, {createRef, useEffect, useMemo, useState} from 'react';
import {Alert, Image, Text, TouchableOpacity, View} from "react-native";
import MapView, {Marker, Polygon, PROVIDER_GOOGLE,} from 'react-native-maps';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
    BottomSheetTextInput
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {getCurrentPositionAsync, requestForegroundPermissionsAsync} from "expo-location";
import {
    AntDesign,
    Entypo,
    Feather,
    FontAwesome,
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons
} from "@expo/vector-icons";
import {findMiddlePoint, getDistance, getRandomId} from "./Utils";
import {useNavigation} from "@react-navigation/native";
import {customMapStyle} from "./styles/mapStyles";

export default function Editor() {

    const [bottomSheetData, setBottomSheetData] = useState(null)
    const snapPoint = useMemo(() => ["30%", "50%", "75%"], [])
    const mapRef = createRef()
    const popupRef = createRef()
    const [userLocation, setUserLocation] = useState(null);
    const [idList, setIdList] = useState([])
    const [newLootboxItemValue, setNewLootboxItemValue] = useState(null)
    const [borderEngine, setBorderEngine] = useState(false)
    const navigation = useNavigation()

    const handleMapPress = (e) => {
        const coords = e.nativeEvent.coordinate

        if (brush) {
            addNewBorderMarker({
                id: getRandomId(idList),
                coords: coords,
                type: "border"
            })
        } else {
            setUnassignedMarkers((prevUnassignedMarkers) => {
                const newElement = {
                    id: getRandomId(idList),
                    coords: coords,
                    type: "unassigned"
                };
                return [...prevUnassignedMarkers, newElement];
            });
        }

    }


    const handleReset = () => {
        try {
            if (unassignedMarkers.length !== 0 || borderMarkers.length !== 0 || lootboxMarkers.length !== 0 || mapCenter != null || bottomSheetData != null) {
                closeBottomSheetModal()
                setUnassignedMarkers([])
                setBorderMarkers([])
                setLootboxMarkers([])
                setMapCenter(null)
                setBottomSheetData(null)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const getData = () => {
        return [borderMarkers, lootboxMarkers, [mapCenter]]
    }

    function addNewBorderMarker(newMarker) {
        try {
            if (borderMarkers.length < 4) {
                setBorderMarkers(prevZoneBorders => [...prevZoneBorders, newMarker]);
            } else {
                if (!borderEngine) {
                    return setBorderMarkers(prevZoneBorders => [...prevZoneBorders, newMarker]);
                }
                let bestAverageDistance = Infinity;
                let bestIndex = -1;

                for (let i = 0; i < borderMarkers.length; i++) {
                    const nextIndex = (i + 1) % borderMarkers.length;
                    const currentPoint = borderMarkers[i];
                    const nextPoint = borderMarkers[nextIndex];

                    if (!currentPoint || !nextPoint) {
                        continue;
                    }

                    const avgDistance = (getDistance(currentPoint.coords, newMarker.coords)
                        + getDistance(nextPoint.coords, newMarker.coords)) / 2;

                    if (avgDistance < bestAverageDistance) {
                        bestAverageDistance = avgDistance;
                        bestIndex = i;
                    }
                }

                setBorderMarkers(prevState => {
                    const updatedCoords = [...prevState];
                    if (bestIndex !== -1) {
                        updatedCoords.splice(bestIndex + 1, 0, newMarker);
                    } else {
                        updatedCoords.push(newMarker);
                    }
                    return updatedCoords;
                });
            }
        } catch (e) {
            console.log(e);
        }
    }


    const handlePopup = (obj) => {
        popupRef.current?.present()
        setBottomSheetData(obj)
    }

    const [unassignedMarkers, setUnassignedMarkers] = useState([])
    const [borderMarkers, setBorderMarkers] = useState([])
    const [lootboxMarkers, setLootboxMarkers] = useState([])
    const [mapCenter, setMapCenter] = useState(null)

    const confirmGame = () => {
        if (borderMarkers.length >= 3) {
            navigation.navigate("GC", getData())
        } else {
            Alert.alert(
                "Error",
                "The game must contain at least 3 border markers",
                [{text: "OK"}]
            );
        }
    }
    useEffect(() => {
        if (borderMarkers.length >= 3) {
            setMapCenter(findMiddlePoint(borderMarkers, idList))
        }
    }, [borderMarkers]);

    const requestLocationPermission = async () => {
        const {status} = await requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn('Location permission not granted');
            return;
        }

        const location = await getCurrentPositionAsync({});
        setUserLocation(location.coords);
        console.log(userLocation)
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const animateToUserLoc = (delta) => {
        try {
            mapRef.current.animateToRegion({
                longitude: userLocation.longitude,
                latitude: userLocation.latitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
            }, 1000)
        } catch (e) {
            console.error(e)
        }
    }

    const toggleBorderEngine = () => {
        setBorderEngine(!borderEngine)
    }

    const [hasAnimatedToUserLoc, setHasAnimatedToUserLoc] = useState(false);
    useEffect(() => {
        if (userLocation && !hasAnimatedToUserLoc) {
            animateToUserLoc(0.05);
            setHasAnimatedToUserLoc(true);
        }
    }, [userLocation, hasAnimatedToUserLoc]);


    const polygonCoordinates = borderMarkers.map(point => point.coords);

    const openBottomSheetModal = () => {
        popupRef.current?.present();
    };

    const closeBottomSheetModal = () => {
        popupRef.current?.close();
    };


    const [brush, setBrush] = useState(false)

    const handleBrushPress = () => {
        setBrush(!brush)
    }

    const removeMarkerButton = () => {
        setUnassignedMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setBorderMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setLootboxMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setBottomSheetData(null)
        if (mapCenter && mapCenter.id == bottomSheetData.id) {
            setMapCenter(null)
        }

        for (let i = 0; i < idList.length; i++) {
            if (idList[i] == bottomSheetData.id) {
                idList.splice(i, 1);
                break;
            }
        }
        popupRef.current?.close()
    };

    const setAsLootbox = () => {
        setUnassignedMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setLootboxMarkers((prevState) => {
            const newElement = {
                id: bottomSheetData.id,
                coords: bottomSheetData.coords,
                type: "lootbox",
                items: []
            };
            setBottomSheetData(newElement)
            return [...prevState, newElement];
        });
    }
    const setAsMiddlePoint = () => {
        setUnassignedMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        const newMidPoint = {
            type: "mapCenter",
            id: getRandomId(idList),
            coords: bottomSheetData.coords
        }
        setMapCenter(newMidPoint)
        setBottomSheetData(newMidPoint)
    }


    const addToLootbox = () => {
        if (newLootboxItemValue == null) {
            return
        }
        let currentLootbox = bottomSheetData

        let itemsArray = currentLootbox.items
        itemsArray.push({
            name: newLootboxItemValue
        })
        setNewLootboxItemValue(null)
        console.log(currentLootbox.items)
    }


    const removeFromLootbox = (name) => {
        setLootboxMarkers((prevMarkers) => {
            const updatedMarkers = prevMarkers.map((marker) => {
                if (marker.id === bottomSheetData.id) {
                    const updatedItems = marker.items.filter(item => item.name !== name);
                    bottomSheetData.items = updatedItems
                    return {...marker, items: updatedItems};
                }
                return marker;
            });
            console.log("Updated lootbox markers:", updatedMarkers);

            setLootboxMarkers(updatedMarkers);

            return updatedMarkers;
        });
        console.log("Item " + name + " removed from lootbox");
    };


    const addItemComponent = () => {
        return <View className={"flex-1 flex-row p-3"}>
            <BottomSheetTextInput value={newLootboxItemValue} placeholder={"Item name"}
                                  className={"bg-black p-3 text-xl"}></BottomSheetTextInput>
            <TouchableOpacity><Entypo name="check" size={26} color="black"/></TouchableOpacity>
        </View>
    }

    const renderButtons = () => {
        switch (bottomSheetData.type) {
            case "mapCenter":
                return <View className={"flex-row w-[60%]  items-center justify-evenly my-3"}>

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}
                        onPress={removeMarkerButton}>
                        <Feather name="trash-2" size={30} color="red"/>
                    </TouchableOpacity>
                </View>

            case "border":
                return <View className={"flex-row w-[60%]  items-center justify-evenly my-3"}>

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}
                        onPress={removeMarkerButton}>
                        <Feather name="trash-2" size={30} color="red"/>
                    </TouchableOpacity>
                </View>

            case "lootbox":
                return <View className={"flex-row w-[60%]  items-center justify-evenly my-3"}>

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}
                        onPress={removeMarkerButton}>
                        <Feather name="trash-2" size={30} color="red"/>
                    </TouchableOpacity>

                </View>

            case "unassigned":
                return <View className={"flex-row w-[60%]  items-center justify-evenly my-3"}>

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}
                        onPress={removeMarkerButton}>
                        <Feather name="trash-2" size={30} color="red"/>
                    </TouchableOpacity>

                    {
                        bottomSheetData.type == "lootbox" ? null :
                            <TouchableOpacity
                                className={"bg-black rounded-full p-3"}
                                activeOpacity={1}
                                onPress={setAsLootbox}>
                                <Entypo name="box" size={30} color="white"/>
                            </TouchableOpacity>
                    }

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}
                        onPress={setAsMiddlePoint}
                    >

                        <FontAwesome5 name="compress-arrows-alt" size={30} color="white"/>
                    </TouchableOpacity>
                </View>
        }
    }


    const markerBottomSheet = () => {
        return (
            <View className={"flex-1 flex-col p-2 items-center"}>
                <Text className={"text-4xl text-center font-azonix text-white"}>
                    {bottomSheetData.type + " " + bottomSheetData.id}</Text>
                <View className={"items-center"}>
                    <Text className={"p-1 font-azonix text-gray-400"}>Lat {bottomSheetData.coords.latitude}</Text>
                    <Text className={"p-1 font-azonix text-gray-400"}>Lng {bottomSheetData.coords.longitude}</Text>
                </View>

                {
                    renderButtons()
                }

                {bottomSheetData.type == "lootbox" ?
                    <View className={""}>
                        <BottomSheetScrollView
                            contentContainerStyle={{
                                alignItems: "center",
                                flexDirection: "row"
                            }}>
                            <View className={"w-full"}>
                                {
                                    bottomSheetData.items.map((curr, index) => {
                                        return <View key={index}
                                                     className={"bg-[#393E46] flex-row items-center p-2 rounded-xl mb-1"}>
                                            <View className={"flex-1 flex-row items-center mr-auto"}>
                                                <Feather name="box" size={26} color="#00ADB5" className={"mr-1"}/>
                                                <Text className={"flex-1 text-white capitalize font-bold text-lg"}
                                                      ellipsizeMode={"tail"} numberOfLines={1}>{curr.name}</Text>
                                            </View>
                                            <View>
                                                <TouchableOpacity onPress={() => removeFromLootbox(curr.name)}>
                                                    <FontAwesome name="remove" size={28} color="#FF0000"/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    })
                                }
                                <View className={"mt-5 bg-[#393E46] flex-row rounded-xl p-2 border-green-400 border-2"}>
                                    <Feather name="box" size={26} color="#00ADB5" className={"mr-1"}/>
                                    <BottomSheetTextInput
                                        value={newLootboxItemValue}
                                        onChangeText={setNewLootboxItemValue}
                                        placeholder="New item name"
                                        maxLength={50}
                                        className={"flex-1 text-white"}
                                    />
                                    <TouchableOpacity
                                        className=""
                                        activeOpacity={1}
                                        onPress={addToLootbox}>
                                        <AntDesign name="plus" size={26} color="lime"/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </BottomSheetScrollView>
                    </View> : null
                }
            </View>
        )
    }


    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <BottomSheetModalProvider>
                <BottomSheetModal
                    ref={popupRef}
                    index={0}
                    snapPoints={snapPoint}
                    enablePanDownToClose={true}
                    backgroundStyle={{
                        backgroundColor: "#222831"
                    }}
                    containerStyle={{
                        zIndex: 11
                    }}

                >

                    {bottomSheetData ? markerBottomSheet() : () => closeBottomSheetModal}

                </BottomSheetModal>


                <MapView
                    provider={PROVIDER_GOOGLE}
                    ref={mapRef}
                    showsUserLocation={true}
                    onPress={handleMapPress}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    showsPointsOfInterest={false}
                    customMapStyle={customMapStyle}
                    userInterfaceStyle={"dark"}
                    toolbarEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}


                    style={{
                        flex: 1,
                    }}
                >

                    {
                        borderMarkers.length > 0 &&
                        <Polygon
                            coordinates={polygonCoordinates}
                            fillColor="rgba(0,0,0,0)"
                            strokeColor="rgba(255,0,0,1)"
                            strokeWidth={3}
                        />


                    }

                    {
                        unassignedMarkers.map((curr) => {
                            return <Marker
                                index={curr.id}
                                coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                                onPress={() => handlePopup(curr)}
                                anchor={{x: 0.5, y: 0.5}}
                                tracksViewChanges={false}

                            >
                                <Image source={require('../assets/icons/questionmark_optimized.png')}
                                       style={{height: 25, width: 25}}/>
                            </Marker>
                        })
                    }

                    {
                        borderMarkers.map((curr) => {
                            return <Marker
                                key={curr.id}
                                coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                                onPress={() => handlePopup(curr)}
                                anchor={{x: 0.5, y: 0.5}}
                                tracksViewChanges={false}

                            >
                                <Image source={require("../assets/icons/dot_optimized.png")}
                                       style={{height: 25, width: 25}}/>
                            </Marker>
                        })
                    }

                    {
                        mapCenter ? <Marker
                            coordinate={mapCenter.coords}
                            onPress={() => handlePopup(mapCenter)}
                            anchor={{x: 0.5, y: 0.5}}
                            tracksViewChanges={false}
                        >
                            <Image source={require("../assets/icons/center(1).png")} style={{height: 25, width: 25}}/>
                        </Marker> : null
                    }


                    {
                        lootboxMarkers.map((curr) => {
                            return <Marker
                                key={curr.id}
                                coordinate={curr.coords}
                                onPress={() => handlePopup(curr)}
                                anchor={{x: 0.5, y: 0.5}}
                                tracksViewChanges={false}
                            >

                                <Image source={require("../assets/icons/lootbox_optimized(2).png")}
                                       style={{height: 25, width: 25}}/>

                            </Marker>
                        })
                    }


                </MapView>


                <TouchableOpacity
                    className={"absolute top-4 right-4 bg-[#222831] rounded-full p-3 z-10 "}
                    activeOpacity={1}
                    onPress={() => animateToUserLoc(0.009)}
                >
                    <MaterialIcons name="my-location" size={30} color="white"/>
                </TouchableOpacity>

                <TouchableOpacity
                    className={"absolute top-20 right-4 bg-[#222831] rounded-full p-3 z-10"}
                    onPress={handleBrushPress}
                    activeOpacity={1}
                >
                    <FontAwesome name="paint-brush" size={30} color={brush ? "blue" : "white"}/>
                </TouchableOpacity>

                <TouchableOpacity
                    className={"absolute top-36 right-4 bg-[#222831] rounded-full p-3 z-10"}
                    onPress={toggleBorderEngine}
                    activeOpacity={1}
                >
                    <MaterialCommunityIcons name="transit-connection-horizontal" size={30}
                                            color={borderEngine ? "blue" : "white"}/>
                </TouchableOpacity>
                <TouchableOpacity
                    className={"absolute top-52 right-4 bg-red-500 rounded-full p-3 z-10"}
                    onPress={handleReset}
                    activeOpacity={1}
                >
                    <Ionicons name="reload" size={30} color="white"/>
                </TouchableOpacity>


                <TouchableOpacity
                    className={(borderMarkers.length >= 3 ? "bg-green-500" : "bg-gray-400") + " absolute top-4 left-4 bg-gray-300 rounded-full p-3 z-10"}
                    onPress={confirmGame}
                    activeOpacity={1}
                >
                    <Feather name="check" size={30} color="white"/>
                </TouchableOpacity>
            </BottomSheetModalProvider>

        </GestureHandlerRootView>
    );
};
