import React, {createRef, useEffect, useMemo, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import MapView, {Marker, Polygon} from 'react-native-maps';
import {BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {getCurrentPositionAsync, requestForegroundPermissionsAsync} from "expo-location";
import {Entypo, Feather, FontAwesome, FontAwesome5, MaterialIcons} from "@expo/vector-icons";
const App = () => {

    const [bottomSheetData, setBottomSheetData] = useState(null)
    const snapPoint = useMemo(() => ["25%", "50%", "70%"], [])
    const mapRef = createRef()
    const popupRef = createRef()
    const [userLocation, setUserLocation] = useState(null);

    const [idList, setIdList] = useState([])

    const getRandomId = () => {
        let randomNum = Math.round(Math.random() * (1000))
        while(idList.includes(randomNum)){
            randomNum = Math.round(Math.random() * (1000))
        }
        idList.push(randomNum)
        return randomNum

    }
    const handleMapPress = (e) => {
        const coords = e.nativeEvent.coordinate

        if (brush){
            setBorderMarkers((prevBor) => {
                const newElement = {
                    id: getRandomId(),
                    coords: coords
                };

                return [...prevBor, newElement];
            });
        }else {
            setUnassignedMarkers((prevUnassignedMarkers) => {
                const newElement = {
                    id: getRandomId(),
                    coords: coords
                };
                return [...prevUnassignedMarkers, newElement];
            });
        }

    }

    const handlePopup = (obj) => {
        setBottomSheetData(obj)
        popupRef.current.present()
    }

    const [unassignedMarkers, setUnassignedMarkers] = useState([])
    const [borderMarkers, setBorderMarkers] = useState([])
    const [lootboxMarkers, setLootboxMarkers] = useState([])

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

    const animateToUserLoc = (delta) =>{
        mapRef.current.animateToRegion({
            longitude: userLocation.longitude,
            latitude: userLocation.latitude,
            latitudeDelta: delta,
            longitudeDelta: delta,
        }, 1000)
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

    useEffect(() => {
        openBottomSheetModal()
    }, [bottomSheetData]);

    const [gameName, setGameName] = useState('');

    const [brush, setBrush] = useState(false)

    const handleBrushPress = () => {
        setBrush(!brush)
    }

    const defaultBottomSheet = () => {
        return (
            <View className={"flex-1 flex-col items-center"}>

                <Text className={"text-4xl font-bold"}>Map creator</Text>
                <BottomSheetTextInput
                    value={gameName}
                    onChangeText={setGameName}
                    placeholder="Type something here..."
                />

            </View>
        )
    }
    const removeMarkerButton = () => {
        setUnassignedMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setBorderMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== bottomSheetData.id));
        setBottomSheetData(null)

        for (let i = 0; i < idList.length; i++){
            if (idList[i] == bottomSheetData.id){
                idList.splice(i, 1);
                break;
            }
        }
    };


    const markerBottomSheet = () => {
        return (
            <View className={"flex-col p-3 items-center"}>
                <Text className={"text-2xl text-center"}>Marker
                    id: {bottomSheetData ? bottomSheetData.id : defaultBottomSheet()}</Text>
                <Text
                    className={"text-lg text-center"}>Latitude: {bottomSheetData ? bottomSheetData.coords.latitude : defaultBottomSheet()}</Text>
                <Text
                    className={"text-lg text-center"}>Longitude: {bottomSheetData ? bottomSheetData.coords.longitude : defaultBottomSheet()}</Text>
                <View className={"flex-row w-[60%] items-center justify-evenly mt-5"}>
                    <TouchableOpacity className={"bg-black rounded-full p-3"} activeOpacity={1} onPress={removeMarkerButton}>
                        <Feather name="trash-2" size={24} color="red"/>
                    </TouchableOpacity>
                    <TouchableOpacity className={"bg-black rounded-full p-3"} activeOpacity={1}>
                        <FontAwesome5 name="compress-arrows-alt" size={24} color="white"/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <GestureHandlerRootView className={"flex-1"}>

            <BottomSheetModalProvider>

                <BottomSheetModal
                    ref={popupRef}
                    index={0}
                    snapPoints={snapPoint}
                    enablePanDownToClose={false}
                >

                    {bottomSheetData ? markerBottomSheet() : defaultBottomSheet()}

                </BottomSheetModal>
                <MapView
                    ref={mapRef}
                    initialRegion={userLocation}
                    showsUserLocation={true}
                    className={"flex-1 w-full h-full justify-center items-center"}
                    onPress={handleMapPress}
                    onMapReady={onMapReady}
                    showsMyLocationButton={false}
                    showsCompass={false}
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


                            >
                                <FontAwesome5 name="question-circle" size={26} color="black" />
                            </Marker>
                        })
                    }

                    {
                        borderMarkers.map((curr) =>{
                            return <Marker
                            key={curr.id}
                            coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                            onPress={() => handlePopup(curr)}
                            anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <FontAwesome name="dot-circle-o" size={20} color="red" />
                            </Marker>
                        })
                    }


                </MapView>
            </BottomSheetModalProvider>

            <TouchableOpacity
                className={"absolute top-16 left-4 bg-white rounded-full p-3"}
                activeOpacity={1}
            >
                <Entypo name="menu" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
                className={"absolute top-16 right-4 bg-white rounded-full p-3"}
                activeOpacity={1}
                onPress={() => animateToUserLoc(0.009)}
            >
            <MaterialIcons name="my-location" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
                className={"absolute top-32 right-4 bg-white rounded-full p-3"}
                onPress={handleBrushPress}
                activeOpacity={1}
            >
                <FontAwesome name="paint-brush" size={30} color={brush ? "blue" : "black"}/>
            </TouchableOpacity>


        </GestureHandlerRootView>
    );
};
export default App;