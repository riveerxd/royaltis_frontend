export default function moveBorder(center, markers, time) {
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