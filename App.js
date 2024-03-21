import React, {createRef, useEffect, useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from "react-native";
import MapView, {Marker, Polygon,} from 'react-native-maps';
import {BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {getCurrentPositionAsync, requestForegroundPermissionsAsync} from "expo-location";
import {AntDesign, Entypo, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialIcons} from "@expo/vector-icons";
import Constants from "expo-constants/src/Constants";
import Utils, {findMiddlePoint, getDistance, getRandomId} from "./src/utilities/Utils";
import moveBorder from "./src/utilities/ZoneManager"

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
    const [borderMarkers, setBorderMarkers] = useState([{
        "coords": {
            "latitude": 50.074474871857205,
            "longitude": 14.425810240209103
        }, "id": 466, "type": "border"
    }, {
        "coords": {"latitude": 50.073860106329974, "longitude": 14.426557570695879},
        "id": 485,
        "type": "border"
    }, {
        "coords": {"latitude": 50.073103312041745, "longitude": 14.42719928920269},
        "id": 551,
        "type": "border"
    }, {
        "coords": {"latitude": 50.071726548443856, "longitude": 14.427833631634712},
        "id": 909,
        "type": "border"
    }, {
        "coords": {"latitude": 50.07136761076934, "longitude": 14.424742050468922},
        "id": 31,
        "type": "border"
    }, {
        "coords": {"latitude": 50.07270651208333, "longitude": 14.424573741853239},
        "id": 700,
        "type": "border"
    }, {
        "coords": {"latitude": 50.07338498637528, "longitude": 14.424619674682617},
        "id": 528,
        "type": "border"
    }, {"coords": {"latitude": 50.07378242626077, "longitude": 14.424291104078295}, "id": 454, "type": "border"}])
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
    const [hasAnimatedToUserLoc, setHasAnimatedToUserLoc] = useState(false);
    useEffect(() => {
        if (userLocation && !hasAnimatedToUserLoc) {
            animateToUserLoc(0.05);
            setHasAnimatedToUserLoc(true);
        }
    }, [userLocation, hasAnimatedToUserLoc]);

    const onMapReady = () => {
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

            // Trigger re-render by setting a state variable that depends on the updated markers
            setLootboxMarkers(updatedMarkers); // <-- Add this line to force re-render

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

    useEffect(() => {
        return
        const interval = setInterval(() => {
            // Move markers every 10 seconds
            const timeElapsed = 10; // Time elapsed in seconds
            const movedMarkers = moveBorderMarkers({
                "coords": {
                    "latitude": 50.07305079677018,
                    "longitude": 14.425703412853181
                }
            }, borderMarkers, 1);
            setBorderMarkers(movedMarkers);
        }, 200); // Interval set to 10 seconds (10000 milliseconds)

        return () => clearInterval(interval); // Cleanup function to clear the interval
    }, [borderMarkers]);

    function moveBorderMarkers(center, markers, time) {
        const distancePerSecond = 0.00001; // Adjust this value as needed for the speed of movement

        const movedMarkers = markers.map(marker => {
            // Calculate distance between marker and center point using Haversine formula
            const R = 6371e3; // meters
            const φ1 = center.coords.latitude * Math.PI / 180; // φ, λ in radians
            const φ2 = marker.coords.latitude * Math.PI / 180;
            const Δφ = (marker.coords.latitude - center.coords.latitude) * Math.PI / 180;
            const Δλ = (marker.coords.longitude - center.coords.longitude) * Math.PI / 180;

            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            const distance = R * c; // in meters

            // Calculate the distance marker needs to move towards center based on time
            const distanceToMove = distancePerSecond * time;

            // Calculate the new coordinates for the marker
            const dx = center.coords.longitude - marker.coords.longitude;
            const dy = center.coords.latitude - marker.coords.latitude;
            const angle = Math.atan2(dy, dx);
            const newLongitude = marker.coords.longitude + (distanceToMove * Math.cos(angle));
            const newLatitude = marker.coords.latitude + (distanceToMove * Math.sin(angle));

            // Return the marker with updated coordinates
            return {
                coords: {
                    latitude: newLatitude,
                    longitude: newLongitude
                },
                id: marker.id,
                type: marker.type
            };
        });

        return movedMarkers;
    }
    function moveMarkersTowardsCenter(center, markers, totalTime) {
        // Calculate the number of "virtual" frames based on total time (no actual animation)
        const fps = 2; // Adjust FPS as needed
        const totalFrames = Math.round(totalTime * fps);

        // Loop through each marker
        return markers.map(marker => {
            const {latitude: markerLat, longitude: markerLng} = marker.coords;
            const {latitude: centerLat, longitude: centerLng} = center.coords;

            // Calculate the total difference between marker and center coordinates
            const deltaLat = centerLat - markerLat;
            const deltaLng = centerLng - markerLng;

            // Calculate movement per "virtual" frame (fixed distance per step)
            const movementPerFrameLat = deltaLat / totalFrames;
            const movementPerFrameLng = deltaLng / totalFrames;

            // Create a new array to store updated coordinates (avoids object mutation)
            const newCoords = {
                latitude: markerLat,
                longitude: markerLng,
            };

            // Perform the virtual movement (no animation loop)
            for (let frame = 0; frame <= totalFrames; frame++) {
                newCoords.latitude += movementPerFrameLat;
                newCoords.longitude += movementPerFrameLng;
            }

            // Return the marker with updated coordinates
            return {
                ...marker,
                coords: newCoords,
            };
        });
    }


    const markerBottomSheet = () => {
        return (
            <View className={"flex-col p-3 items-center"}>
                <Text className={"text-4xl font-black text-center capitalize mb-1"}>
                    {bottomSheetData.type + " " + bottomSheetData.id}</Text>
                <Text className={"text-lg text-center"}>
                    Latitude: {bottomSheetData ? bottomSheetData.coords.latitude : defaultBottomSheet()}</Text>
                <Text className={"text-lg text-center"}>
                    Longitude: {bottomSheetData ? bottomSheetData.coords.longitude : defaultBottomSheet()}</Text>

                {bottomSheetData.type == "lootbox" ? <View className={"min-w-[80%]"}>
                    <Text className={"text-3xl mt-4 text-center underline"}>Containments</Text>

                    {bottomSheetData.items.length != 0 ? <View className={"justify-center items-center mt-2"}>
                        {//li here*
                        }
                        {bottomSheetData.items.map((curr, index) => {
                            return <View key={"item-" + index}
                                         className={"flex-row items-center p-3 bg-gray-100 w-[90%] border-b rounded-lg border-gray-300 shadow-2xl"}>
                                <Text className={"text-2xl mr-auto"}>&#8226; {curr.name}</Text>
                                <TouchableOpacity activeOpacity={1} onPress={() => removeFromLootbox(curr.name)}>
                                    <Feather key={"removeItem-" + index} name="trash-2" size={30} color="red"/>
                                </TouchableOpacity>
                            </View>
                        })}
                    </View> : <Text className={"text-red-700 text-center text-xl"}>Lootbox is empty</Text>
                    }


                    <View className="flex-row items-center justify-between bg-gray-300 p-3 rounded-lg mt-5">
                        <BottomSheetTextInput
                            value={newLootboxItemValue}
                            onChangeText={setNewLootboxItemValue}
                            placeholder="Item name"
                            maxLength={20}
                            className="bg-white  text-lg rounded mr-auto flex-grow "
                        />
                        <TouchableOpacity
                            className="bg-black rounded-full p-3"
                            activeOpacity={1}
                            onPress={addToLootbox}>
                            <AntDesign name="plus" size={26} color="lime"/>
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