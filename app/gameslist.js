import {ActivityIndicator, ScrollView, Text, ToastAndroid, TouchableOpacity, View} from "react-native";
import {customMapStyle} from "./styles/mapStyles";
import MapView, {Marker, Polygon} from "react-native-maps";
import {AntDesign} from "@expo/vector-icons";
import axios from "axios";
import {useEffect, useState} from "react"
import {findMiddlePoint, getInitialRegion} from "../src/utilities/Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ipAddress} from "./constants";

export default function GameList() {

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([[],[],[]])
    const getToken = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                return token; // Return the token if found
            } else {
                console.log("No token found in AsyncStorage");
                return null; // Or handle the case where no token is found
            }
        } catch (error) {
            console.error("Error retrieving token:", error);
            return null; // Or handle the error appropriately
        }
    };

    const fetchData = async () =>{
        setLoading(true)
        try{
            axios.defaults.headers.common = {
                "Authorization": "fK/na9RvJZPfevoC0IkVNz7S2MA4plEno/R+9hMGhnY=",
                "Content-Type": "application/json"
            };
            console.log("sending token: "+JSON.stringify(getToken()))
            const response = await axios.get("http://"+ipAddress+":8080/gamelist")


            if (response.status === 200 || response.status === 201){
                console.log("data retrieved")
                setData(response.data)
                ToastAndroid.show("Data successfully retrieved!", ToastAndroid.SHORT)
            }else{
                console.log("Error uploading data", response.status, response.data)
                ToastAndroid.show("Error "+response.data, ToastAndroid.SHORT)
            }

        }catch (error){
            console.log(error)
            ToastAndroid.show("Error "+error, ToastAndroid.SHORT)
        }finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    const gameData = data[0]
    const borderData = data[1]
    const lootboxData = data[2]

    const polygonCoordinates = (data) => data.map(point => point.coords);
    return (
        <ScrollView className={"flex-1 p-1 bg-[#393E46]"} style={{flex: 1}}>
            {
                data[0].length !==0 ?
                gameData.map((currGd, index) =>{
                    return <View className={"bg-[#4D5B66] p-1 rounded-xl mb-5"} key={index}>
                        <View className={"flex-1"} style={{borderRadius: 10, overflow: "hidden"}}>
                            <MapView
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
                                        if (curr.gameId === currGd.gameId){
                                            return <Marker
                                                key={curr.id}
                                                coordinate={{latitude: curr.coords.latitude, longitude: curr.coords.longitude}}
                                                anchor={{x: 0.5, y: 0.5}}
                                                icon={require("../assets/icons/dot_optimized.png")}
                                                onPress={(event) => event.stopPropagation()}
                                            >
                                            </Marker>
                                        }
                                    })
                                }

                                {

                                    <Marker
                                        coordinate={findMiddlePoint(borderData.filter((curr) => curr.gameId === currGd.gameId), null).coords}
                                        icon={require("../assets/icons/center(1).png")}
                                    >
                                    </Marker>


                                }

                                {
                                    lootboxData.map((curr) => {
                                        if (curr.gameId === currGd.gameId){
                                            return <Marker
                                                onSelect={(event) => event.stopPropagation()}
                                                key={curr.id}
                                                coordinate={curr.coords}
                                                anchor={{x: 0.5, y: 0.5}}
                                                icon={require("../assets/icons/lootbox_optimized(2).png")}
                                            >
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
                                <TouchableOpacity className={"bg-transparent border-2 border-[#00ADB5] px-5 rounded-xl flex-row p-2 "}>
                                    <AntDesign name="arrowright" size={24} color="#00ADB5" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                }) :
                    <View className={"items-center mt-3"}>
                        <Text className={"text-3xl font-azonix text-white"}>Loading templates</Text>
                        <ActivityIndicator size={40} color={"#00ADB5"}/>
                    </View>
            }
        </ScrollView>
    )
}
