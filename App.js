 import React, {createRef, useEffect, useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from "react-native";
import MapView, {Marker, Polygon,} from 'react-native-maps';
import {BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {getCurrentPositionAsync, requestForegroundPermissionsAsync} from "expo-location";
import {AntDesign, Entypo, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialIcons} from "@expo/vector-icons";
import Constants from "expo-constants/src/Constants";
import Utils, {findMiddlePoint, getDistance, getRandomId} from "./src/utilities/Utils";

const App = () => {

    const [bottomSheetData, setBottomSheetData] = useState(null)
    const snapPoint = useMemo(() => ["30%", "55%", "75%"], [])
    const mapRef = createRef()
    const popupRef = createRef()
    const popupRef1 = createRef()
    const [userLocation, setUserLocation] = useState(null);
    const [idList, setIdList] = useState([])
    const [newLootboxItemValue, setNewLootboxItemValue] = useState(null)


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
        if (unassignedMarkers.length !== 0 || borderMarkers.length !== 0 || lootboxMarkers.length !== 0 || mapCenter != null || bottomSheetData != null) {
            setUnassignedMarkers([])
            setBorderMarkers([])
            setLootboxMarkers([])
            setMapCenter(null)
            setBottomSheetData(null)
        }
    }

    function addNewBorderMarker(newMarker) {
        try {
            if (borderMarkers.length < 4) {
                setBorderMarkers(prevZoneBorders => [...prevZoneBorders, newMarker]);
            } else {
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
        setBottomSheetData(obj)
        popupRef.current.present()
    }

    const [unassignedMarkers, setUnassignedMarkers] = useState([])
    const [borderMarkers, setBorderMarkers] = useState([])
    const [lootboxMarkers, setLootboxMarkers] = useState([])
    const [mapCenter, setMapCenter] = useState(null)



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
        try{
            mapRef.current.animateToRegion({
                longitude: userLocation.longitude,
                latitude: userLocation.latitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
            }, 1000)
        }catch (e){
            console.error(e)
        }
    }
    const [hasAnimatedToUserLoc, setHasAnimatedToUserLoc] = useState(false);
    useEffect(() => {
        if (userLocation && !hasAnimatedToUserLoc) {
            animateToUserLoc(0.05);
            setHasAnimatedToUserLoc(true);
        }
    }, [userLocation, hasAnimatedToUserLoc]);

    const onMapReady = () => {
        console.log("map ready")
    }
    const handleClose = () => {
        if (popupRef.current) {
            popupRef.current.dismiss();
        }
    };
    const polygonCoordinates = borderMarkers.map(point => point.coords);

    const openBottomSheetModal = () => {
        popupRef.current?.present();
    };

    const closeBottomSheetModal = () => {
        popupRef.current?.close();
    };
/*
    useEffect(() => {
        openBottomSheetModal()
    }, [bottomSheetData]);

 */


    const [brush, setBrush] = useState(false)

    const handleBrushPress = () => {
        setBrush(!brush)
    }

    /*
    useEffect(() => {
        popupRef1.current?.present();
    }, []);
     */
    const defaultBottomSheet = () => {
        return (
            <View className={"flex-1 flex-col items-center"}>

                <Text className={"text-4xl font-bold"}>Map creator</Text>
                <BottomSheetTextInput
                    placeholder="Type something here..."
                />

            </View>
        )
    }
    const removeMarkerButton = () => {
        setUnassignedMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setBorderMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setLootboxMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setBottomSheetData(null)

        for (let i = 0; i < idList.length; i++) {
            if (idList[i] == bottomSheetData.id) {
                idList.splice(i, 1);
                break;
            }
        }
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


    const addToLootbox = () =>{
        let currentLootbox = bottomSheetData

        let itemsArray = currentLootbox.items
        itemsArray.push({
            name: newLootboxItemValue
        })
        setNewLootboxItemValue(null)
    }

    const addItemComponent = () =>{
        return <View className={"flex-1 flex-row p-3"}>
            <BottomSheetTextInput value={newLootboxItemValue} placeholder={"Item name"}
            className={"bg-black p-3 text-xl"}></BottomSheetTextInput>
            <TouchableOpacity><Entypo name="check" size={26} color="black" /></TouchableOpacity>
        </View>
    }

    const markerBottomSheet = () => {
        return (
            <View className={"flex-col p-3 items-center"}>
                <Text className={"text-4xl font-black text-center capitalize mb-1"}>
                    {bottomSheetData.type+" "+bottomSheetData.id}</Text>
                <Entypo name="location" size={24} color="black" />
                <Text className={"text-lg text-center"}>
                    Latitude: {bottomSheetData ? bottomSheetData.coords.latitude : defaultBottomSheet()}</Text>
                <Text className={"text-lg text-center"}>
                    Longitude: {bottomSheetData ? bottomSheetData.coords.longitude : defaultBottomSheet()}</Text>

                {bottomSheetData.type == "lootbox" ? <View className={"min-w-[80%]"}>
                    <Text className={"text-3xl mt-4 text-center underline"}>Containments</Text>

                    {bottomSheetData.items.length != 0 ?<View className={"justify-center items-center"}>
                        {bottomSheetData.items.map((curr) => {
                            return <Text key={"item-"+curr.name}>{curr.name}</Text>
                        })}
                    </View> : <Text className={"text-red-700 text-center text-xl"}>Lootbox is empty</Text>
                }

                    <View className="flex-row items-center bg-gray-300 p-3 relative rounded-lg ">
                        <BottomSheetTextInput
                            value={newLootboxItemValue}
                            onChangeText={setNewLootboxItemValue}
                            placeholder="Item name"
                            maxLength={20}
                            className="flex-1 bg-white px-4 py-2 text-lg rounded w-max"
                        />
                        <TouchableOpacity
                            className={"bg-black rounded-full p-3  items-center absolute right-2"}
                            activeOpacity={1}
                            onPress={addToLootbox}>
                            <AntDesign name="plus" size={26} color="lime" />
                        </TouchableOpacity>
                    </View>


                </View> : null
                }
                <View className={"flex-row w-[60%] items-center justify-evenly mt-5"}>

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}
                        onPress={setAsLootbox}>
                        <Entypo name="box" size={30} color="white"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}
                        onPress={removeMarkerButton}>
                        <Feather name="trash-2" size={30} color="red"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={"bg-black rounded-full p-3"}
                        activeOpacity={1}>
                        <FontAwesome5 name="compress-arrows-alt" size={30} color="white"/>
                    </TouchableOpacity>



                </View>

            </View>
        )
    }

    return (
        <GestureHandlerRootView className={"flex-1"}>

            <BottomSheetModalProvider>

                <BottomSheetModal
                    style={{marginTop: Constants.statusBarHeight}}
                    ref={popupRef}
                    index={0}
                    snapPoints={snapPoint}
                    enablePanDownToClose={false}
                    className={"absolute z-20"}
                >

                    {bottomSheetData ? markerBottomSheet() : defaultBottomSheet()}

                </BottomSheetModal>

                <BottomSheetModal
                    ref={popupRef1}
                    index={1}
                    snapPoints={snapPoint}
                    enablePanDownToClose={true}

                >

                    <Text>Kodwajid</Text>

                </BottomSheetModal>

                <MapView
                    ref={mapRef}
                    initialRegion={userLocation}
                    showsUserLocation={true}
                    className={"flex-1 w-full h-full justify-center items-center relative z-0"}
                    onPress={handleMapPress}
                    onMapReady={onMapReady}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    showsPointsOfInterest={false}
                    customMapStyle={customMapStyle}
                    userInterfaceStyle={"dark"}
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
                                key={curr.id}
                                coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                                onPress={() => handlePopup(curr)}
                                anchor={{x: 0.5, y: 0.5}}


                            >
                                <FontAwesome5 name="question-circle" size={26} color="black"/>


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
                            >
                                <FontAwesome name="dot-circle-o" size={20} color="red"/>
                            </Marker>
                        })
                    }

                    {
                        mapCenter ? <Marker
                            coordinate={mapCenter.coords}
                            onPress={() => handlePopup(mapCenter)}
                        >
                            <FontAwesome5 name="compress-arrows-alt" size={24} color="black"/>
                        </Marker> : null
                    }


                    {
                        lootboxMarkers.map((curr) => {
                            return <Marker
                                key={curr.id}
                                coordinate={curr.coords}
                                onPress={() => handlePopup(curr)}
                                anchor={{x: 0.5, y: 0.5}}>

                                <Entypo name="box" size={24} color="black"/>
                            </Marker>
                        })
                    }


                </MapView>

                <TouchableOpacity
                    className={"absolute top-16 left-4 bg-white rounded-full p-3 z-10"}
                    activeOpacity={1}
                >
                    <Entypo name="menu" size={30} color="black"/>
                </TouchableOpacity>

                <TouchableOpacity
                    className={"absolute top-16 right-4 bg-white rounded-full p-3 z-10"}
                    activeOpacity={1}
                    onPress={() => animateToUserLoc(0.009)}
                >
                    <MaterialIcons name="my-location" size={30} color="black"/>
                </TouchableOpacity>

                <TouchableOpacity
                    className={"absolute top-32 right-4 bg-white rounded-full p-3 z-10"}
                    onPress={handleBrushPress}
                    activeOpacity={1}
                >
                    <FontAwesome name="paint-brush" size={30} color={brush ? "blue" : "black"}/>
                </TouchableOpacity>

                <TouchableOpacity
                    className={"absolute top-48 right-4 bg-red-500 rounded-full p-3 z-10"}
                    onPress={handleReset}
                    activeOpacity={1}
                >
                    <Ionicons name="reload" size={30} color="white"/>
                </TouchableOpacity>
            </BottomSheetModalProvider>




        </GestureHandlerRootView>
    );
};

const customMapStyle = [
    {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'transit.station',
        elementType: 'labels',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
];
export default App;