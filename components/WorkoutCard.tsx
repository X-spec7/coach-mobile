import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface WorkoutProps {
    workout: {
        id: string
        title: string
        duration: string
        level: string
        image: string
    }
    small?: boolean
}

const WorkoutCard = ({ workout, small = false }: WorkoutProps) => {
    if (small) {
        return (
            <TouchableOpacity style={styles.smallCard}>
                <Image source={{ uri: workout.image }} style={styles.smallImage} />
                <View style={styles.smallContent}>
                    <Text style={styles.smallTitle} numberOfLines={1}>
                        {workout.title}
                    </Text>
                    <View style={styles.smallDetails}>
                        <Text style={styles.smallDetail}>{workout.duration}</Text>
                        <Text style={styles.smallDetail}>{workout.level}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity style={styles.card}>
            <ImageBackground source={{ uri: workout.image }} style={styles.image} imageStyle={styles.imageStyle}>
                <View style={styles.overlay}>
                    <View style={styles.content}>
                        <Text style={styles.title}>{workout.title}</Text>
                        <View style={styles.details}>
                            <View style={styles.detail}>
                                <Ionicons name="time-outline" size={14} color="white" />
                                <Text style={styles.detailText}>{workout.duration}</Text>
                            </View>
                            <View style={styles.detail}>
                                <Ionicons name="fitness-outline" size={14} color="white" />
                                <Text style={styles.detailText}>{workout.level}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        width: 280,
        height: 180,
        borderRadius: 15,
        overflow: "hidden",
        marginRight: 15,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imageStyle: {
        borderRadius: 15,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-end",
    },
    content: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginBottom: 10,
    },
    details: {
        flexDirection: "row",
    },
    detail: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },
    detailText: {
        fontSize: 12,
        color: "white",
        marginLeft: 5,
    },
    smallCard: {
        width: "48%",
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    smallImage: {
        width: "100%",
        height: 100,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    smallContent: {
        padding: 10,
    },
    smallTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    smallDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    smallDetail: {
        fontSize: 12,
        color: "#666",
    },
})

export default WorkoutCard

