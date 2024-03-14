    export const findMiddlePoint = (coordinates, idList) => {
        if (!Array.isArray(coordinates) || coordinates.length < 3) {
            return null;
        }

        let sumLat = 0;
        let sumLng = 0;

        for (const coord of coordinates) {
            sumLat += coord.coords.latitude;
            sumLng += coord.coords.longitude;
        }

        const averageLat = sumLat / coordinates.length;
        const averageLng = sumLng / coordinates.length;

        const middlePoint = {
            id: getRandomId(idList),
            coords: {
                latitude: averageLat,
                longitude: averageLng
            },
        };
        return middlePoint;
    }

    export const getRandomId = (idList) => {
    console.log(idList)
    try{
        let randomNum = Math.round(Math.random() * (1000))
        while (idList.includes(randomNum)) {
            randomNum = Math.round(Math.random() * (1000))
        }
        idList.push(randomNum)
        return randomNum
    }catch (e){
        console.error(e)
    }

    }

    export const getDistance = (coord1, coord2) => {
        const {latitude: lat1, longitude: lon1} = coord1;
        const {latitude: lat2, longitude: lon2} = coord2;
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }
