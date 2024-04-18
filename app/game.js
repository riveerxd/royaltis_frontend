import React, {createRef, useEffect, useState} from "react";
import { io } from "socket.io-client";
import {Text, TouchableOpacity, View} from "react-native"
import MapView, {Marker, Polygon} from "react-native-maps";
import {MaterialIcons} from "@expo/vector-icons";
export default function Game() {
    const [currentBorders, setCurrentBorders] = useState([])

    const [data, setData] = useState([
        {
            "coords": {"latitude": 50.074474871857205, "longitude": 14.425810240209103},
            "id": 466, "type": "border"
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
    useEffect(() => {
        setCurrentBorders(data)
    }, [data]);

    useEffect(() => {
        // Replace 'http://' with 'ws://' for non-secure WebSocket connection
        const socket = io('http://192.168.0.243:9090');

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
            // Send initial data or emit events if needed
            socket.emit('clientConnected', { message: 'Hello from Expo app' });
        });

        socket.on('borders', (data) => {
            console.log('Received borders from server:', data);
            if (Array.isArray(JSON.parse(data))) {
                setCurrentBorders(JSON.parse(data));
            } else {
                console.error('Received invalid data format for borders. Expecting an array.');
            }
        });

        return () => {
            // Cleanup: disconnect from the Socket.IO server
            socket.disconnect();
            console.log('Disconnected from Socket.IO server');
        };
    }, []);

    const mapRef = createRef()
    const polygonCoordinates = currentBorders.map(point => point.coords);
    return (
        <View className={"flex-1"}>
        <MapView
        ref={mapRef}
        showsUserLocation={true}
        style={{flex:1}}
        >
            {
                currentBorders.length > 0 &&
                <Polygon
                    coordinates={polygonCoordinates}
                    fillColor="rgba(0,0,0,0)"
                    strokeColor="rgba(255,0,0,1)"
                    strokeWidth={3}
                />


            }
            {
               currentBorders.length != 0 && currentBorders ? currentBorders.map((curr) => {
                    return <Marker
                        key={curr.id}
                        coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                        anchor={{x: 0.5, y: 0.5}}
                        icon={require("../assets/icons/dot_optimized.png")}

                    >
                    </Marker>
                }) : ""
            }

        </MapView>

            <TouchableOpacity
                className={"absolute top-16 right-4 bg-white rounded-full p-3 z-10 "}
                style={{display: "block"}}
                activeOpacity={1}
            >
                <MaterialIcons name="my-location" size={30} color="black"/>
            </TouchableOpacity>
        </View>
    );


}
